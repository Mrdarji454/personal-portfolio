import * as React from "react";
import { PortraitPlaceholder } from "./PortraitPlaceholder";
import { Link } from "react-router-dom";
import { Arrow } from "./ui";
import { useSite } from "./site";
import { ProjectVisual } from "./project-visual";
import { ProjectShowcase } from "./ProjectShowcase";
function Portrait({ person, eager = false }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [person.portrait]);
  if (!person.portrait || failed) return <PortraitPlaceholder />;
  return <img className="profile-image" src={person.portrait} alt={`${person.name}, portrait`} width="600" height="720" loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
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
      <ProjectShowcase key={`${o.slug}:${o.screenshots.map(shot => shot.src).join(",")}`} project={o} />
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
