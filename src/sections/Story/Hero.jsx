import React, { useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight, HiPause, HiPlay } from "react-icons/hi2";
import { useCms } from "../../context/CmsContext";
import { useReady } from "../../animations/ReadyContext";
import { useFinePointer } from "../../animations/hooks";
import { scrollToTarget } from "../../animations/lenis";
import { EASE } from "../../animations/variants";
import Magnetic from "../../components/buttons/Magnetic";
import ChromeLogo from "./ChromeLogo";
import "../../styles/pagehero.scss"; // slanted buttons
import { StageLight } from "./HeroAtmosphere";
import HeroCursor from "./HeroCursor";
import HeroRail from "./HeroRail";
import { heroMockup } from "../../data/mockups";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/");

// The two tall cards: what we do, shown with our own projects. Each opens its service page.
const CARDS = [
  { label: "Websites", to: "/services/website-development", ...heroMockup("websites") },
  { label: "Apps", to: "/services/app-development", ...heroMockup("apps") },
];

// Chapter 0 — the promise. Exactly one screen: the logo and two actions, two tall pictures of what we do, a
// draggable rail of every project, and a cursor that labels what it is over. The headline and intro stay
// in the page for search engines and screen readers.
const Hero = () => {
  const ref = useRef(null);
  const ready = useReady();
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const inView = useInView(ref, { amount: 0.25 });
  const { portfolioProjects, isContactModalOpen, setIsContactModalOpen, selectedProjectModal, setSelectedProjectModal } = useCms();

  const rail = useMemo(() => portfolioProjects.filter((p) => p.image), [portfolioProjects]);

  // null = the visitor has not chosen: the rail drifts, unless they asked their system for less motion.
  const [choice, setChoice] = useState(null);
  const playing = choice ?? !reduce;
  const running = playing && ready && inView && !isContactModalOpen && !selectedProjectModal;
  const showCursor = fine && !reduce;

  const enter = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section className={`st-hero${showCursor ? " has-cursor" : ""}`} id="hero" ref={ref} aria-label="Introduction">
      <div className="st-hero__inner">
        <div className="st-hero__brand">
          <div className="st-hero__sr">
            <h1>
              {SEO.kicker}: {SEO.h1}
            </h1>
            <p>{SEO.lead}</p>
          </div>
          <div className="st-hero__logo">
            <StageLight ready={ready} reduce={reduce} />
            <ChromeLogo ready={ready} />
          </div>
          <motion.div className="st-hero__ctas" {...enter(0.75)}>
            <Magnetic strength={0.2}>
              <button type="button" className="st-slant" onClick={() => setIsContactModalOpen(true)}>
                <span>Get started</span>
                <HiArrowRight />
              </button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <button type="button" className="st-slant st-slant--line" onClick={() => scrollToTarget("#work")}>
                <span>Our work</span>
              </button>
            </Magnetic>
          </motion.div>
        </div>

        {CARDS.map((card, i) => (
          <motion.div className="st-hero__cell" key={card.label} {...enter(0.45 + i * 0.15)}>
            <Link className="st-hero__card" to={card.to} data-hero-cursor="View" aria-label={`${card.label}: see this service`} draggable="false">
              <img
                sizes="(max-width: 1023px) 46vw, 24vw"
                srcSet={card.srcSet}
                src={card.src}
                alt=""
                fetchPriority={i ? "auto" : "high"}
                decoding="async"
                draggable="false"
              />
              <span aria-hidden="true">
                <i>{card.label}</i>
                <i>0{i + 1}</i>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Always here, so the layout is the same while the projects are still on their way */}
      <motion.div className="st-hero__base" {...enter(1)}>
        <div className="st-hero__archive">
          <p>
            <b>Our work</b>
            <span>Drag the rail</span>
          </p>
          <button type="button" onClick={() => setChoice(!playing)} aria-label={playing ? "Pause moving images" : "Play moving images"}>
            {playing ? <HiPause /> : <HiPlay />}
          </button>
        </div>
        <HeroRail projects={rail} running={running} onOpen={setSelectedProjectModal} />
      </motion.div>

      {showCursor && <HeroCursor rootRef={ref} />}
    </section>
  );
};

export default Hero;
