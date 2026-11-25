import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { EASE } from "../animations/variants";
import "../styles/preloader.scss";

const SEEN_KEY = "pdc-preloader-seen";

// The MakeOnward mark, traced from /brand/mark-1200.webp (1200 x 692).
const LEFT =
  "M386 216 Q408 190 436 190 H640 Q664 192 663 214 L649 264 Q645 292 632 308 L318 654 Q300 679 274 679 H20 Q5 678 5 662 Q6 654 14 645 Z";
const RIGHT =
  "M906 28 Q922 7 942 7 H1164 Q1187 9 1185 32 L1050 556 Q1044 598 1010 607 L762 686 Q744 690 744 674 L845 322 Q846 315 838 315 H694 Q682 312 682 301 Q684 294 692 285 Z";
const COVER = "M-20000 -20000 H20000 V20000 H-20000 Z";
// A point well inside the right stroke: the zoom flies through it
const AX = 972;
const AY = 330;
const ZOOM = 46;

const seen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * The logo draws itself, fills with orange as the count runs, then opens: the mark becomes a window that
 * flies past the viewer onto the page. Shown once per session; repeat visits skip it.
 * `onReveal` fires as the window opens (the hero starts then), `onFinish` once it is gone.
 */
const Preloader = ({ onReveal, onFinish }) => {
  const reduce = useReducedMotion();
  const [skip] = useState(seen);
  const [leaving, setLeaving] = useState(false);
  const root = useRef(null);
  const fill = useRef(null);
  const wipe = useRef(null);
  const base = useRef(null);
  const cover = useRef(null);
  const zoom = useRef(null);
  const count = useRef(null);

  useEffect(() => {
    if (skip) {
      onReveal();
      onFinish();
      return undefined;
    }
    let run;
    let dead = false;
    const done = () => {
      if (dead) return;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage unavailable: fine */
      }
      onFinish();
    };
    const leave = () => {
      if (dead) return;
      setLeaving(true);
      onReveal();
      if (reduce) {
        run = animate(1, 0, { duration: 0.25, onUpdate: (v) => { root.current.style.opacity = v; }, onComplete: done });
        return;
      }
      base.current.style.display = "none"; // the mark is now a hole, still plugged by its orange
      run = animate(0, 1, {
        duration: 1.7,
        ease: [0.5, 0, 0.3, 1],
        onUpdate: (v) => {
          const s = ZOOM ** v; // even speed to the eye
          zoom.current.setAttribute("transform", `translate(${AX} ${AY}) scale(${s}) translate(${-AX} ${-AY})`);
          // the orange clears first, then the dark around it, so the page shows through all the way
          fill.current.style.opacity = Math.max(0, 1 - v / 0.45);
          cover.current.style.opacity = Math.min(1, Math.max(0, 1 - (v - 0.15) / 0.65));
        },
        onComplete: done,
      });
    };
    run = animate(0, 1, {
      duration: reduce ? 0.3 : 1.15,
      delay: reduce ? 0 : 0.25,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (v) => {
        wipe.current.setAttribute("transform", `translate(${-640 + v * 1680} 0)`);
        count.current.textContent = String(Math.round(v * 100)).padStart(3, "0");
      },
      onComplete: leave,
    });
    return () => {
      dead = true;
      run.stop();
    };
  }, [skip, reduce, onReveal, onFinish]);

  if (skip) return null;

  const draw = (delay) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <div className={`preloader${leaving ? " is-leaving" : ""}`} ref={root} role="status" aria-label="Loading MakeOnward">
      <svg className="preloader__mark" viewBox="0 0 1200 692" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="preloader-wipe">
            {/* a slanted edge, parallel to the mark's own strokes */}
            <path ref={wipe} d="M-2600 -20 H610 L0 712 H-2600 Z" transform="translate(-640 0)" />
          </clipPath>
        </defs>
        <g ref={zoom}>
          <path ref={cover} className="preloader__cover" d={`${COVER} ${LEFT} ${RIGHT}`} fillRule="evenodd" />
          <g ref={base}>
            <path className="preloader__base" d={LEFT} />
            <path className="preloader__base" d={RIGHT} />
            <motion.path className="preloader__line" d={LEFT} {...draw(0)} />
            <motion.path className="preloader__line" d={RIGHT} {...draw(0.1)} />
          </g>
          <g ref={fill} className="preloader__fill" clipPath="url(#preloader-wipe)">
            <path d={LEFT} />
            <path d={RIGHT} />
          </g>
        </g>
      </svg>
      <div className="preloader__foot" aria-hidden="true">
        <span>MakeOnward</span>
        <span className="preloader__count" ref={count}>000</span>
      </div>
    </div>
  );
};

export default Preloader;
