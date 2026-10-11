import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  CodeXml,
  Database,
  Braces,
  Terminal,
  Globe,
  Layers,
  Search,
  ArrowLeft,
  Printer,
  Download,
} from "lucide-react";
import { Arrow, Socials } from "../ui";
import { useSite } from "../site";
import { api } from "../api";
import {
  Portrait,
  Preview,
  ProjectRow,
  ContactCTA,
  SkillList,
} from "../blocks";
import { usePageMotion, pauseOrbit, useSEO } from "../motion";
function Home() {
  const { person: o, hero: e, projects: r, skills: i } = useSite(),
    s = usePageMotion();
  return (
    useSEO(o.role, e.introduction),
    (
      <main id={"main"} ref={s}>
        <section className={"hero container home-upgraded page-enter"}>
          <div className={"hero-content"}>
            <div className={"eyebrow hero-reveal"}>
              <span
                className={`status-dot ${e.available ? "" : "unavailable"}`}
              />
              {e.availability}
            </div>
            <p className={"hero-intro hero-reveal"}>
              {"Hi, I’m "}
              {o.name} <span className={"wave"}>{"✳"}</span>
            </p>
            <h1 className={"hero-reveal"}>{e.headline}</h1>
            <p className={"hero-description hero-reveal"}>{e.introduction}</p>
            <div className={"hero-actions hero-reveal"}>
              <Link className={"button primary"} to={"/projects"}>
                {"View Projects "}
                <Arrow />
              </Link>
              <Link className={"button subtle"} to={"/contact"}>
                {"Let’s Connect "}
                <Arrow />
              </Link>
            </div>
          </div>
          <div className={"hero-portrait hero-reveal"}>
            <div className={"portrait-halo"} />
            <Portrait person={o} eager={!0} />
            <div className={"portrait-badge"}>
              <span className={"status-dot"} />
              {o.role}
            </div>
            <span className={"portrait-caption"}>
              {"CURIOUS BY NATURE. A BUILDER BY PRACTICE."}
            </span>
            <div className={"portrait-code"}>
              <CodeXml size={24} />
              <span>{"learn. build. repeat."}</span>
            </div>
          </div>
          <div className={"hero-bottom"}>
            <span>{o.location.toUpperCase()}</span>
            <span>{"FULL STACK. FULL OF IDEAS."}</span>
          </div>
        </section>
        <div className={"stack-strip"}>
          <div className={"container"}>
            <span>{"THE BUILDING BLOCKS"}</span>
            {i
              .flatMap((t) => t.items)
              .slice(0, 5)
              .map((t, n) => (
                <b key={n}>
                  <span>{"✳"}</span>
                  {t}
                </b>
              ))}
          </div>
        </div>
        <section className={"section container"} id={"projects"}>
          <div className={"section-heading"} data-reveal={!0}>
            <div>
              <div className={"eyebrow"}>{"01 / SELECTED WORK"}</div>
              <h2>
                {"Ideas turned into"}
                <br />
                <em>{"something real."}</em>
              </h2>
            </div>
            <Link className={"text-link"} to={"/projects"}>
              {"Explore all projects "}
              <Arrow />
            </Link>
          </div>
          <div className={"project-list"}>
            {r
              .filter((t) => t.featured)
              .map((t, n) => (
                <ProjectRow key={t._id} project={t} index={n} />
              ))}
          </div>
          {!r.some((t) => t.featured) && (
            <div className={"empty-state"}>
              {"Featured projects are on their way."}{" "}
              <Link to={"/projects"}>{"Explore the gallery ↗"}</Link>
            </div>
          )}
        </section>
        <section className={"container section home-skills"} data-reveal={!0}>
          <div>
            <div className={"eyebrow"}>{"02 / THE TOOLKIT"}</div>
            <h2>
              {"Full-stack tools."}
              <br />
              <em>{"Practical thinking."}</em>
            </h2>
            <Link className={"text-link"} to={"/about"}>
              {"Meet the developer "}
              <Arrow />
            </Link>
          </div>
          <div>
            {i.map((t, n) => (
              <div key={n} className={"skill-summary"}>
                <h3>{t.title}</h3>
                <p>{t.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
        <ContactCTA />
      </main>
    )
  );
}
function About() {
  const {
      person: o,
      biography: e,
      education: r,
      skills: i,
      journey: s,
    } = useSite(),
    t = usePageMotion();
  return (
    useSEO(
      "About",
      `${o.name}: education, full-stack skills, and a journey of practical learning.`,
    ),
    (
      <main id={"main"} ref={t}>
        <section className={"container page-heading page-enter"}>
          <div className={"eyebrow"}>{"THE PERSON BEHIND THE CODE"}</div>
          <h1>
            {"Curiosity is my"}
            <br />
            <em>{"starting point."}</em>
          </h1>
        </section>
        <section className={"about-section"}>
          <div className={"container about-grid"}>
            <div
              className={"profile-orbit"}
              tabIndex={"0"}
              aria-label={"Skill orbit. Hover or focus to pause animation."}
              onMouseEnter={(n) => pauseOrbit(n, !0)}
              onMouseLeave={(n) => pauseOrbit(n, !1)}
              onFocus={(n) => pauseOrbit(n, !0)}
              onBlur={(n) => pauseOrbit(n, !1)}
            >
              <div className={"orbit-guide"} />
              <div className={"orbit-guide inner"} />
              <div className={"portrait"}>
                <Portrait person={o} />
              </div>
              <div className={"orbit-ring"}>
                {[CodeXml, Database, Braces, Terminal, Globe, Layers].map(
                  (Icon, a) => (
                    <div key={a} className={`orbit-position pos-${a}`}>
                      <div className={"orbit-icon"}>
                        <Icon size={25} />
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className={"orbit-note"}>
                <span className={"status-dot"} />
                {"Always in the making."}
              </div>
            </div>
            <div className={"about-copy"} data-reveal={!0}>
              <div className={"eyebrow"}>
                {o.name.toUpperCase()}
                {" / "}
                {o.role.toUpperCase()}
              </div>
              {e
                .split(
                  `
`,
                )
                .filter(Boolean)
                .map((n, a) => (
                  <p key={a}>{n}</p>
                ))}
              <div className={"about-facts"}>
                {r.map((n, a) => (
                  <div key={a}>
                    <b>{n.degree}</b>
                    <span>
                      {n.institution}
                      {n.graduation && ` · Expected ${n.graduation}`}
                    </span>
                    {n.score && <span>{n.score}</span>}
                  </div>
                ))}
              </div>
              <Link className={"text-link"} to={"/resume"}>
                {"Read my resume "}
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
        <section className={"container section"}>
          <div className={"section-heading"} data-reveal={!0}>
            <div>
              <div className={"eyebrow"}>{"MY TOOLKIT"}</div>
              <h2>
                {"The fundamentals."}
                <br />
                <em>{"And what comes next."}</em>
              </h2>
            </div>
          </div>
          <SkillList skills={i} />
        </section>
        <section className={"journey-section container section"}>
          <div data-reveal={!0}>
            <div className={"eyebrow"}>{"THE JOURNEY SO FAR"}</div>
            <h2>
              {"Small steps."}
              <br />
              <em>{"Steady progress."}</em>
            </h2>
          </div>
          <div className={"journey-list"}>
            <div className={"journey-track"}>
              <div className={"journey-progress"} />
            </div>
            {s.map((n, a) => (
              <article key={a} className={"journey-item"} data-reveal={!0}>
                <span className={"journey-node"}>
                  {"0"}
                  {a + 1}
                </span>
                <div>
                  <div className={"eyebrow"}>{n.label}</div>
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <ContactCTA />
      </main>
    )
  );
}
function Projects() {
  const { projects: o } = useSite(),
    [e, r] = React.useState(""),
    [i, s] = React.useState("All"),
    t = usePageMotion();
  useSEO(
    "Projects",
    "Explore Mukesh Darji’s solo and collaborative projects, scope, and contributions.",
  );
  const n = ["All", ...new Set(o.flatMap((u) => u.stack))],
    a = o.filter(
      (u) =>
        (i === "All" || u.stack.includes(i)) &&
        `${u.name} ${u.summary} ${u.stack.join(" ")} ${u.contribution}`
          .toLowerCase()
          .includes(e.toLowerCase()),
    );
  return (
    <main id={"main"} className={"container gallery-page"} ref={t}>
      <header className={"page-heading page-enter"}>
        <div className={"eyebrow"}>
          {"PROJECTS / LEARNING THROUGH BUILDING"}
        </div>
        <h1>
          {"Built with intent."}
          <br />
          <em>{"Explored with curiosity."}</em>
        </h1>
        <p>
          {
            "Solo builds, shared ideas, and practical experiments. Each story makes the scope and my contribution clear."
          }
        </p>
      </header>
      <div className={"gallery-tools"}>
        <label className={"search-field"}>
          <Search size={18} />
          <span className={"sr-only"}>{"Search projects"}</span>
          <input
            value={e}
            onChange={(u) => r(u.target.value)}
            placeholder={"Search projects, tools, or contributions…"}
          />
        </label>
        <label className={"filter-field"}>
          {"Technology"}
          <select value={i} onChange={(u) => s(u.target.value)}>
            {n.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={"result-count"} role={"status"}>
        {a.length} {a.length === 1 ? "project" : "projects"}
      </p>
      <div className={"gallery-grid"}>
        {a.map((u) => (
          <article key={u._id} className={"gallery-card"}>
            <Link to={`/projects/${u.slug}`} aria-label={`View ${u.name}`}>
              <Preview project={u} />
              <div className={"gallery-copy"}>
                <span className={"eyebrow"}>{u.status}</span>
                <div>
                  <h2>{u.name}</h2>
                  <Arrow size={25} />
                </div>
                <p>{u.summary}</p>
                <span className={"contribution"}>{u.contribution}</span>
                <div className={"tags"}>
                  {u.stack.map((c, f) => (
                    <span key={f}>{c}</span>
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {!a.length && (
        <div className={"empty-state"}>
          <h2>
            {o.length ? "No matching projects." : "Projects are on their way."}
          </h2>
          <p>
            {o.length
              ? "Try another keyword or technology."
              : "Check back for published work."}
          </p>
          {o.length > 0 && (
            <button
              className={"button subtle"}
              onClick={() => {
                (r(""), s("All"));
              }}
            >
              {"Clear filters"}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
function ProjectDetails({ p: o, preview: e = !1 }) {
  return (
    <div className={"light-page"}>
      <div className={"case-main container"}>
        <div className={"eyebrow"}>
          {e ? "PRIVATE PREVIEW / " : ""}
          {o.category}
        </div>
        <h1>
          {o.name}
          <span className={"orange"}>{"."}</span>
        </h1>
        <p className={"case-lead"}>{o.summary}</p>
        <div className={"case-facts"}>
          <div>
            <small>{"CONTRIBUTION"}</small>
            <b>{o.contribution}</b>
          </div>
          <div>
            <small>{"STATUS"}</small>
            <b>{o.status}</b>
          </div>
          <div>
            <small>{"STACK / CONTEXT"}</small>
            <b>{o.stack.join(" · ")}</b>
          </div>
        </div>
        <Preview project={o} large={!0} />
        <div className={"case-body"}>
          <section>
            <div className={"eyebrow"}>{"01 / OVERVIEW"}</div>
            <h2>{"What it’s about."}</h2>
            <p>{o.description}</p>
            <h3>{"The problem"}</h3>
            <p>{o.problem || "Problem statement coming soon."}</p>
          </section>
          <section>
            <div className={"eyebrow"}>{"02 / FEATURES"}</div>
            <h2>{"What works. What’s next."}</h2>
            <div className={"feature-columns"}>
              <div>
                <h3>{"Implemented / confirmed"}</h3>
                {o.implementedFeatures.length ? (
                  <ul>
                    {o.implementedFeatures.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{"No completed features independently verified yet."}</p>
                )}
              </div>
              <div>
                <h3>{"Planned / development scope"}</h3>
                {o.plannedFeatures.length ? (
                  <ul>
                    {o.plannedFeatures.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{"No additional planned features documented."}</p>
                )}
              </div>
            </div>
            {o.featureNote && <p className={"scope-note"}>{o.featureNote}</p>}
          </section>
          <section>
            <div className={"eyebrow"}>{"03 / HOW IT FITS TOGETHER"}</div>
            <h2>{"Stack & architecture."}</h2>
            <div className={"tags"}>
              {o.stack.map((r, i) => (
                <span key={i}>{r}</span>
              ))}
            </div>
            <p>
              {o.architecture ||
                "Architecture notes have not been supplied yet."}
            </p>
          </section>
          <section>
            <div className={"eyebrow"}>{"04 / THE PROCESS"}</div>
            <h2>{"My part in the build."}</h2>
            <p>{o.contributionDetail || o.contribution}</p>
            <h3>{"Challenges"}</h3>
            <p>{o.challenges || "Challenge notes coming soon."}</p>
            <h3>{"Learning"}</h3>
            <p>{o.learning || "Learning notes coming soon."}</p>
          </section>
          <section>
            <div className={"eyebrow"}>{"05 / A CLOSER LOOK"}</div>
            <h2>{"Screenshots & demo."}</h2>
            {o.screenshots.length ? (
              o.screenshots.map((r, i) => (
                <figure key={i}>
                  <img
                    className={"case-screenshot"}
                    src={r.src}
                    alt={r.alt}
                    width={r.width}
                    height={r.height}
                    loading={"lazy"}
                  />
                  <figcaption>{r.alt}</figcaption>
                </figure>
              ))
            ) : (
              <p>
                {
                  "Actual screenshots have not been supplied. The preview is an interface concept."
                }
              </p>
            )}
            {o.videoUrl && <DemoVideo url={o.videoUrl} />}
            <div className={"case-links"}>
              {o.repository && (
                <a
                  className={"button dark-button"}
                  href={o.repository}
                  target={"_blank"}
                  rel={"noreferrer"}
                >
                  {"GitHub repository "}
                  <Arrow />
                </a>
              )}
              {o.liveUrl && (
                <a
                  className={"button dark-button"}
                  href={o.liveUrl}
                  target={"_blank"}
                  rel={"noreferrer"}
                >
                  {"Visit live project "}
                  <Arrow />
                </a>
              )}
            </div>
          </section>
        </div>
        {!e && (
          <div className={"case-next"}>
            <Link className={"text-link"} to={"/projects"}>
              <ArrowLeft size={18} />
              {"All projects"}
            </Link>
            <Link className={"text-link"} to={"/contact"}>
              {"Let’s connect "}
              <Arrow />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
function DemoVideo({ url: o }) {
  let e;
  try {
    e = new URL(o);
  } catch {
    return null;
  }
  let r = "";
  if (["www.youtube.com", "youtube.com", "youtu.be"].includes(e.hostname)) {
    const i =
      e.hostname === "youtu.be" ? e.pathname.slice(1) : e.searchParams.get("v");
    /^[\w-]{11}$/.test(i || "") &&
      (r = `https://www.youtube-nocookie.com/embed/${i}`);
  }
  return (
    ["vimeo.com", "www.vimeo.com"].includes(e.hostname) &&
      /^\/\d+$/.test(e.pathname) &&
      (r = `https://player.vimeo.com/video${e.pathname}`),
    r ? (
      <iframe
        className={"demo-video"}
        src={r}
        title={"Project demonstration video"}
        loading={"lazy"}
        allow={"fullscreen; picture-in-picture"}
        referrerPolicy={"strict-origin-when-cross-origin"}
        sandbox={"allow-scripts allow-same-origin allow-presentation"}
      />
    ) : /\.(mp4|webm)$/i.test(e.pathname) ? (
      <video
        className={"demo-video"}
        controls={!0}
        preload={"metadata"}
        src={o}
      >
        {"Your browser does not support video. "}
        <a href={o}>{"Watch the demo"}</a>
      </video>
    ) : (
      <a className={"text-link"} href={o} target={"_blank"} rel={"noreferrer"}>
        {"Watch demo video "}
        <Arrow />
      </a>
    )
  );
}
function CaseStudy() {
  const { slug: o } = useParams(),
    { projects: e } = useSite(),
    r = e.find((s) => s.slug === o),
    i = usePageMotion(o);
  return (
    useSEO(
      (r == null ? void 0 : r.name) || "Project not found",
      (r == null ? void 0 : r.summary) || "This project is not available.",
    ),
    (
      <main id={"main"} ref={i} className={"detail-route page-enter"}>
        {r ? (
          <ProjectDetails p={r} />
        ) : (
          <div className={"not-found"}>
            <h1>{"Project not found."}</h1>
            <p>
              {"This project may be unpublished or its address has changed."}
            </p>
            <Link className={"text-link"} to={"/projects"}>
              {"Browse projects "}
              <Arrow />
            </Link>
          </div>
        )}
      </main>
    )
  );
}
function Contact() {
  const { person: o, hero: e } = useSite(),
    r = usePageMotion();
  useSEO(
    "Contact",
    `Contact ${o.name} about development internships and suitable freelance projects.`,
  );
  const [i, s] = React.useState({
      name: "",
      email: "",
      subject: "Internship opportunity",
      message: "",
      website: "",
    }),
    [t, n] = React.useState(!1),
    [a, u] = React.useState(""),
    [c, f] = React.useState(""),
    [d, p] = React.useState({});
  async function m(h) {
    (h.preventDefault(), n(!0), u(""), f(""), p({}));
    try {
      const b = await api("/contact", {
        method: "POST",
        body: i,
      });
      (f(b.message),
        s({
          name: "",
          email: "",
          subject: "Internship opportunity",
          message: "",
          website: "",
        }));
    } catch (b) {
      (u(b.message), p(b.fields || {}));
    } finally {
      n(!1);
    }
  }
  const D = (h, b, x = "text") => (
    <label>
      {b}
      <input
        name={h}
        type={x}
        autoComplete={h === "name" ? "name" : "email"}
        value={i[h]}
        onChange={(j) =>
          s({
            ...i,
            [h]: j.target.value,
          })
        }
        required={!0}
        maxLength={h === "name" ? 100 : 250}
        aria-invalid={!!d[h]}
      />
      {d[h] && <small className={"field-error"}>{d[h]}</small>}
    </label>
  );
  return (
    <main id={"main"} ref={r} className={"contact-page"}>
      <section className={"container page-heading page-enter"}>
        <div className={"eyebrow"}>{"CONTACT / A CONVERSATION AWAY"}</div>
        <h1>
          {"Have an idea?"}
          <br />
          {"Let’s "}
          <em>{"talk."}</em>
        </h1>
      </section>
      <section className={"contact-section"}>
        <div className={"container contact-grid"}>
          <div data-reveal={!0}>
            <div className={"eyebrow"}>
              <span
                className={`status-dot ${e.available ? "" : "unavailable"}`}
              />
              {e.availability}
            </div>
            <p>{e.introduction}</p>
            <p>{o.location}</p>
            <a className={"email-link"} href={`mailto:${o.email}`}>
              {o.email}
              <Arrow />
            </a>
            <Socials />
          </div>
          <form className={"contact-form"} onSubmit={m} data-reveal={!0}>
            <div className={"form-pair"}>
              {D("name", "Your name")}
              {D("email", "Your email", "email")}
            </div>
            <label>
              {"What’s on your mind?"}
              <select
                value={i.subject}
                onChange={(h) =>
                  s({
                    ...i,
                    subject: h.target.value,
                  })
                }
              >
                <option>{"Internship opportunity"}</option>
                <option>{"Freelance project"}</option>
                <option>{"Let’s connect"}</option>
              </select>
            </label>
            <label>
              {"A little about it"}
              <textarea
                value={i.message}
                onChange={(h) =>
                  s({
                    ...i,
                    message: h.target.value,
                  })
                }
                placeholder={"Tell me about your idea or opportunity…"}
                rows={"5"}
                required={!0}
                minLength={"10"}
                maxLength={"5000"}
                aria-invalid={!!d.message}
              />
              {d.message && (
                <small className={"field-error"}>{d.message}</small>
              )}
            </label>
            <div className={"honeypot"} aria-hidden={"true"}>
              <label>
                {"Website"}
                <input
                  tabIndex={"-1"}
                  autoComplete={"off"}
                  value={i.website}
                  onChange={(h) =>
                    s({
                      ...i,
                      website: h.target.value,
                    })
                  }
                />
              </label>
            </div>
            {a && (
              <div className={"notice error"} role={"alert"}>
                {a}
              </div>
            )}
            {c && (
              <div className={"notice success"} role={"status"}>
                {c}
              </div>
            )}
            <button className={"button primary"} disabled={t}>
              {t ? "Saving inquiry…" : "Send inquiry"}
              <Arrow />
            </button>
            <small>
              {
                "Your message is saved privately for review. Prefer email? Use the address alongside."
              }
            </small>
          </form>
        </div>
      </section>
    </main>
  );
}
function Resume() {
  const {
    person: o,
    education: e,
    biography: r,
    skills: i,
    projects: s,
  } = useSite();
  return (
    useSEO(
      "Resume",
      `${o.name} — education, technical skills, and project contributions.`,
    ),
    (
      <main id={"main"} className={"light-page resume-page"}>
        <header className={"light-nav container no-print"}>
          <Link to={"/about"}>
            <ArrowLeft size={18} />
            {"About me"}
          </Link>
          <div className={"resume-actions"}>
            <button onClick={() => window.print()}>
              <Printer size={17} />
              {"Print / Save PDF"}
            </button>
            {o.resumePdf && (
              <a href={`${o.resumePdf}?download=1`}>
                <Download size={17} />
                {"Download PDF"}
              </a>
            )}
          </div>
        </header>
        <article className={"resume-sheet"}>
          <header className={"resume-header"}>
            <div>
              <div className={"eyebrow"}>{"RESUME"}</div>
              <h1>{o.fullName}</h1>
              <p>{o.role}</p>
            </div>
            <span className={"resume-monogram"}>{"md."}</span>
          </header>
          <div className={"resume-contact"}>
            <span>{o.location}</span>
            <a href={`mailto:${o.email}`}>{o.email}</a>
            {o.github && <a href={o.github}>{"GitHub profile"}</a>}
            {o.linkedin && <a href={o.linkedin}>{"LinkedIn profile"}</a>}
          </div>
          <section>
            <h2>{"Profile"}</h2>
            <p>{r}</p>
          </section>
          <section>
            <h2>{"Education"}</h2>
            {e.map((t, n) => (
              <div key={n}>
                <div className={"resume-between"}>
                  <strong>{t.degree}</strong>
                  <span>{t.graduation && `Expected ${t.graduation}`}</span>
                </div>
                <p>
                  {t.institution}
                  <br />
                  {t.score}
                </p>
              </div>
            ))}
          </section>
          <section>
            <h2>{"Technical skills"}</h2>
            {i.map((t, n) => (
              <p key={n} className={"resume-skill"}>
                <strong>{t.title}</strong>
                <span>{t.items.join(" · ")}</span>
              </p>
            ))}
          </section>
          <section>
            <h2>{"Projects"}</h2>
            {s.map((t) => (
              <article key={t._id} className={"resume-project"}>
                <div className={"resume-between"}>
                  <strong>{t.name}</strong>
                  <span>{t.status}</span>
                </div>
                <p>{t.description}</p>
                <p>
                  <strong>{"Contribution:"}</strong>{" "}
                  {t.contributionDetail || t.contribution}
                </p>
                <p>{t.featureNote}</p>
                {t.repository && <a href={t.repository}>{t.repository}</a>}
              </article>
            ))}
          </section>
          <section>
            <h2>{"Languages"}</h2>
            <p>{o.languages.join(" · ")}</p>
          </section>
        </article>
        {o.resumePdf && (
          <section className={"container no-print pdf-preview"}>
            <h2>{"Uploaded resume"}</h2>
            <object
              data={o.resumePdf}
              type={"application/pdf"}
              width={"100%"}
              height={"800"}
            >
              <a href={o.resumePdf}>{"Open resume PDF"}</a>
            </object>
          </section>
        )}
      </main>
    )
  );
}
export { Home, About, Projects, ProjectDetails, CaseStudy, Contact, Resume };
