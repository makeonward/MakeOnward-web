import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  LayoutGroup,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { HiArrowRight, HiOutlineArrowUpRight } from "react-icons/hi2";
import { useCms } from "../../context/CmsContext";
import { useFinePointer, useMediaQuery, usePrefersReducedMotion } from "../../animations/hooks";
import { getLenis, scrollToTarget } from "../../animations/lenis";
import { EASE } from "../../animations/variants";
import Reveal from "../../components/motion/Reveal";
import { WorkSkeleton } from "../../components/Skeleton";
import MaskText from "../../components/motion/MaskText";
import { projectStatus } from "../../data/projects";
import { cldUrl, cldSrcSet } from "./cloudinary";

const MAX = 7;
const BLADES = 6;
const STEP = 75; // scroll (in svh) each project gets while the section is locked
const pad = (n) => String(n).padStart(2, "0");

const useProjects = () => {
  const { portfolioProjects } = useCms();
  return useMemo(() => {
    const featured = portfolioProjects.filter((p) => p.featured);
    return (featured.length ? featured : portfolioProjects).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [portfolioProjects]);
};

// Label, title, filter pills (pop in with a spring) and the "view all" link.
const Header = ({ categories, filter, setFilter }) => (
  <div className="st-work__intro">
    <div>
      <Reveal as="span" className="st-label">Featured work</Reveal>
      <MaskText as="h2" className="st-title" lines={["Our Recent Projects"]} />
    </div>
    <LayoutGroup id="work-filter">
      <div className="st-filters" role="group" aria-label="Filter projects">
        {categories.map((c, i) => (
          <motion.button
            key={c}
            type="button"
            aria-pressed={filter === c}
            className={`st-filter ${filter === c ? "is-active" : ""}`}
            onClick={() => setFilter(c)}
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.25 + i * 0.07 }}
          >
            {filter === c && <motion.span layoutId="work-filter-pill" className="st-filter__pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="st-filter__text">{c}</span>
          </motion.button>
        ))}
      </div>
    </LayoutGroup>
    <Link to="/portfolio" className="st-link" data-cursor="Open">
      View All Projects <HiArrowRight />
    </Link>
  </div>
);

// One project on the screen, cut into slanted blades that slide into place one after the other. Each
// blade is a moving window; the picture inside moves the other way, so the picture itself holds still.
const Layer = ({ project, up }) => (
  <span className={`st-screen__layer${up ? " is-up" : ""}`} aria-hidden="true">
    {Array.from({ length: BLADES }, (_, i) => (
      <span className="st-screen__blade" key={i} style={{ "--b": i }}>
        <span className="st-screen__inner">
          <img
            src={cldUrl(project.image, 1200)}
            srcSet={cldSrcSet(project.image)}
            sizes="(max-width: 1023px) 100vw, 64vw"
            alt=""
            decoding="async"
            draggable="false"
          />
        </span>
      </span>
    ))}
  </span>
);

// `scroll` (0 -> 1 over the locked section) picks the project; `jump` scrolls to one. Without the lock
// (reduced motion, very short screens) `scroll` is null and a click on a name picks it.
const Showcase = ({ projects, onOpen, scroll, jump }) => {
  const ref = useRef(null);
  const list = useRef(null);
  const reduce = usePrefersReducedMotion();
  const fine = useFinePointer();
  const seen = useInView(ref, { amount: 0.2, once: true });
  const n = projects.length;
  const at = useCallback((p) => Math.max(0, Math.min(n - 1, Math.floor(p * n))), [n]);

  // `layers`: the project on screen and the ones it is covering
  const [{ index, layers }, setShow] = useState(() => {
    const i = scroll ? at(scroll.get()) : 0;
    return { index: i, layers: [{ seq: 0, i }] };
  });
  const still = useMotionValue(0);
  const progress = useTransform(scroll || still, (p) => (scroll ? Math.max(0, Math.min(1, p * n - at(p))) : 1));

  const go = useCallback(
    (i) =>
      setShow((v) => (v.index === i ? v : { index: i, layers: [...v.layers.slice(-2), { seq: v.layers[v.layers.length - 1].seq + 1, i, up: i < v.index }] })),
    []
  );
  useMotionValueEvent(scroll || still, "change", (p) => scroll && go(at(p)));

  // The next picture is fetched while the current one is on show
  useEffect(() => {
    const next = projects[(index + 1) % n];
    if (!seen || !next?.image) return;
    const img = new Image();
    img.sizes = "(max-width: 1023px) 100vw, 64vw";
    img.srcset = cldSrcSet(next.image) || "";
    img.src = cldUrl(next.image, 1200);
  }, [index, n, projects, seen]);

  // On phones the names are a strip: keep the current one in it (without moving the page)
  useEffect(() => {
    const el = list.current;
    const item = el?.children[index];
    if (el && item && el.scrollWidth > el.clientWidth) {
      el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }, [index, reduce]);

  // The screen turns toward the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 90, damping: 18 };
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), spring);
  const onMove = (e) => {
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const active = projects[index];
  const status = projectStatus(active);
  const tags = Array.isArray(active.tags) ? active.tags.slice(0, 4) : [];
  const subtitle = active.type || active.subtitle;

  return (
    <div className="st-show" ref={ref}>
      <div className="st-show__wash" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.img
            key={active.id}
            src={cldUrl(active.image, 64)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        </AnimatePresence>
      </div>

      <div className="st-names">
        <ol className="st-names__list" ref={list}>
          {projects.map((p, i) => (
            <li key={p.id} className={i === index ? "is-active" : undefined}>
              <button type="button" aria-pressed={i === index} onClick={() => (scroll ? jump(i) : go(i))}>
                <span className="st-names__no" aria-hidden="true">{pad(i + 1)}</span>
                <span className="st-names__title">{p.title}</span>
              </button>
              <span className="st-names__line" aria-hidden="true">
                {i < index && <i />}
                {i === index && <motion.i style={{ scaleX: progress }} />}
              </span>
            </li>
          ))}
        </ol>
        {n > 1 && (
          <p className="st-names__count" aria-hidden="true">
            <b>{pad(index + 1)}</b> / {pad(n)}
          </p>
        )}
      </div>

      <div className="st-show__stage" onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>
        <motion.div className="st-screen" style={reduce ? undefined : { rotateX, rotateY }}>
          <button type="button" className="st-screen__frame" onClick={() => onOpen(active)} data-cursor="View" aria-label={`Open ${active.title}`}>
            {seen && layers.map((l) => projects[l.i] && <Layer key={l.seq} project={projects[l.i]} up={!l.up} />)}
          </button>
          <span className="st-screen__edge" aria-hidden="true" />
        </motion.div>

        <div className="st-detail">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className="st-detail__body"
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
              exit={{ opacity: 0, y: reduce ? 0 : -12, transition: { duration: 0.22 } }}
            >
              <p className="st-detail__meta">
                {active.category}
                {status !== "Live" && <em>{status}</em>}
              </p>
              <h3>{active.title}</h3>
              {subtitle && <p className="st-detail__type">{subtitle}</p>}
              {active.description && <p className="st-detail__desc">{active.description}</p>}
              {tags.length > 0 && (
                <ul className="st-detail__tags">
                  {tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
              <div className="st-detail__actions">
                <button type="button" className="btn-primary" onClick={() => onOpen(active)}>
                  <span>View Project</span>
                  <HiArrowRight />
                </button>
                {active.liveUrl && (
                  <a className="btn-secondary" href={active.liveUrl} target="_blank" rel="noreferrer">
                    Visit Site <HiOutlineArrowUpRight />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// The locked stage: a tall track with a one-screen sticky stage in it. The page only moves on once the
// scroll has gone through every project.
const Stage = ({ projects, shown, categories, filter, setFilter }) => {
  const { setSelectedProjectModal } = useCms();
  const track = useRef(null);
  const reduce = usePrefersReducedMotion();
  const tall = useMediaQuery("(min-height: 600px)");
  const n = shown.length;
  const locked = !reduce && tall && n > 1;
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  const scrollTo = (y, opts) => {
    if (getLenis()) scrollToTarget(y, opts);
    else window.scrollTo(0, y);
  };
  const top = () => track.current.getBoundingClientRect().top + window.scrollY;
  const jump = (i) => scrollTo(top() + ((i + 0.5) / n) * (track.current.offsetHeight - window.innerHeight), { duration: 1 });
  const pick = (c) => {
    if (c === filter) return;
    if (locked) scrollTo(top(), { immediate: true }); // a new list starts from its first project
    setFilter(c);
  };

  return (
    <div className={`st-work__track${locked ? " is-locked" : ""}`} ref={track} style={locked ? { "--track": `${100 + n * STEP}svh` } : undefined}>
      <div className="st-work__stage">
        <Header categories={categories} filter={filter} setFilter={pick} />
        {/* Re-keying on the filter restarts the show cleanly with the new set of projects */}
        {n > 0 && (
          <Showcase
            key={`${filter}-${locked}-${projects.length}`}
            projects={shown}
            onOpen={setSelectedProjectModal}
            scroll={locked ? scrollYProgress : null}
            jump={jump}
          />
        )}
      </div>
    </div>
  );
};

// Chapter 3 — proof. Real projects from the CMS: names on the left, a slanted screen on the right, and the
// scroll turns through them.
const WorkShowcase = () => {
  const { cmsReady } = useCms();
  const projects = useProjects();
  const [filter, setFilter] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const shown = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)).filter((p) => p.image).slice(0, MAX),
    [filter, projects]
  );

  if (!projects.length) return cmsReady ? null : <WorkSkeleton />;

  return (
    <section className="st-work" id="work" aria-label="Recent projects">
      <Stage projects={projects} shown={shown} categories={categories} filter={filter} setFilter={setFilter} />
    </section>
  );
};

export default WorkShowcase;
