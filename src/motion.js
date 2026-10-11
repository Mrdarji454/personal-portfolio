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
      let cleanupBackdrop = () => {};
      const context = gsap.context(() => {
        gsap.from(".page-enter", { opacity: 0, y: desktop ? 18 : 0, duration: desktop ? .5 : .25, ease: "power2.out" });
        const heroes = gsap.utils.toArray(".hero-reveal");
        if (heroes.length) gsap.from(heroes, { opacity: 0, y: desktop ? 28 : 8, stagger: desktop ? .09 : .035, duration: desktop ? .7 : .35, ease: "power3.out" });
        gsap.utils.toArray("[data-reveal]").forEach(target => gsap.from(target, { y: desktop ? 28 : 8, opacity: 0, duration: desktop ? .7 : .35, scrollTrigger: { trigger: target, start: "top 96%", once: true } }));
        gsap.utils.toArray(".project-row").forEach(row => gsap.from(row.querySelectorAll(".project-copy > *"), {
          y: desktop ? 16 : 6, opacity: 0, stagger: desktop ? .065 : .025, duration: desktop ? .55 : .3, ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
        }));
        const backdrop = ref.current.querySelector(".portrait-atmosphere");
        if (backdrop) {
          const ambient = [
            gsap.to(".portrait-track-a", { rotation: 360, duration: desktop ? 42 : 60, repeat: -1, ease: "none" }),
            gsap.to(".portrait-glow-primary", { scale: 1.15, opacity: .9, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
          ];
          if (desktop) {
            ambient.push(
              gsap.to(".portrait-track-b", { rotation: -360, duration: 55, repeat: -1, ease: "none" }),
              gsap.to(".portrait-glow-secondary", { x: 18, y: -15, scale: 1.1, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" }),
              gsap.to(".portrait-spark", { y: -12, opacity: .25, duration: 3, stagger: .4, repeat: -1, yoyo: true, ease: "sine.inOut" }),
            );
          }
          // Stop background work when the hero or browser tab is out of view.
          let visible = true;
          const sync = () => ambient.forEach(tween => tween.paused(!visible || document.hidden));
          const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }) : null;
          observer?.observe(backdrop);
          document.addEventListener("visibilitychange", sync);
          sync();
          cleanupBackdrop = () => { observer?.disconnect(); document.removeEventListener("visibilitychange", sync); };
        }
        if (ref.current.querySelector(".orbit-ring")) {
          // The icon and label counter-rotate together to stay level on both axes.
          gsap.timeline({ repeat: -1 })
            .to(".orbit-ring", { rotation: 360, duration: 60, ease: "none" }, 0)
            .to(".orbit-counter", { rotation: -360, duration: 60, ease: "none" }, 0);
        }
        if (!desktop) return;
        if (ref.current.querySelector(".journey-list")) gsap.to(".journey-progress", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".journey-list", start: "top 75%", end: "bottom 60%", scrub: true } });
        gsap.utils.toArray(".project-row .project-visual").forEach(target => gsap.fromTo(target, { y: 10 }, { y: -10, ease: "none", scrollTrigger: { trigger: target, start: "top bottom", end: "bottom top", scrub: 1 } }));
      }, ref);
      return () => { cleanupBackdrop(); context.revert(); };
    });
    return () => media.revert();
  }, [dependency]);
  return ref;
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
export { usePageMotion, useSEO };
