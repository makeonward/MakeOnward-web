import React, { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, wrap } from "framer-motion";
import { cldUrl } from "./cloudinary";

const DRIFT = 30; // px per second

// Endless strip of the projects, cut at the angle of the mark. The one in the middle stands up in full light
// with its name, its neighbours step back. Drifts on its own while `running`, can be dragged or thrown, and a click
// opens the project.
const HeroRail = ({ projects, running, onOpen }) => {
  const rail = useRef(null);
  const set = useRef(null);
  const x = useMotionValue(0);
  const drag = useRef(null);
  const velocity = useRef(0); // px per second left over from a throw

  const moved = useRef(false); // a press that travelled is a drag, not a click
  const held = useRef(false); // keyboard focus inside

  // Enough copies to fill the widest rail while one of them is off screen
  const copies = Math.max(2, Math.ceil(2000 / ((projects.length || 8) * 70)) + 1);
  const shift = (dx) => {
    const w = set.current?.offsetWidth;
    if (w) x.set(wrap(-w, 0, x.get() + dx));
  };

  // How near the middle each card is (0 -> 1), as --k; only written when it changes
  const light = () => {
    const el = rail.current;
    const w = set.current?.offsetWidth;
    if (!el || !w) return;
    const mid = el.clientWidth / 2;
    [...el.firstElementChild.children].forEach((group, c) => {
      const left = c * w + x.get();
      [...group.children].forEach((card) => {
        const d = Math.abs(left + card.offsetLeft - group.offsetLeft + card.offsetWidth / 2 - mid) / (card.offsetWidth * 1.35);
        const k = Math.max(0, 1 - d);
        const v = (k * k * (3 - 2 * k)).toFixed(2);
        if (card.dataset.k !== v) {
          card.dataset.k = v;
          card.style.setProperty("--k", v);
        }
      });
    });
  };

  useAnimationFrame((_, delta) => {
    if (drag.current) {
      light();
      return;
    }
    const dt = Math.min(delta, 60) / 1000;
    velocity.current *= Math.exp(-2.6 * dt);
    if (Math.abs(velocity.current) < 6) velocity.current = 0;
    const v = velocity.current || (running && !held.current ? -DRIFT : 0);
    if (v) shift(v * dt);
    light();
  });

  useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      if (Math.abs(e.clientX - d.start) > 6) moved.current = true;
      if (!moved.current) return;
      const dx = e.clientX - d.x;
      const v = (dx / Math.max(1, e.timeStamp - d.t)) * 1000;
      velocity.current = Math.max(-2400, Math.min(2400, 0.7 * v + 0.3 * velocity.current));
      d.x = e.clientX;
      d.t = e.timeStamp;
      shift(dx);
    };
    const onUp = (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      if (e.type === "pointercancel" || e.timeStamp - d.t > 90) velocity.current = 0; // stopped before letting go
      drag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="st-reelrail"
      ref={rail}
      data-hero-cursor="Drag"
      onPointerDown={(e) => {
        velocity.current = 0;
        moved.current = false;
        drag.current = { id: e.pointerId, x: e.clientX, start: e.clientX, t: e.timeStamp };
      }}
      onFocus={(e) => {
        if (!e.target.matches(":focus-visible")) return;
        // Bring the focused project into view and hold still
        held.current = true;
        velocity.current = 0;
        e.currentTarget.scrollLeft = 0;
        x.set(-Math.max(0, e.target.offsetLeft - 120));
      }}
      onBlur={() => {
        held.current = false;
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <motion.div className="st-reelrail__track" style={{ x }}>
        {Array.from({ length: copies }, (_, c) => (
          <div className="st-reelrail__set" key={c} ref={c === 0 ? set : undefined} aria-hidden={c > 0 || undefined}>
            {!projects.length && Array.from({ length: 8 }, (_, i) => <span className="st-reelrail__item" key={i}><span className="st-reelrail__face sk" /></span>)}
            {projects.map((p) => (
              <button
                type="button"
                className="st-reelrail__item"
                key={p.id}
                tabIndex={c > 0 ? -1 : undefined}
                aria-label={`View project: ${p.title}`}
                onClick={() => !moved.current && onOpen(p)}
              >
                <span className="st-reelrail__face">
                  <img src={cldUrl(p.image, 600)} alt="" loading="lazy" decoding="async" draggable="false" />
                  <span className="st-reelrail__name" aria-hidden="true">{p.title}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroRail;
