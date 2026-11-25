import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useSpring, useTransform, wrap } from "framer-motion";
import { HiPause, HiPlay } from "react-icons/hi2";
import { useReady } from "../../animations/ReadyContext";
import { usePrefersReducedMotion } from "../../animations/hooks";
import { scrollToTarget } from "../../animations/lenis";
import { EASE } from "../../animations/variants";
import { SlantButton, useEnter } from "../../components/hero/PageHero";
import HeroDust from "../../components/hero/HeroDust";
import { pad, serviceMockup } from "./data";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/services");

const EVERY = 2200; // ms on each service while the tower climbs by itself
const TURN = 44; // degrees between two steps of the spiral (--r in pagehero.scss follows from it)
const RISE = 46; // how far each step drops, as a percentage of a card's height
const REACH = 3.4; // steps drawn on either side of the current one
const DIGITS = Array.from({ length: 10 }, (_, i) => i);

// One step of the staircase. `at` is the (fractional, endless) step now facing the viewer; the stairs go round,
// so a step that has left at one end comes back at the other, out of sight.
const Card = ({ service, i, n, at, current, onPick }) => {
  const picture = serviceMockup(service.visual);
  const away = (p) => wrap(-n / 2, n / 2, i - p);
  const reach = Math.min(REACH, n / 2);
  const transform = useTransform(at, (p) => {
    const d = away(p);
    return `translateY(${d * RISE}%) rotateY(${d * TURN}deg) translateZ(var(--r)) `;
  });
  const opacity = useTransform(at, (p) => {
    const d = Math.abs(away(p));
    return d > reach ? 0 : Math.min(1, (reach - d) * 1.1);
  });
  const visibility = useTransform(at, (p) => (Math.abs(away(p)) > reach ? "hidden" : "visible"));
  const shade = useTransform(at, (p) => Math.min(0.72, Math.abs(away(p)) * 0.3));

  return (
    <motion.button
      type="button"
      className={`tower__card${current ? " is-current" : ""}`}
      style={{ transform, opacity, visibility }}
      tabIndex={current ? 0 : -1}
      aria-hidden={!current}
      onClick={() => onPick(i, current)}
      aria-label={`See ${service.title}`}
      data-cursor={current ? "Go" : undefined}
    >
      <img src={picture.src} srcSet={picture.srcSet} sizes="(max-width: 1023px) 38vw, 440px" alt="" draggable="false" decoding="async" />
      <motion.span className="tower__shade" style={{ opacity: shade }} />
    </motion.button>
  );
};

// A two-digit counter whose digits roll like an odometer.
const Odometer = ({ value }) => (
  <span className="tower__odo" aria-hidden="true">
    {pad(value).split("").map((d, k) => (
      <span className="tower__digit" key={k}>
        <span style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
          {DIGITS.map((x) => <i key={x}>{x}</i>)}
        </span>
      </span>
    ))}
  </span>
);

// The services as a spiral staircase in 3D that climbs by itself, round and round; a drag or a click climbs it
// too. The counter rolls to the step you are on.
const ServicesHero = ({ services, openContact }) => {
  const root = useRef(null);
  const scene = useRef(null);
  const reduce = usePrefersReducedMotion();
  const ready = useReady();
  const inView = useInView(root, { amount: 0.35 });
  const enter = useEnter();
  const n = services.length;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [held, setHeld] = useState(false); // being dragged, or keyboard focus on a step
  const [nudge, setNudge] = useState(0); // a click restarts the wait
  const drag = useRef(null);
  const dragged = useRef(false);
  const target = useRef(0);
  const at = useSpring(0, { stiffness: 46, damping: 15, mass: 1 });
  const playing = choice ?? !reduce;
  useMotionValueEvent(at, "change", (p) => n && setIndex(wrap(0, n, Math.round(p))));

  useEffect(() => {
    if (!playing || held || !inView || !ready || n < 2) return undefined;
    const t = setInterval(() => {
      target.current = Math.round(target.current) + 1;
      at.set(target.current);
    }, EVERY);
    return () => clearInterval(t);
  }, [playing, held, inView, ready, n, at, nudge]);

  const pick = (i, current) => {
    if (dragged.current) return;
    if (current) {
      scrollToTarget(`#service-${i + 1}`, { offset: -90 });
      return;
    }
    const from = Math.round(target.current);
    target.current = from + wrap(-n / 2, n / 2, i - from); // the short way round
    at.set(target.current);
    setNudge((k) => k + 1);
  };

  // Dragging climbs too, and settles on the nearest step.
  useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      const dy = d.y - e.clientY + (d.x - e.clientX);
      if (Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) > 8) dragged.current = true;
      d.x = e.clientX;
      d.y = e.clientY;
      if (!dragged.current) return;
      target.current += dy / 120;
      at.set(target.current);
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      setHeld(false);
      target.current = Math.round(target.current);
      at.set(target.current);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [at]);

  const active = services[index];

  return (
    <section className="tower" id="top" ref={root} aria-label="Services introduction">
      <HeroDust sceneRef={scene} running={inView && !reduce} />
      <div className="tower__stage">
        <div className="tower__copy">
          <motion.h1 className="tower__title" {...enter(0.1)}>
            <span className="h1-kicker">{SEO.kicker}</span>
            {SEO.h1}
          </motion.h1>
          <motion.div className="tower__now" {...enter(0.3)}>
            <Odometer value={index + 1} />
            <span className="tower__clip">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.b
                  key={index}
                  initial={reduce ? { opacity: 0 } : { x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { x: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {active?.title}
                </motion.b>
              </AnimatePresence>
            </span>
            <small>
              Drag to climb
              <button type="button" onClick={() => setChoice(!playing)} aria-label={playing ? "Pause the tower" : "Play the tower"}>
                {playing ? <HiPause /> : <HiPlay />}
              </button>
            </small>
          </motion.div>
          <motion.div className="ph__actions" {...enter(0.5)}>
            <SlantButton onClick={openContact}>Discuss your project</SlantButton>
            <SlantButton line to="/pricing">See pricing</SlantButton>
          </motion.div>
          <p className="tower__sr">{SEO.lead}</p>
        </div>

        <motion.div
          className="tower__scene"
          ref={scene}
          {...enter(0.4)}
          onPointerDown={(e) => {
            dragged.current = false;
            if (e.pointerType !== "mouse") return;
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
            setHeld(true);
          }}
          onFocus={(e) => e.target.matches(":focus-visible") && setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div className="tower__spin">
            {services.map((s, i) => (
              <Card key={s.id || s.title} service={s} i={i} n={n} at={at} current={i === index} onPick={pick} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesHero;
