import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { HiPause, HiPlay } from "react-icons/hi2";
import { usePrefersReducedMotion } from "../../animations/hooks";
import { EASE } from "../../animations/variants";
import { useCms } from "../../context/CmsContext";
import { useReady } from "../../animations/ReadyContext";
import HeroDust from "../../components/hero/HeroDust";
import { useEnter } from "../../components/hero/PageHero";
import { DrawerSkeleton } from "../../components/Skeleton";
import { projectSlug } from "../../data/projects";
import { cldUrl } from "../Story/cloudinary";
import { pad } from "./data";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/portfolio");

const CARDS = 12; // a full drawer; with fewer projects they repeat, keeping their own numbers
const SWEEP = 1500; // ms per card while the drawer sweeps by itself
const TURN = -50; // degrees a filed card is turned away
const mix = (a, b, t) => a + (b - a) * t;

// The part of a wide screenshot that reads well in a tall card
const FRAMES = {
  "elv8-fitness": { top: "-14%", height: "150%", objectPosition: "90% 50%" },
  mehfil: { objectPosition: "84% 50%" },
  aksharcanvas: { objectPosition: "82% 50%" },
  petmitra: { top: "-11%", height: "132%", objectPosition: "94% 50%" },
  "ocean-rare": { objectPosition: "50% 50%" },
  ghgamezone: { objectPosition: "88% 50%" },
  "moti-restro": { top: "0", height: "100%", objectPosition: "100% 50%" },
};

// One filed card. `pos` is the (springy, fractional) place in the drawer being looked at: the card there
// stands up and faces front, its neighbours rise a little, so a sweep runs through the drawer as a wave.
const Card = ({ item, i, pos, onFocus, onOpen }) => {
  const k = useTransform(pos, (p) => Math.exp(-(((i - p) / 0.6) ** 2)));
  const rotate = useTransform(k, (v) => mix(TURN, 2, v));
  const lift = useTransform(k, (v) => mix(0, -38, v));
  const transform = useMotionTemplate`translateY(${lift}%) rotateY(${rotate}deg)`;
  const tab = useTransform(k, [0.25, 0.9], [0, 1]);
  const { project, no, copy } = item;

  return (
    <motion.button
      type="button"
      className="drawer__card"
      style={{ transform }}
      tabIndex={copy ? -1 : undefined}
      aria-hidden={copy || undefined}
      aria-label={`Open ${project.title}`}
      onFocus={(e) => e.target.matches(":focus-visible") && onFocus(i)}
      onClick={(e) => e.detail === 0 && onOpen(project)} // keyboard; the mouse is handled by the drawer
    >
      <motion.span className="drawer__tab" style={{ opacity: tab }} aria-hidden="true">
        {pad(no)} · {project.title}
      </motion.span>
      <span className="drawer__face">
        <img src={cldUrl(project.image, 1200)} style={FRAMES[projectSlug(project.title)]} alt="" decoding="async" draggable="false" />
      </span>
    </motion.button>
  );
};

const Drawer = ({ projects, onOpen }) => {
  const box = useRef(null);
  const ready = useReady();
  const { selectedProjectModal } = useCms();
  const reduce = usePrefersReducedMotion();
  const inView = useInView(box, { amount: 0.4 });
  const enter = useEnter();
  const items = useMemo(
    () =>
      Array.from({ length: Math.max(CARDS, projects.length) }, (_, i) => ({
        project: projects[i % projects.length],
        no: (i % projects.length) + 1,
        copy: i >= projects.length,
      })),
    [projects]
  );
  const n = items.length;
  const [at, setAt] = useState(n - 5);
  const [choice, setChoice] = useState(null);
  const [held, setHeld] = useState(false); // pointer or keyboard is on the drawer
  const pos = useSpring(n - 5, { stiffness: 130, damping: 21, mass: 0.7 });
  const playing = choice ?? !reduce;
  const dir = useRef(1);
  const touchLift = useRef(false);

  useEffect(() => {
    pos.set(at);
  }, [at, pos]);

  useEffect(() => {
    if (!playing || held || !inView || !ready || selectedProjectModal) return undefined;
    const t = setInterval(
      () =>
        setAt((i) => {
          if (i + dir.current > n - 1 || i + dir.current < 0) dir.current *= -1;
          return i + dir.current;
        }),
      SWEEP
    );
    return () => clearInterval(t);
  }, [playing, held, inView, ready, n, selectedProjectModal]);

  // The card under the pointer, going by where the cards stand when filed (so a risen card never gets in
  // the way): the front-most one whose span, seen in perspective, holds the pointer. Over the risen part of
  // a card, that card stays.
  const pointAt = (e) => {
    const el = box.current;
    const r = el.getBoundingClientRect();
    const slots = [...el.querySelectorAll(".drawer__slot")];
    const w = slots[0].offsetWidth;
    const h = slots[0].offsetHeight;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const up = slots[at].offsetLeft;
    if (y < r.height - h * 0.62 && x >= up - 8 && x <= up + w + 8) {
      touchLift.current = false;
      return;
    }
    const P = parseFloat(getComputedStyle(el).perspective) || r.width;
    const rad = (TURN * Math.PI) / 180;
    const near = P / (P + w * Math.sin(rad));
    let best = n - 1;
    for (let i = 0; i < n; i++) {
      const right = r.width / 2 + (slots[i].offsetLeft - r.width / 2 + w * Math.cos(rad)) * near;
      if (x <= right) {
        best = i;
        break;
      }
    }
    touchLift.current = e.pointerType !== "mouse" && best !== at;
    setAt(best);
  };
  const active = items[at];

  return (
    <>
      <div
        className="drawer"
        ref={box}
        data-cursor="View"
        onPointerEnter={() => setHeld(true)}
        onPointerMove={pointAt}
        onPointerDown={pointAt}
        onPointerLeave={() => setHeld(false)}
        onBlur={() => setHeld(false)}
        onClick={(e) => {
          // touch: the first tap lifts a card, the next one opens it
          if (e.detail > 0 && !touchLift.current) onOpen(active.project);
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="drawer__slot"
            style={{ left: `calc(var(--from) + (var(--to) - var(--from)) * ${n > 1 ? i / (n - 1) : 0})`, zIndex: n - i }}
            initial={reduce ? { opacity: 0 } : { y: "55%", opacity: 0 }}
            animate={ready ? { y: "0%", opacity: 1 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 + i * 0.05 }}
          >
            <Card
              item={item}
              i={i}
              pos={pos}
              onOpen={onOpen}
              onFocus={(j) => {
                setHeld(true);
                setAt(j);
              }}
            />
          </motion.div>
        ))}
      </div>
      <div className="drawer__fade" aria-hidden="true" />
      <motion.div className="drawer__bar" {...enter(0.8)}>
        <span className="drawer__name" aria-hidden="true">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={active.no}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <b>{active.project.title}</b> <small>No. {pad(active.no)}</small>
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="drawer__hint">
          <span>Sweep to browse</span>
          <button type="button" onClick={() => setChoice(!playing)} aria-label={playing ? "Pause the drawer" : "Play the drawer"}>
            {playing ? <HiPause /> : <HiPlay />}
          </button>
        </span>
      </motion.div>
    </>
  );
};

// The work filed in a drawer, on its own light panel.
const PortfolioHero = ({ projects, onOpen }) => {
  const enter = useEnter();
  const root = useRef(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const { cmsReady } = useCms();
  const shown = useMemo(() => projects.filter((p) => p.image), [projects]);
  return (
    <section className="drawer-hero" id="top" ref={root} aria-label="Portfolio introduction">
      <HeroDust running={inView && !reduce} />
      <div className="drawer-hero__panel">
        <motion.h1 className="drawer-hero__title" {...enter(0.1)}>
          <span className="drawer-hero__sr">{SEO.kicker}. </span>
          Work that speaks
          <span>for itself.</span>
        </motion.h1>
        <motion.p className="drawer-hero__lead" {...enter(0.25)}>
          {shown.length > 0 && (
            <b>
              {shown.length} {shown.length === 1 ? "project" : "projects"}{" "}
            </b>
          )}
          {shown.length > 0 ? "on file. " : ""}
          {SEO.lead}
        </motion.p>
        {shown.length > 0 && <Drawer key={shown.length} projects={shown} onOpen={onOpen} />}
        {shown.length === 0 && !cmsReady && <DrawerSkeleton />}
      </div>
    </section>
  );
};

export default PortfolioHero;
