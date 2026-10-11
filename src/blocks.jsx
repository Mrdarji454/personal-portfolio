import { Link } from "react-router-dom";
import { Arrow } from "./ui";
import { useSite } from "./site";
import { ProjectVisual } from "./project-visual";
function Portrait({ person: o, eager: e = !1 }) {
  return (
    <img
      className={"profile-image"}
      src={o.portrait || "/portrait-placeholder.svg"}
      alt={
        o.portrait
          ? `${o.name}, portrait`
          : "Illustrated portrait placeholder; replaceable with a real photo"
      }
      width={"600"}
      height={"720"}
      loading={e ? "eager" : "lazy"}
      onError={(r) => {
        r.currentTarget.src.endsWith("portrait-placeholder.svg") ||
          (r.currentTarget.src = "/portrait-placeholder.svg");
      }}
    />
  );
}
function Preview({ project: o, large: e = !1 }) {
  return o.screenshots.length ? (
    <img
      className={`project-cover ${e ? "large" : ""}`}
      src={o.screenshots[0].src}
      alt={o.screenshots[0].alt}
      width={o.screenshots[0].width}
      height={o.screenshots[0].height}
      loading={"lazy"}
    />
  ) : (
    <ProjectVisual theme={o.theme} large={e} />
  );
}
function ProjectRow({ project: o, index: e = 0 }) {
  return (
    <article className={`project-row project-${o.theme}`} data-reveal={!0}>
      <Link
        className={"visual-link"}
        to={`/projects/${o.slug}`}
        aria-label={`Read ${o.name} case study`}
      >
        <Preview project={o} />
      </Link>
      <div className={"project-copy"}>
        <div className={"project-meta"}>
          <span>
            {String(e + 1).padStart(2, "0")}
            {" / "}
            {o.category}
          </span>
          <span className={"project-status"}>
            <i />
            {o.status}
          </span>
        </div>
        <h3>{o.name}</h3>
        <p className={"project-summary"}>{o.summary}</p>
        <p>{o.description}</p>
        <div className={"tags"}>
          {o.stack.map((r, i) => (
            <span key={i}>{r}</span>
          ))}
        </div>
        <div className={"contribution"}>{o.contribution}</div>
        <Link className={"text-link"} to={`/projects/${o.slug}`}>
          {"View Case Study "}
          <Arrow />
        </Link>
      </div>
    </article>
  );
}
function ContactCTA() {
  const { hero: o } = useSite();
  return (
    <section className={"contact-section"}>
      <div className={"container compact-cta"} data-reveal={!0}>
        <div>
          <div className={"eyebrow"}>{"LET’S MAKE SOMETHING USEFUL"}</div>
          <h2>
            {"Good ideas start"}
            <br />
            {"with a "}
            <em>{"conversation."}</em>
          </h2>
          <p>{o.availability}</p>
        </div>
        <Link className={"button primary"} to={"/contact"}>
          {"Let’s connect "}
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
function SkillList({ skills: o }) {
  return (
    <div className={"skill-list"}>
      {o.map((e, r) => (
        <div key={r} className={"skill-row"} data-reveal={!0}>
          <span className={"skill-number"}>
            {"0"}
            {r + 1}
          </span>
          <h3>{e.title}</h3>
          <div>
            {e.items.map((i, s) => (
              <span key={s}>{i}</span>
            ))}
          </div>
          <Arrow size={24} />
        </div>
      ))}
    </div>
  );
}
export { Portrait, Preview, ProjectRow, ContactCTA, SkillList };
