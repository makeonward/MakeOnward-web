import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { scrollToTarget } from "../../animations/lenis";
import ServicePhoto from "./ServicePhoto";
import ServiceText from "./ServiceText";
import { pad } from "./data";

// Slanted columns side by side. The page holds while the scroll opens them one after another, left to right.
const Columns = ({ group, openContact }) => {
  const track = useRef(null);
  const [open, setOpen] = useState(0);
  const c = group.items.length;
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setOpen(Math.max(0, Math.min(c - 1, Math.floor(v * c)))));

  return (
    <div className="sv-cols" ref={track} style={{ "--c": c }}>
      {group.items.map(({ n }, j) => (
        <span key={n} className="sv-mark sv-mark--col" id={`service-${n + 1}`} style={{ "--j": j }} aria-hidden="true" />
      ))}
      <div className="sv-cols__stage">
        {group.items.map(({ service, n }, j) => (
          <article key={service.id || service.title} className={`sv-col${j === open ? " is-open" : ""}`} aria-labelledby={`service-title-${n + 1}`}>
            <div className="sv-col__photo"><ServicePhoto service={service} sizes="60vw" /></div>
            <h3 id={`service-title-${n + 1}`}>
              <button type="button" aria-expanded={j === open} onClick={() => scrollToTarget(`#service-${n + 1}`, { offset: -90 })}>
                <span className="sv-no" aria-hidden="true">{pad(n + 1)}</span>
                <span>{service.title}</span>
              </button>
            </h3>
            <div className="sv-col__in" inert={j !== open}>
              <ServiceText service={service} openContact={openContact} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Columns;
