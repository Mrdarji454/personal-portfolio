import { useId } from "react";
import "./portrait-backdrop.css";

// Decorative only: the uploaded photo and fallback portrait stay in front.
export function PortraitBackdrop() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="portrait-atmosphere" aria-hidden="true">
      <div className="portrait-glow portrait-glow-primary" />
      <div className="portrait-glow portrait-glow-secondary" />
      <svg className="portrait-grid" viewBox="0 0 480 560" focusable="false">
        <defs>
          <pattern id={`${id}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth=".7" />
            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
          </pattern>
          <radialGradient id={`${id}-fade`}>
            <stop offset="15%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id={`${id}-mask`}>
            <rect width="480" height="560" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
        <rect width="480" height="560" fill={`url(#${id}-grid)`} mask={`url(#${id}-mask)`} />
      </svg>
      <div className="portrait-orbits">
        <div className="portrait-track portrait-track-a">
          <svg viewBox="0 0 480 480" focusable="false">
            <g transform="rotate(-28 240 240)">
              <ellipse className="portrait-orbit-line" cx="240" cy="240" rx="222" ry="170" />
              <ellipse className="portrait-orbit-trail" cx="240" cy="240" rx="222" ry="170" strokeDasharray="110 1080" />
              <circle className="portrait-orbit-light" cx="462" cy="240" r="5" />
              <circle cx="18" cy="240" r="3" fill="currentColor" opacity=".5" />
            </g>
          </svg>
        </div>
        <div className="portrait-track portrait-track-b">
          <svg viewBox="0 0 480 480" focusable="false">
            <g transform="rotate(35 240 240)">
              <ellipse className="portrait-orbit-line" cx="240" cy="240" rx="202" ry="218" />
              <ellipse className="portrait-orbit-trail" cx="240" cy="240" rx="202" ry="218" strokeDasharray="75 1245" />
              <circle className="portrait-orbit-light" cx="38" cy="240" r="4" />
            </g>
          </svg>
        </div>
      </div>
      <div className="portrait-sparks">
        {[ [12, 22], [87, 18], [8, 55], [92, 64], [18, 80], [79, 85] ].map(([left, top], index) => (
          <span className={`portrait-spark spark-${index}`} key={index} style={{ left: `${left}%`, top: `${top}%` }} />
        ))}
      </div>
    </div>
  );
}
