import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import sharp from "sharp";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import { Admin, Session, Project, Inquiry, Site } from "../models.js";
import { initialProjects, initialSite, seedContent } from "../seed-content.js";
let mongo, app, agent, token, directory;
const origin = "http://127.0.0.1:5173",
  password = "Testing-only-passphrase-2026";
before(
  async () => {
    directory = await mkdtemp(path.resolve(".cache-test-"));
    mongo = await MongoMemoryServer.create({
      binary: { downloadDir: path.resolve(".cache/mongodb") },
    });
    await mongoose.connect(mongo.getUri());
    await Promise.all([Admin.init(), Project.init(), Session.init()]);
    await seedContent();
    await Admin.create({
      _id: "administrator",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash(password, 12),
    });
    app = createApp({
      production: false,
      secret: "test-secret-with-at-least-thirty-two-characters",
      origins: [origin],
      uploadDir: directory,
      trustProxy: false,
    });
    agent = request.agent(app);
    token = (await agent.get("/api/csrf").expect(200)).body.csrf;
  },
  { timeout: 300000 },
);
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
});
const mutate = (method, url) =>
  agent[method](url).set("Origin", origin).set("X-CSRF-Token", token);
test("repeat-safe seed preserves edits and feature accuracy", async () => {
  await Site.updateOne(
    { _id: "portfolio" },
    { $set: { "content.hero.headline": "Edited headline" } },
  );
  await seedContent();
  assert.equal(
    (await Site.findById("portfolio")).content.hero.headline,
    "Edited headline",
  );
  assert.equal(await Project.countDocuments(), 3);
  assert.equal(initialProjects[0].implementedFeatures.length, 0);
  assert.ok(initialProjects[1].plannedFeatures.some((f) => f.includes("AI")));
  await Site.updateOne(
    { _id: "portfolio" },
    { $set: { content: initialSite } },
  );
});
test("all admin routes reject anonymous requests; registration does not exist", async () => {
  for (const [method, url] of [
    ["get", "/api/admin/site"],
    ["get", "/api/admin/appearance"],
    ["put", "/api/admin/appearance"],
    ["put", "/api/admin/site"],
    ["get", "/api/admin/projects"],
    ["post", "/api/admin/projects"],
    ["delete", "/api/admin/projects/123456789012345678901234"],
    ["get", "/api/admin/uploads"],
    ["post", "/api/admin/uploads"],
    ["get", "/api/admin/inquiries"],
  ])
    await request(app)[method](url).set("Origin", origin).expect(401);
  await request(app)
    .post("/api/auth/register")
    .set("Origin", origin)
    .expect(404);
});
test("login requires CSRF and trusted origin, rejects bad credentials, rotates session", async () => {
  await agent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: "admin@example.com", password })
    .expect(403);
  await mutate("post", "/api/auth/login")
    .set("Origin", "https://evil.example")
    .send({ email: "admin@example.com", password })
    .expect(403);
  await mutate("post", "/api/auth/login")
    .send({ email: "admin@example.com", password: "wrong" })
    .expect(401);
  const old = token,
    result = await mutate("post", "/api/auth/login")
      .send({ email: "admin@example.com", password })
      .expect(200);
  token = result.body.csrf;
  assert.notEqual(old, token);
  assert.match(result.headers["set-cookie"][0], /HttpOnly/);
  assert.match(result.headers["set-cookie"][0], /SameSite=Strict/);
  assert.equal(
    (await agent.get("/api/auth/me").expect(200)).body.authenticated,
    true,
  );
  await agent
    .put("/api/admin/site")
    .set("Origin", origin)
    .send(initialSite)
    .expect(403);
});
test("appearance validates, requires CSRF, persists for new visits, and survives content saves", async () => {
  assert.equal((await request(app).get("/api/appearance").expect(200)).body.theme, "dark-ember");
  await agent.put("/api/admin/appearance").set("Origin", origin).send({ theme: "clean-white" }).expect(403);
  for (const theme of ["dark-ember", "clean-white", "midnight-navy", "warm-ivory"]) {
    assert.equal((await mutate("put", "/api/admin/appearance").send({ theme }).expect(200)).body.theme, theme);
    assert.equal((await Site.findById("portfolio").lean()).appearance.theme, theme);
    assert.equal((await request(app).get("/api/appearance").expect(200)).body.theme, theme);
    const script = await request(app).get("/api/theme.js").expect(200);
    assert.match(script.headers["content-type"], /javascript/);
    assert.equal(script.headers["cache-control"], "no-store");
    assert.equal(script.text, `document.documentElement.dataset.theme=${JSON.stringify(theme)};`);
    await mutate("put", "/api/admin/site").send(initialSite).expect(200);
    await seedContent();
    assert.equal((await agent.get("/api/admin/appearance").expect(200)).body.theme, theme);
  }
  for (const body of [{ theme: "system" }, { theme: "<script>" }, { theme: "clean-white", extra: true }]) await mutate("put", "/api/admin/appearance").send(body).expect(422);
  assert.equal((await request(app).get("/api/appearance")).body.theme, "warm-ivory");
});
let draft;
test("project CRUD, draft privacy, publishing, validation, reordering and confirmation", async () => {
  const body = {
    ...initialProjects[0],
    slug: "test-private",
    name: "Private test project",
    published: false,
  };
  draft = (await mutate("post", "/api/admin/projects").send(body).expect(201))
    .body;
  await request(app).get("/api/projects/test-private").expect(404);
  assert.ok(
    !(await request(app).get("/api/projects")).body.some(
      (p) => p.slug === "test-private",
    ),
  );
  await mutate("post", "/api/admin/projects").send(body).expect(409);
  await mutate("put", `/api/admin/projects/${draft._id}`)
    .send({ ...body, liveUrl: "javascript:alert(1)" })
    .expect(422);
  draft = (
    await mutate("put", `/api/admin/projects/${draft._id}`)
      .send({ ...body, published: true })
      .expect(200)
  ).body;
  await request(app).get("/api/projects/test-private").expect(200);
  draft = (
    await mutate("put", `/api/admin/projects/${draft._id}`)
      .send({ ...body, published: false })
      .expect(200)
  ).body;
  await request(app).get("/api/projects/test-private").expect(404);
  const all = (await agent.get("/api/admin/projects")).body;
  await mutate("put", "/api/admin/projects/reorder")
    .send({ ids: all.map((p) => p._id).reverse() })
    .expect(200);
  assert.equal(
    (await agent.get("/api/admin/projects")).body[0]._id,
    all.at(-1)._id,
  );
  await mutate("delete", `/api/admin/projects/${draft._id}`).expect(422);
});
test("upload validation, optimization, draft media privacy, publish visibility and safe deletion", async () => {
  const image = await sharp({
    create: { width: 40, height: 30, channels: 3, background: "#ff8854" },
  })
    .png()
    .toBuffer();
  let result = await mutate("post", "/api/admin/uploads")
    .field("kind", "image")
    .attach("file", image, {
      filename: "screenshot.png",
      contentType: "image/png",
    })
    .expect(201);
  const upload = result.body;
  assert.equal(upload.width, 40);
  await request(app).get(upload.src).expect(404);
  await agent
    .get(upload.src)
    .expect(200)
    .expect("Content-Type", /image\/webp/);
  await mutate("post", "/api/admin/uploads")
    .field("kind", "image")
    .attach("file", Buffer.from("<svg/>"), {
      filename: "fake.png",
      contentType: "image/png",
    })
    .expect(422);
  await mutate("post", "/api/admin/uploads")
    .field("kind", "image")
    .attach("file", Buffer.alloc(8 * 1024 * 1024 + 1), {
      filename: "huge.png",
      contentType: "image/png",
    })
    .expect(422);
  const { _id, updatedAt, ...content } = draft,
    withScreenshot = {
      ...content,
      screenshots: [
        { src: upload.src, alt: "Test screenshot", width: 40, height: 30 },
      ],
    };
  await mutate("put", `/api/admin/projects/${draft._id}`)
    .send(withScreenshot)
    .expect(200);
  await request(app).get(upload.src).expect(404);
  await mutate("delete", `/api/admin/uploads/${upload._id}`)
    .set("X-Confirm-Delete", upload._id)
    .expect(409);
  await mutate("put", `/api/admin/projects/${draft._id}`)
    .send({ ...withScreenshot, published: true })
    .expect(200);
  await request(app).get(upload.src).expect(200);
  await mutate("put", `/api/admin/projects/${draft._id}`)
    .send({ ...withScreenshot, published: false })
    .expect(200);
  await request(app).get(upload.src).expect(404);
  await mutate("delete", `/api/admin/projects/${draft._id}`)
    .set("X-Confirm-Delete", draft._id)
    .expect(200);
  await mutate("delete", `/api/admin/uploads/${upload._id}`)
    .set("X-Confirm-Delete", upload._id)
    .expect(200);
  const pdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
  result = await mutate("post", "/api/admin/uploads")
    .field("kind", "pdf")
    .attach("file", pdf, {
      filename: "resume.pdf",
      contentType: "application/pdf",
    })
    .expect(201);
  await mutate("put", "/api/admin/site")
    .send({
      ...initialSite,
      person: { ...initialSite.person, resumePdf: result.body.src },
    })
    .expect(200);
  await request(app)
    .get(result.body.src + "?download=1")
    .expect(200)
    .expect("Content-Disposition", /attachment/);
  await mutate("post", "/api/admin/uploads")
    .field("kind", "pdf")
    .attach("file", Buffer.from("fake"), {
      filename: "fake.pdf",
      contentType: "application/pdf",
    })
    .expect(422);
});
test("contacts validate, persist privately, and support read/archive", async () => {
  const visitor = request.agent(app),
    csrf = (await visitor.get("/api/csrf")).body.csrf;
  const send = (body) =>
    visitor
      .post("/api/contact")
      .set("Origin", origin)
      .set("X-CSRF-Token", csrf)
      .send(body);
  await send({
    name: "Alex",
    email: "invalid",
    subject: "Hello",
    message: "A sufficiently long message",
  }).expect(422);
  const message = {
    name: "Alex",
    email: "alex@example.com",
    subject: "Internship",
    message: "A real inquiry for the API test",
    website: "",
  };
  await send(message).expect(201);
  const saved = await Inquiry.findOne({ email: message.email });
  assert.ok(saved);
  await request(app).get("/api/admin/inquiries").expect(401);
  assert.equal(
    (await agent.get("/api/admin/inquiries").expect(200)).body.total,
    1,
  );
  await mutate("patch", `/api/admin/inquiries/${saved._id}`)
    .send({ status: "read" })
    .expect(200);
  await mutate("patch", `/api/admin/inquiries/${saved._id}`)
    .send({ status: "archived" })
    .expect(200);
  assert.equal((await Inquiry.findById(saved._id)).status, "archived");
  await send({ ...message, website: "bot.example" }).expect(422);
});
test("production auth cookie is Secure; logout revokes session", async () => {
  const prod = createApp({
      production: true,
      secret: "test-secret-with-at-least-thirty-two-characters",
      origins: ["https://portfolio.example"],
      uploadDir: directory,
      trustProxy: false,
    }),
    handshake = await request(prod).get("/api/csrf").expect(200);
  assert.match(handshake.headers["set-cookie"][0], /Secure/);
  await mutate("post", "/api/auth/logout").expect(200);
  await agent.get("/api/auth/me").expect(401);
  await agent.get("/api/admin/projects").expect(401);
});
test("contact and login throttling apply", async () => {
  for (let i = 0; i < 8; i++)
    await request(app).post("/api/contact").set("Origin", origin);
  await request(app).post("/api/contact").set("Origin", origin).expect(429);
  for (let i = 0; i < 9; i++)
    await request(app).post("/api/auth/login").set("Origin", origin);
  await request(app).post("/api/auth/login").set("Origin", origin).expect(429);
});
