import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useIsDesktop } from "../../animations/hooks";
import ServicePhoto from "./ServicePhoto";
import ServiceText from "./ServiceText";
import { pad } from "./data";

// One service across the whole screen. The photo slides in from its edge of the screen and the words from the
// other, with the scroll; every other band is mirrored.
const Band = ({ service, n, flip, locked, openContact }) => {
  const ref = useRef(null);
  const wide = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: wide ? ["start end", "center 58%"] : ["start 95%", "start 30%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const side = flip ? 1 : -1;
  const photoX = useTransform(p, [0, 1], [`${side * 70}%`, "0%"]);
  const textX = useTransform(p, [0, 1], [side * (wide ? -180 : -90), 0]);
  const opacity = useTransform(p, [0.15, 0.8], [0, 1]);

  return (
    <article className={`sv-band${flip ? " is-flipped" : ""}`} id={`service-${n + 1}`} ref={ref} aria-labelledby={`service-title-${n + 1}`}>
      <motion.div className="sv-band__photo" style={locked ? { x: photoX } : undefined}>
        <ServicePhoto service={service} sizes="(max-width: 1023px) 100vw, 56vw" />
      </motion.div>
      <motion.div className="sv-band__copy" style={locked ? { x: textX, opacity } : undefined}>
        <h3 id={`service-title-${n + 1}`}>
          <span className="sv-no" aria-hidden="true">{pad(n + 1)}</span>
          {service.title}
        </h3>
        <ServiceText service={service} openContact={openContact} />
      </motion.div>
    </article>
  );
};

const Bands = ({ group, locked, openContact }) => (
  <div className="sv-bands">
    {group.items.map(({ service, n }, j) => (
      <Band key={service.id || service.title} service={service} n={n} flip={j % 2 === 1} locked={locked} openContact={openContact} />
    ))}
  </div>
);

export default Bands;
