import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import bcrypt from "bcrypt";
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import path from "node:path";
import mongoose from "mongoose";
import {
  Admin,
  Session,
  Site,
  Project,
  Inquiry,
  Upload,
  serializeProject,
} from "./models.js";
import {
  parse,
  siteSchema,
  projectSchema,
  inquirySchema,
  loginSchema,
  reorderSchema,
} from "./validation.js";
import { localStorageAdapter, saveUpload } from "./storage.js";
import { validTheme } from "../shared/themes.js";
import { appearanceSchema } from "./validation.js";
const unsafe = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const cookieName = "portfolio_session";
const fail = (status, message) => Object.assign(new Error(message), { status });
function same(a, b) {
  const aa = Buffer.from(a || ""),
    bb = Buffer.from(b || "");
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
export function createApp(config) {
  const app = express(),
    storage = localStorageAdapter(config.uploadDir);
  const hash = (value) =>
    createHmac("sha256", config.secret).update(value).digest("hex");
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          mediaSrc: ["'self'", "https:"],
          frameSrc: [
            "'self'",
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
          ],
          objectSrc: ["'self'"],
          upgradeInsecureRequests: config.production ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.origins.includes(origin)) callback(null, true);
        else callback(fail(403, "This origin is not allowed."));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "150kb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (unsafe.has(req.method) && !config.origins.includes(req.get("origin")))
      return next(fail(403, "A trusted Origin header is required."));
    next();
  });
  const limit = (max, windowMs) =>
    rateLimit({
      max,
      windowMs,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
    });
  app.get("/api/health", (req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ ready: mongoose.connection.readyState === 1 }),
  );
  app.use("/api", async (req, res, next) => {
    const cookie = req.headers.cookie
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    if (cookie && /^[a-f0-9]{64}$/.test(cookie))
      req.authSession = await Session.findOne({
        _id: hash(cookie),
        expiresAt: { $gt: new Date() },
      }).lean();
    next();
  });
  async function newSession(res, adminId) {
    const token = randomBytes(32).toString("hex"),
      csrf = randomBytes(32).toString("hex");
    await Session.create({
      _id: hash(token),
      csrf,
      adminId,
      expiresAt: new Date(Date.now() + (adminId ? 8 : 1) * 3600000),
    });
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: config.production,
      sameSite: "strict",
      path: "/api",
      maxAge: (adminId ? 8 : 1) * 3600000,
    });
    return csrf;
  }
  const csrfGuard = (req, res, next) => {
    if (
      !req.authSession ||
      !same(req.authSession.csrf, req.get("x-csrf-token"))
    )
      return next(fail(403, "Security token expired. Refresh and retry."));
    next();
  };
  const adminGuard = (req, res, next) => {
    if (req.authSession?.adminId !== "administrator")
      return next(fail(401, "Please sign in."));
    next();
  };
  app.get("/api/csrf", limit(60, 60000), async (req, res) =>
    res.json({ csrf: req.authSession?.csrf || (await newSession(res)) }),
  );
  app.get("/api/auth/me", adminGuard, (req, res) =>
    res.json({ authenticated: true, csrf: req.authSession.csrf }),
  );
  app.post(
    "/api/auth/login",
    limit(8, 15 * 60000),
    csrfGuard,
    async (req, res) => {
      const data = parse(loginSchema, req.body),
        admin = await Admin.findById("administrator").select("+passwordHash");
      const valid = await bcrypt.compare(
        data.password,
        admin?.passwordHash ||
          "$2b$12$eImiTXuWVxfM37uY4JANjOum7o.HsNhMhSNxlIbvs1PLdjhEAjsHS",
      );
      if (!admin || admin.email !== data.email.toLowerCase() || !valid)
        throw fail(401, "Email or password is incorrect.");
      await Session.deleteOne({ _id: req.authSession._id });
      res.json({ csrf: await newSession(res, admin._id), authenticated: true });
    },
  );
  app.post("/api/auth/logout", adminGuard, csrfGuard, async (req, res) => {
    await Session.deleteOne({ _id: req.authSession._id });
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: config.production,
      sameSite: "strict",
      path: "/api",
    });
    res.json({ ok: true });
  });
  app.get("/api/site", async (req, res) => {
    const site = await Site.findById("portfolio").lean();
    if (!site) throw fail(503, "Portfolio content has not been initialized.");
    res.json(site.content);
  });
  const readAppearance = async () => {
    const site = await Site.findById("portfolio").select("appearance").lean();
    return { theme: validTheme(site?.appearance?.theme) };
  };
  app.get("/api/appearance", async (req, res) => res.json(await readAppearance()));
  // A parser-blocking, same-origin script applies the DB default before first paint.
  // Only validated enum values are interpolated; no secrets or site content are exposed.
  app.get("/api/theme.js", async (req, res) => {
    const { theme } = await readAppearance();
    res.type("application/javascript").send(`document.documentElement.dataset.theme=${JSON.stringify(theme)};`);
  });
  app.get("/api/projects", async (req, res) =>
    res.json(
      (
        await Project.find({ published: true })
          .sort({ order: 1, _id: 1 })
          .lean()
      ).map(serializeProject),
    ),
  );
  app.get("/api/projects/:slug", async (req, res) => {
    const project = await Project.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();
    if (!project) throw fail(404, "Project not found.");
    res.json(serializeProject(project));
  });
  app.post(
    "/api/contact",
    limit(5, 15 * 60000),
    csrfGuard,
    async (req, res) => {
      const { website, ...data } = parse(inquirySchema, req.body);
      await Inquiry.create(data);
      res
        .status(201)
        .json({
          message: "Your inquiry has been saved. Thank you for reaching out.",
        });
    },
  );
  const mediaReferences = async (src, publishedOnly) => {
    const [site, projects] = await Promise.all([
      Site.findById("portfolio").lean(),
      Project.find(publishedOnly ? { published: true } : {}).lean(),
    ]);
    return (
      Boolean(
        site &&
        [site.content.person.portrait, site.content.person.resumePdf].includes(
          src,
        ),
      ) ||
      projects.some((p) => p.content.screenshots.some((s) => s.src === src))
    );
  };
  async function verifyMedia(content, isSite = false) {
    const refs = isSite
      ? [
          { src: content.person.portrait, kind: "image" },
          { src: content.person.resumePdf, kind: "pdf" },
        ]
      : content.screenshots.map((s) => ({ src: s.src, kind: "image" }));
    for (const ref of refs.filter((r) => r.src)) {
      const upload = await Upload.findById(ref.src.split("/").pop()).lean();
      if (!upload || upload.kind !== ref.kind)
        throw fail(
          422,
          "An attached file is missing or has the wrong type. Upload it again.",
        );
    }
  }
  app.get("/api/media/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      throw fail(404, "File not found.");
    const upload = await Upload.findById(req.params.id).lean();
    const src = `/api/media/${req.params.id}`;
    if (
      !upload ||
      (req.authSession?.adminId !== "administrator" &&
        !(await mediaReferences(src, true)))
    )
      throw fail(404, "File not found.");
    res.type(upload.mime);
    res.set(
      "Content-Disposition",
      `${req.query.download === "1" ? "attachment" : "inline"}; filename="${upload.kind === "pdf" ? "resume.pdf" : "image.webp"}"`,
    );
    if (upload.kind === "pdf")
      res.set("Content-Security-Policy", "sandbox; default-src 'none'");
    res.sendFile(storage.path(upload.filename), { dotfiles: "allow" }, (e) => {
      if (e && !res.headersSent)
        res.status(404).json({ error: "File is unavailable." });
    });
  });
  const router = express.Router();
  router.use(adminGuard);
  router.use((req, res, next) =>
    unsafe.has(req.method) ? csrfGuard(req, res, next) : next(),
  );
  router.get("/appearance", async (req, res) => res.json(await readAppearance()));
  router.put("/appearance", async (req, res) => {
    const appearance = parse(appearanceSchema, req.body);
    const site = await Site.findByIdAndUpdate("portfolio", { $set: { appearance } }, { new: true, runValidators: true });
    if (!site) throw fail(503, "Initialize portfolio content before saving appearance.");
    res.json({ theme: site.appearance.theme });
  });
  router.get("/site", async (req, res) =>
    res.json((await Site.findById("portfolio").lean())?.content || null),
  );
  router.put("/site", async (req, res) => {
    const content = parse(siteSchema, req.body);
    await verifyMedia(content, true);
    await Site.findOneAndUpdate(
      { _id: "portfolio" },
      { content },
      { upsert: true, runValidators: true },
    );
    res.json(content);
  });
  router.get("/projects", async (req, res) =>
    res.json(
      (await Project.find().sort({ order: 1, _id: 1 }).lean()).map(
        serializeProject,
      ),
    ),
  );
  router.post("/projects", async (req, res) => {
    const { slug, published, featured, order, ...content } = parse(
      projectSchema,
      req.body,
    );
    await verifyMedia(content);
    const p = await Project.create({
      slug,
      published,
      featured,
      order,
      content,
    });
    res.status(201).json(serializeProject(p));
  });
  router.put("/projects/reorder", async (req, res) => {
    const { ids } = parse(reorderSchema, req.body);
    const count = await Project.countDocuments();
    if (
      ids.length !== count ||
      (await Project.countDocuments({ _id: { $in: ids } })) !== count
    )
      throw fail(422, "The project list changed. Refresh before reordering.");
    if (ids.length)
      await Project.bulkWrite(
        ids.map((id, i) => ({
          updateOne: { filter: { _id: id }, update: { $set: { order: i } } },
        })),
      );
    res.json({ ok: true });
  });
  router.param("id", (req, res, next, id) => {
    if (!mongoose.isValidObjectId(id))
      return next(fail(404, "Item not found."));
    next();
  });
  router.put("/projects/:id", async (req, res) => {
    const { slug, published, featured, order, ...content } = parse(
      projectSchema,
      req.body,
    );
    await verifyMedia(content);
    const p = await Project.findByIdAndUpdate(
      req.params.id,
      { slug, published, featured, order, content },
      { new: true, runValidators: true },
    );
    if (!p) throw fail(404, "Project not found.");
    res.json(serializeProject(p));
  });
  router.delete("/projects/:id", async (req, res) => {
    if (req.get("x-confirm-delete") !== req.params.id)
      throw fail(422, "Deletion confirmation is required.");
    if (!(await Project.findByIdAndDelete(req.params.id)))
      throw fail(404, "Project not found.");
    res.json({ ok: true });
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 1, parts: 2 },
  });
  router.post(
    "/uploads",
    limit(30, 60000),
    upload.single("file"),
    async (req, res) =>
      res.status(201).json(await saveUpload(req.file, req.body.kind, storage)),
  );
  router.get("/uploads", async (req, res) =>
    res.json(
      (await Upload.find().sort({ createdAt: -1 }).lean()).map((u) => ({
        _id: String(u._id),
        src: `/api/media/${u._id}`,
        kind: u.kind,
        width: u.width,
        height: u.height,
        originalName: u.originalName,
        size: u.size,
      })),
    ),
  );
  router.delete("/uploads/:id", async (req, res) => {
    if (req.get("x-confirm-delete") !== req.params.id)
      throw fail(422, "Deletion confirmation is required.");
    if (await mediaReferences(`/api/media/${req.params.id}`, false))
      throw fail(
        409,
        "This file is attached to content. Remove the attachment and save first.",
      );
    const u = await Upload.findById(req.params.id);
    if (!u) throw fail(404, "File not found.");
    await storage.remove(u.filename);
    await u.deleteOne();
    res.json({ ok: true });
  });
  router.get("/inquiries", async (req, res) => {
    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(req.query.page, 10) || 1),
    );
    const [items, total] = await Promise.all([
      Inquiry.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * 30)
        .limit(30)
        .lean(),
      Inquiry.countDocuments(),
    ]);
    res.json({ items, total, page });
  });
  router.patch("/inquiries/:id", async (req, res) => {
    if (
      !["unread", "read", "archived"].includes(req.body?.status) ||
      Object.keys(req.body).length !== 1
    )
      throw fail(422, "Choose a valid inquiry status.");
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    ).lean();
    if (!inquiry) throw fail(404, "Inquiry not found.");
    res.json(inquiry);
  });
  app.use("/api/admin", router);
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "API endpoint not found." }),
  );
  if (config.production) {
    app.use(express.static(path.resolve("dist"), { index: false }));
    app.get("/{*path}", (req, res) =>
      res.sendFile(path.resolve("dist/index.html")),
    );
  }
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    let status = err.status || 500,
      message = err.message;
    if (err.code === 11000) {
      status = 409;
      message = "This project URL is already in use.";
    }
    if (err instanceof multer.MulterError) {
      status = 422;
      message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Files must be 8 MB or smaller."
          : "Upload one file at a time.";
    }
    if (status === 500) {
      message = "The request could not be completed. Please try again.";
      console.error(err.name, err.code || "server-error");
    }
    res
      .status(status)
      .json({ error: message, ...(err.fields ? { fields: err.fields } : {}) });
  });
  return app;
}
