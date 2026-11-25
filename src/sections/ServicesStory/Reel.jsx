import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import ServicePhoto from "./ServicePhoto";
import ServiceText from "./ServiceText";
import { pad } from "./data";

// The services as frames of a film. Locked, the page holds and the scroll runs the film sideways, one pixel
// for one; otherwise the strip is swiped.
const Reel = ({ group, locked, openContact }) => {
  const track = useRef(null);
  const film = useRef(null);
  const [run, setRun] = useState(0); // how far the film travels
  const [stops, setStops] = useState([]); // how far it has gone when each frame is in the middle

  useEffect(() => {
    if (!locked) return undefined;
    const measure = () => {
      const view = film.current.parentElement.clientWidth;
      const max = Math.max(0, film.current.offsetWidth - view);
      setRun(max);
      setStops(
        [...film.current.querySelectorAll(".sv-frame")].map((f) => Math.max(0, Math.min(max, f.offsetLeft - (view - f.offsetWidth) / 2)))
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(film.current);
    ro.observe(film.current.parentElement);
    return () => ro.disconnect();
  }, [locked, group]);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 36, mass: 0.4 });
  const x = useTransform(p, (v) => -v * run);

  return (
    <div className={`sv-reel${locked ? " is-locked" : ""}`} ref={track} style={locked ? { "--run": `${run}px` } : undefined}>
      {locked &&
        group.items.map(({ n }, j) => (
          <span key={n} className="sv-mark" id={`service-${n + 1}`} style={{ top: (stops[j] || 0) + 90 }} aria-hidden="true" />
        ))}
      <div className="sv-reel__stage">
        <motion.div className="sv-reel__film" ref={film} style={locked ? { x } : undefined}>
          {group.items.map(({ service, n }) => (
            <article
              key={service.id || service.title}
              className="sv-frame"
              id={locked ? undefined : `service-${n + 1}`}
              aria-labelledby={`service-title-${n + 1}`}
            >
              <div className="sv-frame__photo">
                <ServicePhoto service={service} sizes="(max-width: 1023px) 86vw, 46vw" />
                <h3 id={`service-title-${n + 1}`}>
                  <span className="sv-no" aria-hidden="true">{pad(n + 1)}</span>
                  {service.title}
                </h3>
              </div>
              <ServiceText service={service} openContact={openContact} />
            </article>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Reel;
