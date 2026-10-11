import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import gsap from "gsap";
import { ProjectVisual } from "./project-visual";
import "./project-showcase.css";

export function ProjectShowcase({ project }) {
  const frame = useRef(null), progress = useRef(null);
  const [active, setActive] = useState(0), [previous, setPrevious] = useState(null);
  const [ready, setReady] = useState([]), [failed, setFailed] = useState([]);
  const [playing, setPlaying] = useState(true), [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(typeof IntersectionObserver !== "function");
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const shots = project.screenshots.filter(shot => !failed.includes(shot.src));
  const index = active % Math.max(shots.length, 1);
  const loaded = ready.includes(shots[index]?.src);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = event => setReduced(event.matches);
    const visibility = () => setHidden(document.hidden);
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 }) : null;
    observer?.observe(frame.current);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer?.disconnect(); media.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (reduced || !loaded) return;
    const context = gsap.context(() => {
      gsap.fromTo(".showcase-slide.current", { opacity: 0, scale: 1.035 }, { opacity: 1, scale: 1, duration: .7, ease: "power2.out" });
      const outgoing = frame.current.querySelector(".showcase-slide.outgoing");
      if (outgoing) gsap.fromTo(outgoing, { opacity: 1 }, { opacity: 0, duration: .55, ease: "power2.out" });
    }, frame);
    return () => context.revert();
  }, [index, loaded, reduced]);

  useEffect(() => {
    if (!progress.current || shots.length < 2 || !loaded || !playing || reduced || !visible || hidden || hovered || focused) return;
    const element = progress.current;
    const tween = gsap.fromTo(element, { scaleX: 0 }, {
      scaleX: 1, duration: 5, ease: "none", onComplete: () => {
        setPrevious(index);
        setActive((index + 1) % shots.length);
      },
    });
    return () => { tween.kill(); gsap.set(element, { clearProps: "transform" }); };
  }, [index, loaded, playing, reduced, visible, hidden, hovered, focused, shots.length]);

  function move(direction) {
    setPlaying(false);
    setPrevious(index);
    setActive((index + direction + shots.length) % shots.length);
  }

  return <div ref={frame} className={`project-showcase visual-link ${shots.length ? "has-screenshots" : ""}`}
    role="region" aria-roledescription={shots.length > 1 ? "carousel" : undefined} aria-label={`${project.name} preview`}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <Link className="showcase-case-link" to={`/projects/${project.slug}`} aria-label={`Read ${project.name} case study`}>
      {!shots.length ? <ProjectVisual theme={project.theme} /> : <div className="showcase-stage">
        {!loaded && <div className="showcase-loading" role="status">Loading project preview…</div>}
        {shots.map((shot, slideIndex) => {
          // Keep only the visible, outgoing and next frames in memory.
          if (slideIndex !== index && slideIndex !== previous && !(visible && slideIndex === (index + 1) % shots.length)) return null;
          return <img key={shot.src} src={shot.src} alt={slideIndex === index ? shot.alt || `${project.name} screenshot ${slideIndex + 1}` : ""}
            aria-hidden={slideIndex !== index} className={`showcase-slide ${slideIndex === index ? "current" : slideIndex === previous ? "outgoing" : ""}`}
            width={shot.width || 1600} height={shot.height || 1000} loading="lazy" decoding="async"
            onLoad={() => setReady(values => values.includes(shot.src) ? values : [...values, shot.src])}
            onError={() => setFailed(values => values.includes(shot.src) ? values : [...values, shot.src])} />;
        })}
        <span className="showcase-open">Explore project ↗</span>
      </div>}
    </Link>
    {shots.length > 1 && <div className="showcase-controls">
      <span className="showcase-count" aria-live={playing ? "off" : "polite"}>{String(index + 1).padStart(2, "0")} <span>/ {String(shots.length).padStart(2, "0")}</span></span>
      <div className="showcase-progress" aria-hidden="true"><span ref={progress} /></div>
      {!reduced && <button type="button" className="showcase-control" onClick={() => setPlaying(value => !value)} aria-label={`${playing ? "Pause" : "Play"} ${project.name} slideshow`}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>}
      <button type="button" className="showcase-control" onClick={() => move(-1)} aria-label={`Previous ${project.name} screenshot`}><ChevronLeft size={20} /></button>
      <button type="button" className="showcase-control" onClick={() => move(1)} aria-label={`Next ${project.name} screenshot`}><ChevronRight size={20} /></button>
    </div>}
  </div>;
}
