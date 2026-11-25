import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useFinePointer, usePrefersReducedMotion } from "../../animations/hooks";
import { useEnter } from "../../components/hero/PageHero";

const POINTS = 72;
const TAU = Math.PI * 2;
const RING = Array.from({ length: POINTS }, (_, i) => {
  const a = (i / POINTS) * TAU;
  return { a, c: Math.cos(a), s: Math.sin(a) };
});
const near = (v, p) => Math.sign(v) * Math.abs(v) ** p;

/**
 * Frames whose outlines never hold still: each is a soft shape that keeps morphing, dents and leans away from
 * the pointer, and settles into a calm rounded square, a little larger, while it is pointed at.
 * `frames`: [{ key, area, node, label, onClick }]; `area` is a .morph__frame--<area> box in pagehero.scss.
 */
const MorphFrames = ({ frames, running }) => {
  const root = useRef(null);
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enter = useEnter();

  useEffect(() => {
    const el = root.current;
    const list = [...el.querySelectorAll(".morph__frame")].map((frame, i) => ({
      frame,
      shape: frame.firstElementChild,
      seed: i * 2.17,
      settle: 0,
      over: false,
      x: 0,
      y: 0,
    }));
    const mouse = { x: -1e4, y: -1e4 };
    let raf = 0;
    let last = 0;

    const draw = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = now / 1000;
      const ease = 1 - Math.exp(-dt * 6);
      const host = el.getBoundingClientRect();
      const boxes = list.map((f) => [f.frame.offsetLeft, f.frame.offsetTop, f.frame.offsetWidth, f.frame.offsetHeight]); // all reads first

      list.forEach((f, i) => {
        const [bx, by, w, h] = boxes[i];
        const cx = host.left + bx + w / 2;
        const cy = host.top + by + h / 2;
        f.settle += ((f.over ? 1 : 0) - f.settle) * ease;

        // the whole frame drifts away from the pointer
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const push = f.over ? 0 : Math.max(0, 1 - dist / (Math.max(w, h) * 1.5)) * 26;
        f.x += ((dx / dist) * push - f.x) * ease;
        f.y += ((dy / dist) * push - f.y) * ease;
        const calm = f.settle;
        f.shape.style.transform = `translate(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px) scale(${(0.94 + calm * 0.08).toFixed(4)})`;

        const loose = 1 - calm;
        const n = 2 / (3 + calm * 1.6); // how square the outline is
        const mx = mouse.x - cx - f.x;
        const my = mouse.y - cy - f.y;
        const dentAt = Math.min(w, h) * 0.75;
        let d = "";
        RING.forEach(({ a, c, s }, k) => {
          const wave =
            0.5 + 0.5 * Math.sin(2 * a + t * 0.55 + f.seed) * 0.6 + 0.5 * Math.sin(3 * a - t * 0.42 + f.seed * 1.7) * 0.4;
          const r = 1 - loose * (0.02 + 0.2 * wave);
          let x = near(c, n) * (w / 2) * r;
          let y = near(s, n) * (h / 2) * r;
          const ex = x - mx;
          const ey = y - my;
          const e = Math.hypot(ex, ey);
          if (loose > 0.02 && e < dentAt) {
            const pull = (1 - e / dentAt) ** 2 * 0.2 * loose; // only ever inwards, so the picture always fills
            x *= 1 - pull;
            y *= 1 - pull;
          }
          d += `${k ? "L" : "M"}${(x + w / 2).toFixed(1)} ${(y + h / 2).toFixed(1)}`;
        });
        f.shape.style.clipPath = `path("${d}Z")`;
      });
      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    const offs = list.map((f) => {
      const on = () => {
        f.over = true;
      };
      const off = () => {
        f.over = false;
      };
      const events = [["pointerenter", on], ["focusin", on], ["pointerleave", off], ["focusout", off]];
      events.forEach(([name, fn]) => f.frame.addEventListener(name, fn));
      return () => events.forEach(([name, fn]) => f.frame.removeEventListener(name, fn));
    });
    const host = el.parentElement;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(draw);
    // keeps the still outline right when nothing is running
    const ro = new ResizeObserver(() => (!running || reduce) && draw(last || 0));
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      offs.forEach((off) => off());
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [running, reduce, frames]);

  return (
    <div className={`morph__frames${fine ? "" : " is-touch"}`} ref={root}>
      {frames.map((f, i) => (
        <button
          type="button"
          key={f.key}
          className={`morph__frame morph__frame--${f.area}`}
          onClick={f.onClick}
          disabled={!f.onClick}
          aria-label={f.label ? `Meet ${f.label.name}, ${f.label.role}` : undefined}
          aria-hidden={f.label ? undefined : true}
          tabIndex={f.label ? undefined : -1}
        >
          <span className="morph__shape">
            <motion.span className="morph__pic" {...enter(0.3 + i * 0.12)}>{f.node}</motion.span>
            {f.label && (
              <span className="morph__label" aria-hidden="true">
                <b>{f.label.name.split(" ")[0]}</b>
                <span>{f.label.role}</span>
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MorphFrames;
