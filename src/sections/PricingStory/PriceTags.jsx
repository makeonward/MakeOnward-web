import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";
import { usePrefersReducedMotion } from "../../animations/hooks";
import { useReady } from "../../animations/ReadyContext";
import { EASE } from "../../animations/variants";
import { Sk } from "../../components/Skeleton";
import { categoryFrom } from "../../data/pricing";

const EVERY = 2600; // ms each tag is lit while nobody is pointing
const GHOSTS = Array.from({ length: 6 }, (_, i) => ({ slug: `ghost-${i}`, ghost: true }));

/**
 * The price list as swing tags hanging on strings, short and long in turn. They sway a little in the air, a
 * passing pointer knocks them, and one at a time is lit in orange. A click goes to that service's plans.
 */
const PriceTags = ({ categories, pricesReady, onJump }) => {
  const root = useRef(null);
  const ready = useReady();
  const reduce = usePrefersReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const [lit, setLit] = useState(0);
  const [held, setHeld] = useState(false);
  const swing = useRef([]); // { angle, speed } per tag, in radians
  const items = pricesReady ? categories : GHOSTS;
  const n = items.length;
  const moving = ready && inView && !reduce;

  useEffect(() => {
    if (!moving || held || !pricesReady || n < 2) return undefined;
    const t = setInterval(
      () =>
        setLit((i) => {
          const next = (i + 1) % n;
          if (swing.current[next]) swing.current[next].speed += next % 2 ? 0.12 : -0.3;
          return next;
        }),
      EVERY
    );
    return () => clearInterval(t);
  }, [moving, held, pricesReady, n]);

  useEffect(() => {
    const tags = [...root.current.querySelectorAll(".tags__hang")];
    swing.current = tags.map((_, i) => swing.current[i] || { angle: (i % 2 ? 1 : -1) * 0.08, speed: 0 });
    if (!moving) return undefined;
    let raf = 0;
    let last = 0;
    const step = (now) => {
      const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016;
      last = now;
      tags.forEach((el, i) => {
        const s = swing.current[i];
        const pull = i % 2 ? 7 : 13; // a longer string swings more slowly
        const air = Math.sin((now / 1000) * 0.7 + i * 1.9) * (i % 2 ? 0.08 : 0.14);
        s.speed += (-pull * Math.sin(s.angle) - 1.1 * s.speed + air) * dt;
        s.angle = Math.max(-0.4, Math.min(0.4, s.angle + s.speed * dt));
        el.style.transform = `rotate(${s.angle.toFixed(4)}rad)`;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [moving, n, pricesReady]);

  const knock = (i) => (e) => {
    if (e.pointerType !== "mouse" || !swing.current[i]) return;
    const push = Math.max(-14, Math.min(14, e.movementX));
    swing.current[i].speed = Math.max(-3, Math.min(3, swing.current[i].speed - push * 0.035));
  };

  return (
    <nav className="tags" aria-label="Price guide" aria-busy={!pricesReady} ref={root} style={{ "--n": n }}>
      {items.map((c, i) => {
        const from = c.ghost ? null : categoryFrom(c);
        return (
          <motion.div
            key={c.slug}
            className={`tags__drop${i % 2 ? " is-long" : ""}`}
            style={{ "--i": i }}
            initial={reduce ? { opacity: 0 } : { y: "-110%" }}
            animate={ready ? { y: "0%", opacity: 1 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: 0.25 + i * 0.08 }}
          >
            <div className="tags__hang">
              <span className="tags__string" aria-hidden="true" />
              {c.ghost ? (
                <span className="tags__tag"><Sk className="sk--fill" /></span>
              ) : (
                <button
                  type="button"
                  className={`tags__tag${i === lit ? " is-lit" : ""}`}
                  onPointerEnter={() => {
                    setLit(i);
                    setHeld(true);
                  }}
                  onPointerLeave={() => setHeld(false)}
                  onPointerMove={knock(i)}
                  onFocus={() => {
                    setLit(i);
                    setHeld(true);
                  }}
                  onBlur={() => setHeld(false)}
                  onClick={() => onJump(c.slug)}
                  aria-label={`${c.title}: ${from ? `starting from ${from}` : "on request"}`}
                >
                  <span className="tags__title">{c.title}</span>
                  <span className="tags__price">
                    <small>{from ? "From" : "Priced"}</small>
                    <b>{from || "On request"}</b>
                  </span>
                  <HiArrowRight aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </nav>
  );
};

export default PriceTags;
