import * as React from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { SiteContext } from "../site";
import { useSEO } from "../motion";
import { Home, ProjectDetails } from "./PublicPages";
import {
  ArrowUp,
  X as CloseIcon,
  ArrowDown,
  Eye,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
const emptyProject = {
  slug: "",
  name: "",
  category: "",
  summary: "",
  description: "",
  problem: "",
  contribution: "",
  contributionDetail: "",
  status: "In development",
  theme: "erp",
  stack: [],
  implementedFeatures: [],
  plannedFeatures: [],
  featureNote: "",
  architecture: "",
  challenges: "",
  learning: "",
  screenshots: [],
  repository: "",
  liveUrl: "",
  videoUrl: "",
  published: !1,
  featured: !1,
  order: 0,
};
const strip = (a) =>
  Object.fromEntries(Object.keys(emptyProject).map((t) => [t, a[t]]));
function Field({
  label: a,
  value: t,
  onChange: v,
  textarea: h = !1,
  error: m,
  type: o = "text",
  required: p = !1,
}) {
  return (
    <label className={"editor-field"}>
      <span>{a}</span>
      {h ? (
        <textarea
          value={t || ""}
          onChange={(n) => v(n.target.value)}
          rows={"4"}
          required={p}
          aria-invalid={!!m}
        />
      ) : (
        <input
          value={t ?? ""}
          onChange={(n) => v(n.target.value)}
          type={o}
          required={p}
          aria-invalid={!!m}
        />
      )}{" "}
      {m && <small className={"field-error"}>{m}</small>}
    </label>
  );
}
function Lines({ label: a, value: t, onChange: v, error: h }) {
  const [m, o] = React.useState(
    t.join(`
`),
  );
  return (
    React.useEffect(
      () =>
        o(
          t.join(`
`),
        ),
      [t],
    ),
    (
      <Field
        label={`${a} (one per line)`}
        value={m}
        textarea={!0}
        error={h}
        onChange={(p) => {
          (o(p),
            v(
              p.split(`
`),
            ));
        }}
      />
    )
  );
}
function cleanLines(a) {
  return a.map((t) => t.trim()).filter(Boolean);
}
function Modal({ title: a, onClose: t, children: v }) {
  const h = React.useRef(null);
  return (
    React.useEffect(() => {
      const m = document.activeElement;
      return (
        h.current.showModal(),
        () => {
          var o;
          ((o = h.current) == null || o.close(), m == null || m.focus());
        }
      );
    }, []),
    (
      <dialog
        className={"admin-modal"}
        ref={h}
        aria-label={a}
        onCancel={(m) => {
          (m.preventDefault(), t());
        }}
      >
        <div className={"modal-top"}>
          <h2>{a}</h2>
          <button
            className={"icon-button"}
            onClick={t}
            aria-label={"Close dialog"}
          >
            <CloseIcon />
          </button>
        </div>
        {v}
      </dialog>
    )
  );
}
function Login({ onSuccess: a }) {
  const [t, v] = React.useState(""),
    [h, m] = React.useState(""),
    [o, p] = React.useState(""),
    [n, l] = React.useState(!1);
  async function D(N) {
    (N.preventDefault(), l(!0), p(""));
    try {
      (await api("/auth/login", {
        method: "POST",
        body: {
          email: t,
          password: h,
        },
      }),
        m(""),
        a());
    } catch (y) {
      p(y.message);
    } finally {
      l(!1);
    }
  }
  return (
    <form className={"login-card"} onSubmit={D}>
      <div className={"eyebrow"}>{"PRIVATE WORKSPACE"}</div>
      <h1>
        {"Welcome back"}
        <span className={"orange"}>{"."}</span>
      </h1>
      <p>{"Sign in to manage your portfolio."}</p>
      <label className={"editor-field"}>
        {"Email"}
        <input
          type={"email"}
          autoComplete={"username"}
          value={t}
          onChange={(N) => v(N.target.value)}
          required={!0}
        />
      </label>
      <label className={"editor-field"}>
        {"Password"}
        <input
          type={"password"}
          autoComplete={"current-password"}
          value={h}
          onChange={(N) => m(N.target.value)}
          required={!0}
          maxLength={"72"}
        />
      </label>
      {o && (
        <div className={"notice error"} role={"alert"}>
          {o}
        </div>
      )}
      <button className={"button primary"} disabled={n}>
        {n ? "Signing in…" : "Sign in"}
      </button>
      <small>
        {
          "One administrator. No public registration. Create your account with the setup script."
        }
      </small>
    </form>
  );
}
function UploadInput({
  kind: a,
  label: t,
  onUploaded: v,
  onError: h,
  setBusy: m,
}) {
  const [o, p] = React.useState(!1);
  return (
    <label className={"upload-control"}>
      <span>{o ? "Uploading…" : t}</span>
      <input
        type={"file"}
        accept={a === "pdf" ? "application/pdf" : ".jpg,.jpeg,.png,.webp"}
        disabled={o}
        onChange={async (n) => {
          const l = n.target.files[0];
          if (l) {
            if (l.size > 8 * 1024 * 1024) {
              h(new Error("Files must be 8 MB or smaller."));
              return;
            }
            (p(!0), m == null || m(!0));
            try {
              const D = new FormData();
              (D.append("kind", a), D.append("file", l));
              const N = await api("/admin/uploads", {
                method: "POST",
                body: D,
              });
              v(N);
            } catch (D) {
              h(D);
            } finally {
              (p(!1), m == null || m(!1), (n.target.value = ""));
            }
          }
        }}
      />
      <small>
        {a === "pdf" ? "PDF" : "JPEG, PNG or WebP"}
        {" · up to 8 MB"}
      </small>
    </label>
  );
}
function Collection({
  title: a,
  items: t,
  fields: v,
  onChange: h,
  newItem: m,
}) {
  function o(p, n, l) {
    h(
      t.map((D, N) =>
        N === p
          ? {
              ...D,
              [n]: l,
            }
          : D,
      ),
    );
  }
  return (
    <section className={"editor-section"}>
      <div className={"editor-heading"}>
        <h2>{a}</h2>
        <button
          type={"button"}
          className={"small-button"}
          onClick={() => h([...t, structuredClone(m)])}
        >
          <Plus size={15} />
          {"Add entry"}
        </button>
      </div>
      {t.map((p, n) => (
        <div key={n} className={"collection-entry"}>
          <div className={"entry-controls"}>
            <span>
              {"Entry "}
              {n + 1}
            </span>
            <button
              type={"button"}
              className={"icon-button"}
              aria-label={`Move ${a} entry ${n + 1} up`}
              disabled={!n}
              onClick={() => {
                const l = [...t];
                (([l[n - 1], l[n]] = [l[n], l[n - 1]]), h(l));
              }}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type={"button"}
              className={"icon-button"}
              aria-label={`Move ${a} entry ${n + 1} down`}
              disabled={n === t.length - 1}
              onClick={() => {
                const l = [...t];
                (([l[n + 1], l[n]] = [l[n], l[n + 1]]), h(l));
              }}
            >
              <ArrowDown size={16} />
            </button>
            <button
              type={"button"}
              className={"icon-button danger"}
              aria-label={`Remove ${a} entry ${n + 1}`}
              onClick={() => {
                window.confirm(
                  "Remove this entry? Save the profile to apply the removal.",
                ) && h(t.filter((l, D) => D !== n));
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className={"editor-grid"}>
            {v.map(([l, D, N]) =>
              Array.isArray(p[l]) ? (
                <Lines
                  key={l}
                  label={D}
                  value={p[l]}
                  onChange={(y) => o(n, l, y)}
                />
              ) : (
                <Field
                  key={l}
                  label={D}
                  value={p[l]}
                  textarea={N}
                  onChange={(y) => o(n, l, y)}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
function ProfileEditor({
  site: a,
  setSite: t,
  run: v,
  dirty: h,
  setDirty: m,
  projects: o,
}) {
  const [p, n] = React.useState(!1),
    [l, D] = React.useState({}),
    [N, y] = React.useState(!1),
    [A, O] = React.useState(0),
    k = (r, i, u) => {
      (t((c) =>
        r
          ? {
              ...c,
              [r]: {
                ...c[r],
                [i]: u,
              },
            }
          : {
              ...c,
              [i]: u,
            },
      ),
        m(!0));
    };
  async function x(r) {
    (r.preventDefault(),
      y(!0),
      D({}),
      await v(
        async () => {
          const i = {
              ...a,
              person: {
                ...a.person,
                languages: cleanLines(a.person.languages),
              },
              skills: a.skills.map((c) => ({
                ...c,
                items: cleanLines(c.items),
              })),
            },
            u = await api("/admin/site", {
              method: "PUT",
              body: i,
            });
          (t(u), m(!1));
        },
        "Profile published.",
        (i) => D(i.fields || {}),
      ),
      y(!1));
  }
  return a ? (
    <>
      <form className={"admin-editor"} onSubmit={x}>
        <fieldset disabled={N} className={"editor-fieldset"}>
          <div className={"editor-heading"}>
            <div>
              <h1>{"Profile & content"}</h1>
              <p>
                {
                  "Update the story behind your work. Saving publishes these profile changes."
                }
              </p>
            </div>
            <span className={"draft-pill"}>
              {h ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          <section className={"editor-section"}>
            <h2>{"Hero & availability"}</h2>
            <Field
              label={"Headline"}
              value={a.hero.headline}
              onChange={(r) => k("hero", "headline", r)}
              error={l["hero.headline"]}
              required={!0}
            />
            <Field
              label={"Introduction"}
              value={a.hero.introduction}
              textarea={!0}
              onChange={(r) => k("hero", "introduction", r)}
              error={l["hero.introduction"]}
              required={!0}
            />
            <Field
              label={"Availability label"}
              value={a.hero.availability}
              onChange={(r) => k("hero", "availability", r)}
              required={!0}
            />
            <label className={"checkbox-field"}>
              <input
                type={"checkbox"}
                checked={a.hero.available}
                onChange={(r) => k("hero", "available", r.target.checked)}
              />
              {"Available for opportunities"}
            </label>
          </section>
          <section className={"editor-section"}>
            <h2>{"Personal information"}</h2>
            <div className={"editor-grid"}>
              {[
                ["name", "Display name"],
                ["fullName", "Full name"],
                ["role", "Role"],
                ["location", "Location"],
                ["email", "Email"],
                ["github", "GitHub HTTPS URL"],
                ["linkedin", "LinkedIn HTTPS URL"],
              ].map(([r, i]) => (
                <Field
                  key={r}
                  label={i}
                  value={a.person[r]}
                  type={r === "email" ? "email" : "text"}
                  onChange={(u) => k("person", r, u)}
                  error={l[`person.${r}`]}
                />
              ))}
            </div>
            <Lines
              label={"Languages"}
              value={a.person.languages}
              onChange={(r) => k("person", "languages", r)}
            />
            <Field
              label={"Biography (blank lines separate paragraphs)"}
              value={a.biography}
              textarea={!0}
              onChange={(r) => k(null, "biography", r)}
              required={!0}
            />
          </section>
          <section className={"editor-section"}>
            <h2>{"Portrait & resume"}</h2>
            <div className={"editor-grid"}>
              <div>
                {a.person.portrait ? (
                  <img
                    className={"admin-portrait"}
                    src={a.person.portrait}
                    alt={"Current portrait"}
                  />
                ) : (
                  <img
                    className={"admin-portrait"}
                    src={"/portrait-placeholder.svg"}
                    alt={"SVG portrait fallback"}
                  />
                )}
                <UploadInput
                  kind={"image"}
                  label={"Upload / replace portrait"}
                  onUploaded={(r) => k("person", "portrait", r.src)}
                  onError={(r) =>
                    v(() => {
                      throw r;
                    })
                  }
                  setBusy={(r) => O((i) => i + (r ? 1 : -1))}
                />
                {a.person.portrait && (
                  <button
                    type={"button"}
                    className={"small-button danger"}
                    onClick={() => {
                      window.confirm(
                        "Remove the portrait attachment and use the SVG fallback? Save to apply.",
                      ) && k("person", "portrait", null);
                    }}
                  >
                    {"Use SVG fallback"}
                  </button>
                )}
              </div>
              <div>
                {a.person.resumePdf ? (
                  <a
                    href={a.person.resumePdf}
                    target={"_blank"}
                    rel={"noreferrer"}
                  >
                    {"Preview attached PDF ↗"}
                  </a>
                ) : (
                  <p>{"No PDF attached. The HTML resume stays available."}</p>
                )}
                <UploadInput
                  kind={"pdf"}
                  label={"Upload / replace resume PDF"}
                  onUploaded={(r) => k("person", "resumePdf", r.src)}
                  onError={(r) =>
                    v(() => {
                      throw r;
                    })
                  }
                  setBusy={(r) => O((i) => i + (r ? 1 : -1))}
                />
                {a.person.resumePdf && (
                  <button
                    type={"button"}
                    className={"small-button danger"}
                    onClick={() => {
                      window.confirm(
                        "Remove the PDF attachment? Save to apply.",
                      ) && k("person", "resumePdf", null);
                    }}
                  >
                    {"Remove PDF attachment"}
                  </button>
                )}
              </div>
            </div>
            <p className={"editor-help"}>
              {
                "Uploads attach to this form first. Save to publish. Old files remain in the media library until explicitly deleted."
              }
            </p>
          </section>
          <Collection
            title={"Skills"}
            items={a.skills}
            fields={[
              ["title", "Group name"],
              ["items", "Skills"],
            ]}
            newItem={{
              title: "",
              items: [],
            }}
            onChange={(r) => k(null, "skills", r)}
          />
          <Collection
            title={"Education"}
            items={a.education}
            fields={[
              ["degree", "Degree"],
              ["institution", "Institution"],
              ["graduation", "Expected graduation"],
              ["score", "Academic score"],
            ]}
            newItem={{
              degree: "",
              institution: "",
              graduation: "",
              score: "",
            }}
            onChange={(r) => k(null, "education", r)}
          />
          <Collection
            title={"Journey timeline"}
            items={a.journey}
            fields={[
              ["label", "Label"],
              ["title", "Title"],
              ["text", "Description", !0],
            ]}
            newItem={{
              label: "",
              title: "",
              text: "",
            }}
            onChange={(r) => k(null, "journey", r)}
          />
          <div className={"save-bar"}>
            <button
              type={"button"}
              className={"button subtle"}
              onClick={() => n(!0)}
            >
              <Eye size={17} />
              {"Preview changes"}
            </button>
            <button className={"button primary"} disabled={N || A}>
              <Save size={17} />
              {N ? "Saving…" : "Save & publish profile"}
            </button>
          </div>
        </fieldset>
      </form>
      {p && (
        <Modal
          title={"Private homepage preview · unsaved changes"}
          onClose={() => n(!1)}
        >
          <SiteContext.Provider
            value={{
              ...a,
              projects: o.filter((r) => r.published),
            }}
          >
            <Home />
          </SiteContext.Provider>
        </Modal>
      )}
    </>
  ) : (
    <div className={"empty-state"}>
      {"Run the seed script to initialize portfolio content."}
    </div>
  );
}
function ProjectEditor({
  project: a,
  onSaved: t,
  run: v,
  setDirty: h,
  onClose: m,
}) {
  const [o, p] = React.useState(() => strip(a)),
    [n, l] = React.useState({}),
    [D, N] = React.useState(!1),
    [y, A] = React.useState(!1),
    [O, k] = React.useState(!1),
    x = (i, u) => {
      (p((c) => ({
        ...c,
        [i]: typeof u == "function" ? u(c[i]) : u,
      })),
        h(!0));
    };
  async function r(i) {
    (i.preventDefault(),
      N(!0),
      l({}),
      await v(
        async () => {
          const u = {
              ...o,
              stack: cleanLines(o.stack),
              implementedFeatures: cleanLines(o.implementedFeatures),
              plannedFeatures: cleanLines(o.plannedFeatures),
            },
            c = await api(`/admin/projects${a._id ? "/" + a._id : ""}`, {
              method: a._id ? "PUT" : "POST",
              body: u,
            });
          (p(strip(c)), h(!1), t(c));
        },
        o.published ? "Project saved and published." : "Draft saved privately.",
        (u) => l(u.fields || {}),
      ),
      N(!1));
  }
  return (
    <>
      <form className={"admin-editor"} onSubmit={r}>
        <fieldset disabled={D} className={"editor-fieldset"}>
          <div className={"editor-heading"}>
            <h1>{a._id ? "Edit project" : "Create project"}</h1>
            <button type={"button"} className={"small-button"} onClick={m}>
              {"Back to list"}
            </button>
          </div>
          <section className={"editor-section"}>
            <h2>{"Identity & publication"}</h2>
            <div className={"editor-grid"}>
              {[
                ["name", "Project name"],
                ["slug", "URL slug (lowercase-and-hyphens)"],
                ["category", "Category"],
                ["status", "Current status"],
                ["contribution", "Contribution label"],
              ].map(([i, u]) => (
                <Field
                  key={i}
                  label={u}
                  value={o[i]}
                  onChange={(c) => x(i, c)}
                  error={n[i]}
                  required={!0}
                />
              ))}
              <label className={"editor-field"}>
                {"Fallback preview theme"}
                <select
                  value={o.theme}
                  onChange={(i) => x("theme", i.target.value)}
                >
                  <option value={"erp"}>{"School / dashboard"}</option>
                  <option value={"market"}>{"Marketplace"}</option>
                  <option value={"weather"}>{"Weather / frontend"}</option>
                </select>
              </label>
            </div>
            <label className={"checkbox-field"}>
              <input
                type={"checkbox"}
                checked={o.featured}
                onChange={(i) => x("featured", i.target.checked)}
              />
              {"Feature on homepage"}
            </label>
            <label className={"checkbox-field"}>
              <input
                type={"checkbox"}
                checked={o.published}
                onChange={(i) => {
                  (!i.target.checked &&
                    !window.confirm(
                      "Unpublish this project when saved? It will become private.",
                    )) ||
                    x("published", i.target.checked);
                }}
              />
              {"Published (unchecked = private draft)"}
            </label>
            <p className={"editor-help"}>
              {
                "Publication changes apply only after saving. Drafts and their screenshots are hidden from public APIs."
              }
            </p>
          </section>
          <section className={"editor-section"}>
            <h2>{"The project story"}</h2>
            {[
              ["summary", "Short summary"],
              ["description", "Overview"],
              ["problem", "Problem"],
              ["contributionDetail", "My contribution"],
              ["architecture", "Architecture"],
              ["challenges", "Challenges"],
              ["learning", "Learning"],
              ["featureNote", "Feature scope / verification note"],
            ].map(([i, u]) => (
              <Field
                key={i}
                label={u}
                textarea={!0}
                value={o[i]}
                onChange={(c) => x(i, c)}
                error={n[i]}
                required={["summary", "description"].includes(i)}
              />
            ))}
            <Lines
              label={"Technology stack / context"}
              value={o.stack}
              onChange={(i) => x("stack", i)}
              error={n.stack}
            />
            <Lines
              label={"Implemented / confirmed features"}
              value={o.implementedFeatures}
              onChange={(i) => x("implementedFeatures", i)}
              error={n.implementedFeatures}
            />
            <Lines
              label={"Planned features"}
              value={o.plannedFeatures}
              onChange={(i) => x("plannedFeatures", i)}
              error={n.plannedFeatures}
            />
          </section>
          <section className={"editor-section"}>
            <h2>{"Links & demo"}</h2>
            {[
              ["repository", "GitHub HTTPS URL"],
              ["liveUrl", "Live project HTTPS URL"],
              [
                "videoUrl",
                "Demo video HTTPS URL (YouTube, Vimeo, MP4 or WebM)",
              ],
            ].map(([i, u]) => (
              <Field
                key={i}
                label={u}
                value={o[i]}
                onChange={(c) => x(i, c)}
                error={n[i]}
              />
            ))}
            <p className={"editor-help"}>
              {
                "Leave missing URLs blank. Public actions appear only when links are supplied."
              }
            </p>
          </section>
          <section className={"editor-section"}>
            <h2>{"Screenshots"}</h2>
            <UploadInput
              kind={"image"}
              label={"Upload screenshot"}
              onUploaded={(i) =>
                x("screenshots", (u) => [
                  ...u,
                  {
                    src: i.src,
                    alt: "",
                    width: i.width,
                    height: i.height,
                  },
                ])
              }
              onError={(i) =>
                v(() => {
                  throw i;
                })
              }
              setBusy={A}
            />
            {o.screenshots.map((i, u) => (
              <div key={i.src} className={"screenshot-editor"}>
                <img
                  src={i.src}
                  alt={i.alt || "Screenshot awaiting description"}
                />
                <Field
                  label={`Screenshot ${u + 1} description / alt text`}
                  value={i.alt}
                  onChange={(c) =>
                    x(
                      "screenshots",
                      o.screenshots.map((V, F) =>
                        F === u
                          ? {
                              ...V,
                              alt: c,
                            }
                          : V,
                      ),
                    )
                  }
                  error={n[`screenshots.${u}.alt`]}
                  required={!0}
                />
                <div className={"entry-controls"}>
                  <button
                    type={"button"}
                    className={"small-button"}
                    disabled={!u}
                    onClick={() => {
                      const c = [...o.screenshots];
                      (([c[u - 1], c[u]] = [c[u], c[u - 1]]),
                        x("screenshots", c));
                    }}
                  >
                    {"Move up"}
                  </button>
                  <button
                    type={"button"}
                    className={"small-button danger"}
                    onClick={() => {
                      window.confirm(
                        "Remove this screenshot attachment? Save to apply.",
                      ) &&
                        x(
                          "screenshots",
                          o.screenshots.filter((c, V) => V !== u),
                        );
                    }}
                  >
                    {"Remove"}
                  </button>
                </div>
              </div>
            ))}
            <p className={"editor-help"}>
              {
                "The first screenshot is the gallery preview. Uploaded media can be managed in the media library."
              }
            </p>
          </section>
          <div className={"save-bar"}>
            <button
              type={"button"}
              className={"button subtle"}
              onClick={() => k(!0)}
            >
              <Eye size={17} />
              {"Preview"}
            </button>
            <button className={"button primary"} disabled={D || y}>
              <Save size={17} />
              {D
                ? "Saving…"
                : o.published
                  ? "Save & publish"
                  : "Save private draft"}
            </button>
          </div>
        </fieldset>
      </form>
      {O && (
        <Modal
          title={"Private project preview · unsaved changes"}
          onClose={() => k(!1)}
        >
          <ProjectDetails p={o} preview={!0} />
        </Modal>
      )}
    </>
  );
}
function Admin() {
  useSEO("Admin", "Private portfolio management workspace.", !0);
  const [a, t] = React.useState(null),
    [v, h] = React.useState(null),
    [m, o] = React.useState([]),
    [p, n] = React.useState("Profile"),
    [l, D] = React.useState(null),
    [N, y] = React.useState(!1),
    [A, O] = React.useState(""),
    [k, x] = React.useState(""),
    [r, i] = React.useState(!1),
    [u, c] = React.useState(!1),
    [V, F] = React.useState(!1),
    [H, L] = React.useState([]),
    [E, T] = React.useState({
      items: [],
      total: 0,
      page: 1,
    });
  (React.useEffect(() => {
    const s = new AbortController();
    return (
      api("/auth/me", {
        signal: s.signal,
      })
        .then(() => t(!0))
        .catch((f) => {
          f.name !== "AbortError" && (t(!1), f.status !== 401 && O(f.message));
        }),
      () => s.abort()
    );
  }, []),
    React.useEffect(() => {
      const s = (f) => {
        N && (f.preventDefault(), (f.returnValue = ""));
      };
      return (
        window.addEventListener("beforeunload", s),
        () => window.removeEventListener("beforeunload", s)
      );
    }, [N]));
  async function C(s, f = "", b) {
    (O(""), x(""), i(!0));
    try {
      return (await s(), x(f), !0);
    } catch (j) {
      return (O(j.message), b == null || b(j), j.status === 401 && c(!0), !1);
    } finally {
      i(!1);
    }
  }
  async function _() {
    await C(async () => {
      const [s, f, b, j] = await Promise.all([
        api("/admin/site"),
        api("/admin/projects"),
        api("/admin/uploads"),
        api("/admin/inquiries"),
      ]);
      (h(s), o(f), L(b), T(j), F(!0));
    });
  }
  React.useEffect(() => {
    a && _();
  }, [a]);
  function ee(s) {
    (N && !window.confirm("Discard unsaved changes and switch sections?")) ||
      (y(!1), D(null), n(s), _());
  }
  async function q(s, f) {
    const b = [...m];
    (([b[s], b[s + f]] = [b[s + f], b[s]]),
      await C(async () => {
        (await api("/admin/projects/reorder", {
          method: "PUT",
          body: {
            ids: b.map((j) => j._id),
          },
        }),
          o(
            b.map((j, M) => ({
              ...j,
              order: M,
            })),
          ));
      }, "Project order saved."));
  }
  return a === null ? (
    <main className={"state-screen"} role={"status"}>
      {"Checking your session…"}
    </main>
  ) : a ? (
    <div className={"admin-app"}>
      <aside className={"admin-sidebar"}>
        <Link to={"/"} className={"admin-wordmark"}>
          {"m"}
          <span>{"."}</span>
        </Link>
        <div className={"eyebrow"}>{"PORTFOLIO STUDIO"}</div>
        <nav aria-label={"Dashboard sections"}>
          {["Profile", "Projects", "Inquiries", "Media"].map((s) => (
            <button
              key={s}
              className={p === s ? "selected" : ""}
              aria-current={p === s ? "page" : void 0}
              onClick={() => ee(s)}
            >
              {s}
              {s === "Projects" && <small>{m.length}</small>}
            </button>
          ))}
        </nav>
        <a href={"/"} target={"_blank"} rel={"noreferrer"}>
          {"Open public portfolio ↗"}
        </a>
        <button
          className={"logout-button"}
          disabled={r}
          onClick={() => {
            (N && !window.confirm("Discard unsaved changes and sign out?")) ||
              C(async () => {
                (await api("/auth/logout", {
                  method: "POST",
                }),
                  t(!1),
                  y(!1));
              });
          }}
        >
          <LogOut size={16} />
          {"Sign out"}
        </button>
      </aside>
      <main className={"admin-main"}>
        <header className={"admin-top"}>
          <span>{"YOUR WORK, THOUGHTFULLY PRESENTED."}</span>
          <span className={"draft-pill"}>{"Private dashboard"}</span>
        </header>
        {A && (
          <div className={"notice error"} role={"alert"}>
            {A}
          </div>
        )}
        {k && (
          <div className={"notice success"} role={"status"}>
            {k}
          </div>
        )}
        {V ? (
          p === "Profile" ? (
            <ProfileEditor
              site={v}
              setSite={h}
              run={C}
              dirty={N}
              setDirty={y}
              projects={m}
            />
          ) : p === "Projects" ? (
            l ? (
              <ProjectEditor
                key={l._id || "new"}
                project={l}
                run={C}
                setDirty={y}
                onClose={() => {
                  (!N || window.confirm("Discard unsaved project changes?")) &&
                    (D(null), y(!1));
                }}
                onSaved={(s) => {
                  (o((f) =>
                    (f.some((j) => j._id === s._id)
                      ? f.map((j) => (j._id === s._id ? s : j))
                      : [...f, s]
                    ).sort((j, M) => j.order - M.order),
                  ),
                    D(s));
                }}
              />
            ) : (
              <section>
                <div className={"editor-heading"}>
                  <div>
                    <h1>{"Projects"}</h1>
                    <p>
                      {"Keep drafts private. Publish when the story is ready."}
                    </p>
                  </div>
                  <button
                    className={"button primary"}
                    onClick={() =>
                      D({
                        ...emptyProject,
                        order: m.length,
                      })
                    }
                  >
                    <Plus size={16} />
                    {"New project"}
                  </button>
                </div>
                <div className={"admin-projects"}>
                  {m.map((s, f) => (
                    <article key={s._id}>
                      <div>
                        <span
                          className={`draft-pill ${s.published ? "published" : ""}`}
                        >
                          {s.published ? "Published" : "Private draft"}
                        </span>
                        {s.featured && (
                          <span className={"featured-label"}>{"Featured"}</span>
                        )}
                        <h2>{s.name}</h2>
                        <p>
                          {s.contribution}
                          {" · "}
                          {s.status}
                        </p>
                      </div>
                      <div className={"project-admin-actions"}>
                        <button
                          className={"icon-button"}
                          disabled={!f || r}
                          aria-label={`Move ${s.name} up`}
                          onClick={() => q(f, -1)}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          className={"icon-button"}
                          disabled={f === m.length - 1 || r}
                          aria-label={`Move ${s.name} down`}
                          onClick={() => q(f, 1)}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button className={"small-button"} onClick={() => D(s)}>
                          {"Edit / preview"}
                        </button>
                        <button
                          className={"small-button"}
                          disabled={r}
                          onClick={() => {
                            (s.published &&
                              !window.confirm(
                                `Unpublish ${s.name}? It will become private.`,
                              )) ||
                              C(
                                async () => {
                                  const b = await api(
                                    `/admin/projects/${s._id}`,
                                    {
                                      method: "PUT",
                                      body: {
                                        ...strip(s),
                                        published: !s.published,
                                      },
                                    },
                                  );
                                  o((j) =>
                                    j.map((M) => (M._id === s._id ? b : M)),
                                  );
                                },
                                s.published
                                  ? "Project unpublished."
                                  : "Project published.",
                              );
                          }}
                        >
                          {s.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          className={"icon-button danger"}
                          disabled={r}
                          aria-label={`Delete ${s.name}`}
                          onClick={() => {
                            window.confirm(
                              `Permanently delete ${s.name}? This cannot be undone.`,
                            ) &&
                              C(async () => {
                                (await api(`/admin/projects/${s._id}`, {
                                  method: "DELETE",
                                  headers: {
                                    "X-Confirm-Delete": s._id,
                                  },
                                }),
                                  o((b) => b.filter((j) => j._id !== s._id)));
                              }, "Project deleted.");
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!m.length && (
                  <div className={"empty-state"}>
                    {"No projects yet. Create your first draft."}
                  </div>
                )}
              </section>
            )
          ) : p === "Inquiries" ? (
            <section>
              <div className={"editor-heading"}>
                <div>
                  <h1>{"Inquiries"}</h1>
                  <p>
                    {E.total}
                    {" saved messages. Only you can read these."}
                  </p>
                </div>
              </div>
              {E.items.map((s) => (
                <article key={s._id} className={"inquiry-card"}>
                  <header>
                    <span className={"draft-pill"}>{s.status}</span>
                    <time dateTime={s.createdAt}>
                      {new Date(s.createdAt).toLocaleString()}
                    </time>
                  </header>
                  <h2>{s.subject}</h2>
                  <a href={`mailto:${s.email}`}>
                    {s.name}
                    {" · "}
                    {s.email}
                  </a>
                  <p>{s.message}</p>
                  <label>
                    {"Status"}
                    <select
                      disabled={r}
                      value={s.status}
                      onChange={(f) =>
                        C(async () => {
                          const b = await api(`/admin/inquiries/${s._id}`, {
                            method: "PATCH",
                            body: {
                              status: f.target.value,
                            },
                          });
                          T((j) => ({
                            ...j,
                            items: j.items.map((M) =>
                              M._id === b._id ? b : M,
                            ),
                          }));
                        }, "Inquiry status updated.")
                      }
                    >
                      <option value={"unread"}>{"Unread"}</option>
                      <option value={"read"}>{"Read"}</option>
                      <option value={"archived"}>{"Archived"}</option>
                    </select>
                  </label>
                </article>
              ))}
              {!E.items.length && (
                <div className={"empty-state"}>
                  {"No inquiries yet. New messages will appear here."}
                </div>
              )}
              <div className={"pagination"}>
                <button
                  className={"small-button"}
                  disabled={r || E.page <= 1}
                  onClick={() =>
                    C(async () =>
                      T(await api(`/admin/inquiries?page=${E.page - 1}`)),
                    )
                  }
                >
                  {"Previous"}
                </button>
                <span>
                  {"Page "}
                  {E.page}
                </span>
                <button
                  className={"small-button"}
                  disabled={r || E.page * 30 >= E.total}
                  onClick={() =>
                    C(async () =>
                      T(await api(`/admin/inquiries?page=${E.page + 1}`)),
                    )
                  }
                >
                  {"Next"}
                </button>
              </div>
            </section>
          ) : (
            <section>
              <div className={"editor-heading"}>
                <div>
                  <h1>{"Media library"}</h1>
                  <p>
                    {
                      "Files used by private drafts stay private. Referenced files cannot be deleted."
                    }
                  </p>
                </div>
                <button
                  className={"small-button"}
                  onClick={() => C(async () => L(await api("/admin/uploads")))}
                >
                  {"Refresh"}
                </button>
              </div>
              <div className={"media-grid"}>
                {H.map((s) => (
                  <article key={s._id} className={"media-card"}>
                    {s.kind === "image" ? (
                      <img src={s.src} alt={s.originalName} />
                    ) : (
                      <div className={"pdf-label"}>{"PDF"}</div>
                    )}
                    <h2>{s.originalName}</h2>
                    <p>
                      {Math.ceil(s.size / 1024)}
                      {" KB · "}
                      {s.kind}
                    </p>
                    <a href={s.src} target={"_blank"} rel={"noreferrer"}>
                      {"Preview ↗"}
                    </a>
                    <button
                      className={"small-button danger"}
                      disabled={r}
                      onClick={() => {
                        window.confirm(
                          "Permanently delete this unused file? This cannot be undone.",
                        ) &&
                          C(async () => {
                            (await api(`/admin/uploads/${s._id}`, {
                              method: "DELETE",
                              headers: {
                                "X-Confirm-Delete": s._id,
                              },
                            }),
                              L((f) => f.filter((b) => b._id !== s._id)));
                          }, "File deleted.");
                      }}
                    >
                      {"Delete unused file"}
                    </button>
                  </article>
                ))}
              </div>
              {!H.length && (
                <div className={"empty-state"}>
                  {
                    "Upload a portrait, resume, or project screenshot to see it here."
                  }
                </div>
              )}
            </section>
          )
        ) : (
          <div className={"empty-state"}>
            <p>{r ? "Loading workspace…" : "Workspace could not be loaded."}</p>
            {!r && (
              <button className={"button primary"} onClick={_}>
                {"Retry"}
              </button>
            )}
          </div>
        )}
      </main>
      {u && (
        <Modal
          title={"Sign in again · your changes are preserved"}
          onClose={() => c(!1)}
        >
          <Login
            onSuccess={() => {
              (c(!1),
                x(
                  "Signed in. Your unsaved changes are preserved. Retry saving.",
                ));
            }}
          />
        </Modal>
      )}
    </div>
  ) : (
    <main className={"admin-login"}>
      <Link className={"admin-back"} to={"/"}>
        {"← Portfolio"}
      </Link>
      {A && (
        <div className={"notice error"} role={"alert"}>
          {A}
        </div>
      )}
      <Login onSuccess={() => t(!0)} />
    </main>
  );
}
export default Admin;
