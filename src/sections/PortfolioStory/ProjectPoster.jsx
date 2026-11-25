import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { useIsDesktop } from "../../animations/hooks";
import { EASE, VIEWPORT } from "../../animations/variants";
import { SlantButton } from "../../components/hero/PageHero";
import { cldSrcSet, cldUrl } from "../Story/cloudinary";
import { PROJECT_FALLBACK } from "../../data/mockups";
import { host, pad } from "./data";

const FALLBACK = PROJECT_FALLBACK;
const onImgError = (e) => {
  if (!e.target.dataset.fb) {
    e.target.dataset.fb = "1";
    e.target.removeAttribute("srcset");
    e.target.src = FALLBACK;
  }
};

// Short screens / reduced motion: the whole project rises into place once.
const rise = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * One project, opened by the scroll. It starts as a huge name and a slanted window onto the site; the page
 * holds while the window opens to the whole frame (from the right, then from the left on the next one), and
 * the project's details come up along its foot. Without the hold it is a plain card.
 */
const ProjectPoster = ({ project, i, n, mode, onOpen }) => {
  const ref = useRef(null);
  const wide = useIsDesktop();
  const flip = i % 2 === 1;
  const scroll = mode === "scroll";
  const tags = Array.isArray(project.tags) ? project.tags.slice(0, 5) : [];
  const type = project.type || project.subtitle;
  const site = host(project.liveUrl);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.0005 });
  // how far the window is shut: 36% from the top, slanted from 52% (at the top) to 40% (at the foot) from a side
  const clipPath = useTransform(p, (v) => {
    const shut = 1 - Math.min(1, Math.max(0, (v - 0.3) / 0.32));
    const top = (wide ? 36 : 0) * shut;
    const near = 52 * shut;
    const foot = 40 * shut;
    return flip
      ? `polygon(0% ${top}%, ${100 - near}% ${top}%, ${100 - foot}% 100%, 0% 100%)`
      : `polygon(${near}% ${top}%, 100% ${top}%, 100% 100%, ${foot}% 100%)`;
  });
  const scale = useTransform(p, [0.1, 0.66], [1.18, 1]);
  const nameX = useTransform(p, [0, 0.24], [flip ? 160 : -160, 0]);
  const nameO = useTransform(p, [0, 0.2, 0.5, 0.6], [0, 1, 1, 0]);
  const windowY = useTransform(p, [0.3, 0.62], [wide ? 0 : 130, 0]); // on phones the window also rises into place
  const barY = useTransform(p, [0.56, 0.76], ["102%", "0%"]);

  const name = (
    <>
      <span className="pf-case__no"><b>{pad(i + 1)}</b> / {pad(n)}</span>
      {project.title}
    </>
  );
  const shot = (
    <button type="button" className="pf-case__shot" onClick={() => onOpen(project)} data-cursor="View" aria-label={`Open ${project.title}`}>
      <motion.img
        src={project.image ? cldUrl(project.image, 1200) : FALLBACK}
        srcSet={project.image ? cldSrcSet(project.image) : undefined}
        sizes="(max-width: 1023px) 100vw, 1400px"
        alt={`${project.title} website`}
        loading="lazy"
        decoding="async"
        onError={onImgError}
        style={scroll ? { scale } : undefined}
      />
    </button>
  );
  const details = (
    <>
      <div className="pf-case__who">
        <h3>{project.title}</h3>
        <p>{[type, project.category, project.year].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="pf-case__what">
        {project.description && <p>{project.description}</p>}
        {tags.length > 0 && (
          <ul aria-label="Technologies and disciplines">
            {tags.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>
      <div className="pf-case__go">
        <SlantButton onClick={() => onOpen(project)}>View project</SlantButton>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            {site || "Visit site"} <HiOutlineArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
    </>
  );

  if (!scroll) {
    return (
      <motion.li ref={ref} className="pf-case pf-case--plain" variants={rise} initial="hidden" whileInView="show" viewport={VIEWPORT}>
        <span className="pf-case__no"><b>{pad(i + 1)}</b> / {pad(n)}</span>
        {shot}
        <div className="pf-case__bar">{details}</div>
      </motion.li>
    );
  }

  return (
    <li ref={ref} className={`pf-case${flip ? " is-flipped" : ""}`}>
      <div className="pf-case__stage">
        <motion.p className="pf-case__name" style={{ x: nameX, opacity: nameO }} aria-hidden="true">{name}</motion.p>
        <div className="pf-case__frame">
          <motion.div className="pf-case__window" style={{ clipPath, y: windowY }}>{shot}</motion.div>
          <motion.div className="pf-case__bar" style={{ y: barY }}>{details}</motion.div>
        </div>
      </div>
    </li>
  );
};

export default ProjectPoster;
