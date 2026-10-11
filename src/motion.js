import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function usePageMotion(dependency) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      if (conditions.reduced) return;
      const desktop = conditions.desktop;
      const context = gsap.context(() => {
        gsap.from(".page-enter", { opacity: 0, y: desktop ? 18 : 0, duration: desktop ? .5 : .25, ease: "power2.out" });
        const heroes = gsap.utils.toArray(".hero-reveal");
        if (heroes.length) gsap.from(heroes, { opacity: 0, y: desktop ? 28 : 8, stagger: desktop ? .09 : .035, duration: desktop ? .7 : .35, ease: "power3.out" });
        gsap.utils.toArray("[data-reveal]").forEach(target => gsap.from(target, { y: desktop ? 28 : 8, opacity: 0, duration: desktop ? .7 : .35, scrollTrigger: { trigger: target, start: "top 96%", once: true } }));
        if (!desktop) return;
        if (ref.current.querySelector(".journey-list")) gsap.to(".journey-progress", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".journey-list", start: "top 75%", end: "bottom 60%", scrub: true } });
        if (ref.current.querySelector(".orbit-ring")) {
          gsap.to(".orbit-ring", { rotation: 360, repeat: -1, duration: 95, ease: "none" });
          gsap.to(".orbit-icon", { rotation: -360, repeat: -1, duration: 95, ease: "none" });
        }
        gsap.utils.toArray(".project-row .project-visual").forEach(target => gsap.fromTo(target, { y: 10 }, { y: -10, ease: "none", scrollTrigger: { trigger: target, start: "top bottom", end: "bottom top", scrub: 1 } }));
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, [dependency]);
  return ref;
}
function pauseOrbit(o, e) {
  const r = o.currentTarget;
  (!e && (r.matches(":hover") || r.contains(document.activeElement))) ||
    gsap
      .getTweensOf(r.querySelectorAll(".orbit-ring, .orbit-icon"))
      .forEach((i) => (e ? i.pause() : i.resume()));
}
function useSEO(o, e, r = !1) {
  React.useEffect(() => {
    document.title = `${o} | Mukesh Darji`;
    const i = (s, t, n) => {
      let a = document.querySelector(`meta[${s}="${t}"]`);
      (a ||
        ((a = document.createElement("meta")),
        a.setAttribute(s, t),
        document.head.appendChild(a)),
        (a.content = n));
    };
    (i("name", "description", e),
      i("property", "og:title", `${o} | Mukesh Darji`),
      i("property", "og:description", e),
      i("property", "og:url", window.location.href),
      i(
        "name",
        "robots",
        r || window.location.pathname.startsWith("/admin")
          ? "noindex, nofollow"
          : "index, follow",
      ));
  }, [o, e, r]);
}
export { usePageMotion, pauseOrbit, useSEO };
