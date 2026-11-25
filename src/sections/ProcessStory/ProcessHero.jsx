import React from "react";
import { motion } from "framer-motion";
import { useReady } from "../../animations/ReadyContext";
import { scrollToTarget } from "../../animations/lenis";
import { EASE, EASE_IN_OUT } from "../../animations/variants";
import PageHero, { SlantButton } from "../../components/hero/PageHero";
import { jumpToPhase } from "./jump";
import { PHASES, pad } from "./data";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/process");

const N = PHASES.length;

// The page's own idea: seven steps that climb across the screen, each a little taller than the last, up to
// the orange one: launch day's side of the stairs. A click goes to that phase.
const ProcessHero = ({ openContact }) => {
  const ready = useReady();
  return (
    <PageHero
      variant="stairs"
      label="Our process"
      kicker={SEO.kicker}
      lines={["From first call", "to launch day."]}
      lead={SEO.lead}
      actions={
        <>
          <SlantButton onClick={() => scrollToTarget("#journey", { offset: 0 })}>Follow the journey</SlantButton>
          <SlantButton line onClick={openContact}>Talk to us</SlantButton>
        </>
      }
    >
      <ol className="ph-stairs" aria-label="Phases">
        {PHASES.map((phase, i) => (
          <li key={phase.short} style={{ "--s": i, "--n": N }}>
            <button type="button" onClick={() => jumpToPhase(i, N)} aria-label={`Phase ${pad(i + 1)}: ${phase.name}`} data-cursor="Go">
              <motion.span
                className="ph-stairs__label"
                initial={{ opacity: 0 }}
                animate={ready ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, ease: EASE, delay: 1.1 + i * 0.1 }}
              >
                <b>{pad(i + 1)}</b>
                {phase.short}
              </motion.span>
              <motion.span
                className="ph-stairs__bar"
                initial={{ scaleY: 0 }}
                animate={ready ? { scaleY: 1 } : undefined}
                transition={{ duration: 1, ease: EASE_IN_OUT, delay: 0.4 + i * 0.1 }}
              />
            </button>
          </li>
        ))}
      </ol>
    </PageHero>
  );
};

export default ProcessHero;
