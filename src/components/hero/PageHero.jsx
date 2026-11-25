import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import { useReady } from "../../animations/ReadyContext";
import { EASE } from "../../animations/variants";
import Magnetic from "../buttons/Magnetic";
import MaskText from "../motion/MaskText";
import "../../styles/pagehero.scss";

// One quiet entrance for everything in a hero, after the preloader.
export const useEnter = () => {
  const ready = useReady();
  return (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: EASE, delay },
  });
};

// Slanted button (the angle of the mark). `to` makes it a link.
export const SlantButton = ({ children, line = false, to, onClick }) => {
  const cls = `st-slant${line ? " st-slant--line" : ""}`;
  const inner = (
    <>
      <span>{children}</span>
      {!line && <HiArrowRight aria-hidden="true" />}
    </>
  );
  return (
    <Magnetic strength={0.2}>
      {to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" className={cls} onClick={onClick}>{inner}</button>}
    </Magnetic>
  );
};

/**
 * The frame every inner-page hero shares: one screen, plain page colour, keyword line + headline, a short
 * intro and at most two actions. Each page adds a single idea of its own as `children`, placed by
 * `variant` (a .ph--<variant> grid in pagehero.scss).
 */
const PageHero = ({ variant, kicker, lines, lead, note, actions, label, children }) => {
  const enter = useEnter();
  return (
    <section className={`ph ph--${variant}`} id="top" aria-label={label}>
      <div className="ph__inner">
        <div className="ph__copy">
          <MaskText as="h1" className="ph__title" onReady delay={1} lines={[<span className="h1-kicker" key="k">{kicker}</span>, ...lines]} />
          {lead && <motion.p className="ph__lead" {...enter(0.55)}>{lead}</motion.p>}
          {actions && <motion.div className="ph__actions" {...enter(0.7)}>{actions}</motion.div>}
          {note && <motion.p className="ph__note" {...enter(0.85)}>{note}</motion.p>}
        </div>
        {children}
      </div>
    </section>
  );
};

export default PageHero;
