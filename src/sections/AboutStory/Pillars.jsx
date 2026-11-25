import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { RiCompass3Line, RiLightbulbFlashLine, RiCpuLine, RiInfinityLine } from "react-icons/ri";
import { useScenes } from "../../animations/hooks";
import { EASE } from "../../animations/variants";
import Reveal from "../../components/motion/Reveal";
import { PILLARS_COPY } from "../../data/siteCopy";

// Text lives in src/data/siteCopy.js (shared with the crawlable copy); icons stay here, in order.
const PILLAR_ICONS = [RiCompass3Line, RiLightbulbFlashLine, RiCpuLine, RiInfinityLine];
const PILLARS = PILLARS_COPY.map((p, i) => ({ ...p, icon: PILLAR_ICONS[i] }));
const N = PILLARS.length;
const pad = (n) => String(n + 1).padStart(2, "0");

// How far pillar `i` has risen (0 -> 1) at scroll `v`: one after another, then everything rests.
const START = 0.06;
const EACH = 0.19;
const risen = (v, i) => {
  const t = Math.min(1, Math.max(0, (v - START - i * EACH) / EACH));
  return t * t * (3 - 2 * t);
};

const Heading = () => (
  <h2 className="ab-beam__title">
    <span>Four pillars,</span> <em>one way of working</em>
  </h2>
);

const Pillar = ({ pl, i, p, on, onPick }) => {
  const Icon = pl.icon;
  const y = useTransform(p, (v) => `${(1 - risen(v, i)) * 101}%`);
  return (
    <motion.li className={`ab-col${on ? " is-on" : ""}`} style={{ y }}>
      <button type="button" className="ab-col__face" onClick={() => onPick(i)} aria-pressed={on}>
        <span className="ab-col__in">
          <span className="ab-col__top">
            <span className="ab-col__no" aria-hidden="true">{pad(i)}</span>
            <Icon aria-hidden="true" />
          </span>
          <span className="ab-col__title">{pl.title}</span>
          <span className="ab-col__desc">{pl.desc}</span>
        </span>
      </button>
    </motion.li>
  );
};

// The pillars rise one after another and lift the beam that carries the heading: first its left end, then,
// once the second one reaches it, the whole of it. The page holds while the scroll builds it.
const Scene = () => {
  const track = useRef(null);
  const field = useRef(null);
  const [on, setOn] = useState(0);
  const w = useMotionValue(1);
  const h = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0005 });

  useEffect(() => {
    const measure = () => {
      w.set(field.current.offsetWidth);
      h.set(field.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(field.current);
    return () => ro.disconnect();
  }, [w, h]);

  const beam = useTransform([p, w, h], ([v, width, height]) => {
    const left = risen(v, 0);
    // the second pillar meets the sloping beam a third of the way along, and levels it
    const right = Math.max(0, left - (left - risen(v, 1)) * (N - 1));
    const angle = Math.atan2((left - right) * height, width);
    return `translateY(${(1 - left) * height}px) rotate(${angle}rad)`;
  });

  useMotionValueEvent(p, "change", (v) => {
    const i = Math.max(0, Math.min(N - 1, Math.floor((v - START) / EACH - 0.1)));
    setOn((prev) => (prev === i || v > START + N * EACH + 0.02 ? prev : i));
  });

  const active = PILLARS[on];
  return (
    <div className="ab-pillars__track" ref={track}>
      <div className="ab-pillars__stage">
        <span className="st-label">How we work</span>
        <div className="ab-temple">
          <div className="ab-temple__field" ref={field}>
            <motion.div className="ab-beam" style={{ transform: beam }}><Heading /></motion.div>
            <ul className="ab-cols">
              {PILLARS.map((pl, i) => <Pillar key={pl.title} pl={pl} i={i} p={p} on={i === on} onPick={setOn} />)}
            </ul>
          </div>
          <span className="ab-temple__floor" aria-hidden="true" />
        </div>
        {/* phones: the pillars are too slim for words, so the lit one's are down here */}
        <div className="ab-now" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={on} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: EASE }}>
              <h3><span>{pad(on)}</span>{active.title}</h3>
              <p>{active.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Very short screens / reduced motion: already built.
const Still = () => (
  <div className="ab-pillars__still">
    <Reveal as="span" className="st-label">How we work</Reveal>
    <Heading />
    <ul>
      {PILLARS.map((pl, i) => (
        <li key={pl.title}>
          <span className="ab-col__no" aria-hidden="true">{pad(i)}</span>
          <h3>{pl.title}</h3>
          <p>{pl.desc}</p>
        </li>
      ))}
    </ul>
  </div>
);

const Pillars = () => {
  const scenes = useScenes();
  return (
    <section className="ab-pillars" id="pillars" aria-label="How we work">
      {scenes ? <Scene /> : <Still />}
    </section>
  );
};

export default Pillars;
