import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function usePageMotion(o) {
  const e = React.useRef(null);
  return (
    React.useEffect(() => {
      const r = gsap.matchMedia();
      return (
        r.add("(prefers-reduced-motion: no-preference)", () => {
          const i = gsap.context(() => {
            gsap.from(".page-enter", {
              opacity: 0,
              y: 18,
              duration: 0.5,
              ease: "power2.out",
            });
            const s = gsap.utils.toArray(".hero-reveal");
            (s.length &&
              gsap.timeline().from(s, {
                y: 28,
                opacity: 0,
                stagger: 0.09,
                duration: 0.7,
                ease: "power3.out",
              }),
              gsap.utils.toArray("[data-reveal]").forEach((t) =>
                gsap.from(t, {
                  y: 28,
                  opacity: 0,
                  duration: 0.7,
                  scrollTrigger: {
                    trigger: t,
                    start: "top 94%",
                    once: !0,
                  },
                }),
              ),
              e.current.querySelector(".journey-list") &&
                gsap.to(".journey-progress", {
                  scaleY: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: ".journey-list",
                    start: "top 75%",
                    end: "bottom 60%",
                    scrub: !0,
                  },
                }),
              e.current.querySelector(".orbit-ring") &&
                (gsap.to(".orbit-ring", {
                  rotation: 360,
                  repeat: -1,
                  duration: 95,
                  ease: "none",
                }),
                gsap.to(".orbit-icon", {
                  rotation: -360,
                  repeat: -1,
                  duration: 95,
                  ease: "none",
                })));
          }, e);
          return () => i.revert();
        }),
        r.add(
          "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          () => {
            const i = gsap.context(() => {
              gsap.utils.toArray(".project-row .project-visual").forEach((s) =>
                gsap.fromTo(
                  s,
                  {
                    y: 10,
                  },
                  {
                    y: -10,
                    ease: "none",
                    scrollTrigger: {
                      trigger: s,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 1,
                    },
                  },
                ),
              );
            }, e);
            return () => i.revert();
          },
        ),
        () => r.revert()
      );
    }, [o]),
    e
  );
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
