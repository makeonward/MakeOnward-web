import React, { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCms } from "../../context/CmsContext";
import { useReady } from "../../animations/ReadyContext";
import { usePrefersReducedMotion } from "../../animations/hooks";
import { scrollToTarget } from "../../animations/lenis";
import HeroDust from "../../components/hero/HeroDust";
import { SlantButton, useEnter } from "../../components/hero/PageHero";
import { Sk } from "../../components/Skeleton";
import MorphFrames from "./MorphFrames";
import { cldUrl } from "../Story/cloudinary";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/about");
const AREAS = ["a", "b", "c"];
const toTeam = () => scrollToTarget("#about", { offset: 0 });

// The people behind the studio in frames that keep changing shape, with the mark in the smallest one. Never
// stock photos: with no team in the CMS only the mark is shown.
const AboutHero = ({ openContact }) => {
  const root = useRef(null);
  const ready = useReady();
  const reduce = usePrefersReducedMotion();
  const inView = useInView(root, { amount: 0.1 });
  const enter = useEnter();
  const { cmsReady, teamMembers } = useCms();
  const team = useMemo(
    () => [...teamMembers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter((m) => m.image).slice(0, AREAS.length),
    [teamMembers]
  );
  const frames = useMemo(() => {
    const people = team.map((m, i) => ({
      key: m.id || m.name,
      area: AREAS[i],
      label: { name: m.name, role: m.role },
      onClick: toTeam,
      node: <img src={cldUrl(m.image, 1100)} alt="" decoding="async" draggable="false" />,
    }));
    const waiting = !team.length && !cmsReady ? AREAS.map((area) => ({ key: area, area, node: <Sk className="sk--fill" /> })) : [];
    return [
      ...people,
      ...waiting,
      { key: "mark", area: "d", node: <span className="morph__mark"><img src="/brand/mark-400.png" alt="" draggable="false" /></span> },
    ];
  }, [team, cmsReady]);

  return (
    <section className="morph" id="top" ref={root} aria-label="About MakeOnward">
      <HeroDust running={inView && !reduce} />
      <MorphFrames frames={frames} running={ready && inView} />
      <div className="morph__copy">
        <motion.h1 className="morph__title" {...enter(0.1)}>
          <span className="h1-kicker">{SEO.kicker}</span>
          A small studio that
          <span className="morph__soft">makes things on purpose.</span>
        </motion.h1>
        <motion.p className="morph__lead" {...enter(0.25)}>{SEO.lead}</motion.p>
        <motion.div className="ph__actions" {...enter(0.4)}>
          <SlantButton onClick={openContact}>Let&apos;s talk</SlantButton>
          {(team.length > 0 || !cmsReady) && <SlantButton line onClick={toTeam}>Meet the team</SlantButton>}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
