import React from "react";
import { motion } from "framer-motion";
import { EASE, EASE_IN_OUT } from "../../animations/variants";
import { usePrefersReducedMotion } from "../../animations/hooks";
import { scrollToTarget } from "../../animations/lenis";
import ServicePhoto from "./ServicePhoto";
import ServiceText from "./ServiceText";
import { pad } from "./data";

const SEEN = { once: true, amount: 0.25 };
const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.15 } } };
const CUT = "polygon(var(--cut) 0%, 100% 0%, 100% 100%, 0% 100%)"; // the mark's own slant
const SHUT = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
const wipe = { hidden: { clipPath: SHUT }, show: { clipPath: CUT, transition: { duration: 1.1, ease: EASE_IN_OUT } } };

// One service as a filed sheet: a tab that always shows (number and title), and under it the service and a
// photo cut at the mark's slant. With room, the sheets of a chapter pile up as you scroll (servicesstory.scss).
const ServiceCard = ({ service, n, j, total, openContact }) => {
  const reduce = usePrefersReducedMotion();
  const motionOn = reduce ? {} : { initial: "hidden", whileInView: "show", viewport: SEEN };

  return (
    <>
      <span className="sv-anchor" id={`service-${n + 1}`} style={{ "--j": j }} aria-hidden="true" />
      <article className="sv-sheet" style={{ "--j": j }} aria-labelledby={`service-title-${n + 1}`}>
        <h3 className="sv-sheet__tab" id={`service-title-${n + 1}`}>
          <button type="button" onClick={() => scrollToTarget(`#service-${n + 1}`, { offset: -90 })}>
            <span className="sv-no" aria-hidden="true">{pad(n + 1)}</span>
            <span className="sv-sheet__t">{service.title}</span>
            <span className="sv-sheet__of" aria-hidden="true">{pad(n + 1)} / {pad(total)}</span>
          </button>
        </h3>
        <div className="sv-sheet__in">
          <motion.div className="sv-sheet__copy" variants={rise} {...motionOn}>
            <ServiceText service={service} openContact={openContact} />
          </motion.div>
          <motion.div className="sv-sheet__photo" {...motionOn}>
            <motion.span className="sv-sheet__cut" variants={wipe} style={reduce ? { clipPath: CUT } : undefined}>
              <ServicePhoto service={service} sizes="(max-width: 1023px) 100vw, 52vw" />
            </motion.span>
          </motion.div>
        </div>
      </article>
    </>
  );
};

export default ServiceCard;
