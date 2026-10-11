import * as React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowUp,
  Menu,
  X,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { useSite } from "./site";
function Arrow({ size: r = 18 }) {
  return <ArrowUpRight size={r} aria-hidden={"true"} />;
}
function Nav() {
  const { person: r } = useSite(),
    [f, h] = React.useState(!1),
    y = useLocation();
  return (
    React.useEffect(() => {
      const p = (b) => {
        var C;
        b.key === "Escape" &&
          f &&
          (h(!1),
          (C = document.getElementById("menu-toggle")) == null || C.focus());
      };
      return (
        window.addEventListener("keydown", p),
        () => window.removeEventListener("keydown", p)
      );
    }, [f]),
    React.useEffect(() => h(!1), [y.pathname]),
    (
      <>
        <a className={"skip-link"} href={"#main"}>
          {"Skip to content"}
        </a>
        <header className={"nav-shell"}>
          <nav className={"nav"} aria-label={"Main navigation"}>
            <Link className={"brand"} to={"/"}>
              {"m"}
              <span className={"brand-dot"}>{"."}</span>
              <span>{r.name}</span>
            </Link>
            <button
              id={"menu-toggle"}
              className={"menu-toggle"}
              aria-label={f ? "Close menu" : "Open menu"}
              aria-expanded={f}
              aria-controls={"nav-links"}
              onClick={() => h(!f)}
            >
              {f ? <X /> : <Menu />}
            </button>
            <div id={"nav-links"} className={`nav-links ${f ? "open" : ""}`}>
              {[
                ["Home", "/"],
                ["About", "/about"],
                ["Projects", "/projects"],
                ["Contact", "/contact"],
              ].map(([p, b]) => (
                <NavLink
                  key={p}
                  to={b}
                  end={b === "/"}
                  className={({ isActive: C }) => (C ? "active" : "")}
                >
                  {p}
                </NavLink>
              ))}
              <NavLink className={"nav-resume"} to={"/resume"}>
                {"Resume "}
                <Arrow size={14} />
              </NavLink>
            </div>
          </nav>
        </header>
      </>
    )
  );
}
function Footer() {
  const { person: r } = useSite();
  return (
    <footer className={"footer container"}>
      <span>
        {"© "}
        {new Date().getFullYear()} {r.name}
      </span>
      <span>{"Built with care. Always learning."}</span>
      <button
        className={"back-top"}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        }
      >
        {"Back to top "}
        <ArrowUp size={16} />
      </button>
    </footer>
  );
}
function Socials() {
  const { person: r } = useSite();
  return (
    <div className={"socials"}>
      {r.github && (
        <a href={r.github} target={"_blank"} rel={"noreferrer"}>
          <Github size={18} />
          {"GitHub "}
          <Arrow size={14} />
        </a>
      )}
      {r.linkedin && (
        <a href={r.linkedin} target={"_blank"} rel={"noreferrer"}>
          <Linkedin size={18} />
          {"LinkedIn "}
          <Arrow size={14} />
        </a>
      )}
      <a href={`mailto:${r.email}`}>
        <Mail size={18} />
        {"Email "}
        <Arrow size={14} />
      </a>
    </div>
  );
}
export { Arrow, Nav, Footer, Socials };
export { ProjectVisual } from "./project-visual";
