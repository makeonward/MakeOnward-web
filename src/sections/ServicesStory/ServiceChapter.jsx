import React from "react";
import { useMediaQuery, useScenes } from "../../animations/hooks";
import MaskText from "../../components/motion/MaskText";
import Reveal from "../../components/motion/Reveal";
import Bands from "./Bands";
import Columns from "./Columns";
import Reel from "./Reel";
import ServiceCard from "./ServiceCard";
import { pad } from "./data";

const ChapterHead = ({ group, chapters }) => (
  <header className="sv-head">
    <p className="sv-head__meta">
      <b>{pad(group.index + 1)}</b> / {pad(chapters)}
    </p>
    <MaskText as="h2" className="sv-head__title" lines={[group.key]} />
    <Reveal className="sv-head__note" delay={0.15}>
      {group.blurb && <p>{group.blurb}</p>}
      <span>{group.items.length} {group.items.length === 1 ? "service" : "services"}</span>
    </Reveal>
  </header>
);

const Stack = ({ group, total, openContact }) => (
  <div className="sv-stack" style={{ "--c": group.items.length }}>
    {group.items.map(({ service, n }, j) => (
      <ServiceCard key={service.id || service.title} service={service} n={n} j={j} total={total} openContact={openContact} />
    ))}
  </div>
);

// Each category of services has its own layout, in turn:
// a pile of sheets -> bands that slide in from the sides -> a film reel that runs sideways -> columns that open
// one after another (rows, on phones). The last two hold the page while the scroll runs them; without room for
// that (short screens, reduced motion) the reel is swiped by hand and the columns are plain sheets.
const LAYOUTS = [Stack, Bands, Reel, Columns];

const ServiceChapter = ({ group, chapters, totalServices, openContact }) => {
  const locked = useScenes();
  const tall = useMediaQuery("(min-width: 1024px) and (min-height: 640px), (min-height: 700px)");
  let Layout = LAYOUTS[group.index % LAYOUTS.length];
  if (group.items.length < 2 && Layout !== Stack) Layout = Bands;
  if (Layout === Columns && !(locked && tall)) Layout = Stack;

  return (
    <section className="sv-chapter" id={`chapter-${group.slug}`} aria-label={`${group.key} services`}>
      <ChapterHead group={group} chapters={chapters} />
      <Layout group={group} total={totalServices} locked={locked} openContact={openContact} />
    </section>
  );
};

export default ServiceChapter;
