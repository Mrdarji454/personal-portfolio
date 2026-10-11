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
import { useDrawer } from "./useDrawer";
function Arrow({ size: r = 18 }) {
  return <ArrowUpRight size={r} aria-hidden={"true"} />;
}
function Nav() {
  const { person } = useSite();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const panelRef = React.useRef(null), triggerRef = React.useRef(null);
  const close = React.useCallback(() => setOpen(false), []);
  useDrawer(open, panelRef, triggerRef, close);
  React.useEffect(() => close(), [location.pathname, close]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    {open && <div className="drawer-backdrop public-drawer-backdrop" onClick={close} aria-hidden="true" />}
    <header className="nav-shell">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" to="/">m<span className="brand-dot">.</span><span>{person.name}</span></Link>
        <button id="menu-toggle" ref={triggerRef} className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(value => !value)}><Menu /></button>
        <div id="nav-links" ref={panelRef} tabIndex={-1} className={`nav-links ${open ? "open" : ""}`} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label={open ? "Navigation menu" : undefined}>
          <div className="drawer-heading"><span>Explore the portfolio</span><button className="icon-button drawer-close" onClick={close} aria-label="Close navigation menu"><X /></button></div>
          {[["Home", "/"], ["About", "/about"], ["Projects", "/projects"], ["Contact", "/contact"]].map(([name, url]) => <NavLink key={url} to={url} end={url === "/"} className={({ isActive }) => isActive ? "active" : ""}>{name}<Arrow size={16} /></NavLink>)}
          <NavLink className="nav-resume" to="/resume">Resume <Arrow size={16} /></NavLink>
        </div>
      </nav>
    </header>
  </>;
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
