import React from "react";
import { motion } from "framer-motion";
import { EASE, EASE_IN_OUT } from "../animations/variants";
import "../styles/pageturn.scss";

// The MakeOnward mark (as in Preloader.jsx): its two strokes fly in from either end of their own slant
const LEFT =
  "M386 216 Q408 190 436 190 H640 Q664 192 663 214 L649 264 Q645 292 632 308 L318 654 Q300 679 274 679 H20 Q5 678 5 662 Q6 654 14 645 Z";
const RIGHT =
  "M906 28 Q922 7 942 7 H1164 Q1187 9 1185 32 L1050 556 Q1044 598 1010 607 L762 686 Q744 690 744 674 L845 322 Q846 315 838 315 H694 Q682 312 682 301 Q684 294 692 285 Z";

// 0 = the orange blade, which leads in and trails out; 1 = the blade in the page's colour
const blade = {
  idle: { x: "-104%", skewX: -18 },
  cover: (i) => ({ x: "0%", skewX: -18, transition: { duration: 0.55, ease: EASE_IN_OUT, delay: i * 0.09 } }),
  reveal: (i) => ({ x: "104%", skewX: -18, transition: { duration: 0.6, ease: EASE_IN_OUT, delay: 0.2 + (1 - i) * 0.09 } }),
};
const stroke = {
  idle: (d) => ({ x: d * 190, y: d * -215, opacity: 0 }),
  cover: (d) => ({ x: 0, y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE, delay: 0.34 + (d > 0 ? 0.07 : 0) } }),
  reveal: (d) => ({ x: d * -60, y: d * 68, opacity: 0, transition: { duration: 0.28, ease: EASE_IN_OUT, delay: 0.14 } }),
};
const word = {
  idle: { y: "110%" },
  cover: { y: "0%", transition: { duration: 0.45, ease: EASE, delay: 0.42 } },
  reveal: { y: "-110%", transition: { duration: 0.28, ease: EASE_IN_OUT, delay: 0.1 } },
};

/**
 * What passes over the screen from one page to the next: an orange blade and one in the page's colour sweep
 * across at the mark's slant, the mark comes together on them with the name of the page, and they sweep on.
 * Driven by `controls` (idle -> cover -> reveal) from App.jsx.
 */
const PageTurn = ({ controls, name }) => (
  <motion.div className="page-turn" initial="idle" animate={controls} aria-hidden="true">
    <motion.span className="page-turn__blade page-turn__blade--lead" custom={0} variants={blade} />
    <motion.span className="page-turn__blade" custom={1} variants={blade} />
    <div className="page-turn__center">
      <svg className="page-turn__mark" viewBox="0 0 1200 692" focusable="false">
        <motion.path d={LEFT} custom={-1} variants={stroke} />
        <motion.path d={RIGHT} custom={1} variants={stroke} />
      </svg>
      <span className="page-turn__name">
        <motion.span variants={word}>{name}</motion.span>
      </span>
    </div>
  </motion.div>
);

export default PageTurn;
