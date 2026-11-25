import React, { useEffect } from "react";
import "../styles/skeleton.scss";

// A grey shape with a light passing over it, standing in for something still on its way. Sizes are CSS values.
export const Sk = ({ w, h, r, className = "" }) => (
  <i className={`sk ${className}`} style={{ width: w, height: h, borderRadius: r }} aria-hidden="true" />
);

const Lines = ({ widths, h = "0.9rem" }) => widths.map((w, i) => <Sk key={i} w={w} h={h} />);
const Loading = ({ what }) => <span className="sk-sr" role="status">Loading {what}</span>;

// A page whose code is still loading: the navbar and the shape of a hero
export const PageSkeleton = () => (
  <div className="sk-page">
    <Loading what="the page" />
    <div className="sk-page__nav"><Sk w="150px" h="28px" /><Sk w="42px" h="42px" r="50%" /></div>
    <div className="sk-page__hero">
      <div className="sk-stack">
        <Sk w="120px" h="0.8rem" />
        <Sk w="92%" h="clamp(2.2rem, 5vw, 4.6rem)" />
        <Sk w="64%" h="clamp(2.2rem, 5vw, 4.6rem)" />
        <Lines widths={["70%", "56%"]} />
        <div className="sk-row"><Sk className="sk--slant" w="150px" h="50px" /><Sk className="sk--slant" w="130px" h="50px" /></div>
      </div>
      <Sk className="sk-page__art" r="28px" />
    </div>
  </div>
);

// Home: "Our Recent Projects", in the real section's own layout
export const WorkSkeleton = () => (
  <section className="st-work" id="work" aria-label="Recent projects">
    <Loading what="projects" />
    <div className="st-work__stage">
      <div className="st-work__intro"><div className="sk-stack"><Sk w="110px" h="0.8rem" /><Sk w="min(420px, 70vw)" h="2.6rem" /></div></div>
      <div className="st-show">
        <div className="st-names"><div className="sk-stack sk-stack--wide"><Lines widths={["62%", "78%", "54%", "70%", "60%", "74%"]} h="1.9rem" /></div></div>
        <div className="st-show__stage"><div className="st-screen"><span className="st-screen__frame"><Sk className="sk--fill" /></span></div></div>
      </div>
    </div>
  </section>
);

// Portfolio hero: the drawer, filed with blank cards
export const DrawerSkeleton = () => (
  <>
    <div className="drawer sk-drawer" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="drawer__slot" style={{ left: `calc(var(--from) + (var(--to) - var(--from)) * ${i / 11})`, zIndex: 12 - i }}>
          <span className="drawer__card"><span className="drawer__face"><Sk className="sk--fill" /></span></span>
        </div>
      ))}
    </div>
    <div className="drawer__fade" aria-hidden="true" />
    <div className="drawer__bar"><Sk w="180px" h="1.4rem" /></div>
  </>
);

// Portfolio list: projects
export const PostersSkeleton = () => (
  <div className="sk-stack sk-stack--posters">
    <Loading what="projects" />
    <Sk w="min(620px, 70%)" h="clamp(3rem, 8vw, 7rem)" />
    <Sk className="sk-poster" r="20px" />
  </div>
);

// About: the leadership section
export const TeamSkeleton = () => (
  <section className="sk-team" id="about" aria-label="Founders and core leadership">
    <Loading what="the team" />
    <div className="sk-stack">
      <Sk w="180px" h="0.8rem" />
      <Lines widths={["80%", "50%"]} h="3rem" />
      <Lines widths={["90%", "84%", "60%"]} />
    </div>
    <Sk className="sk-team__photo" r="24px" />
  </section>
);

// A case study
export const CaseSkeleton = () => (
  <div className="sk-page__hero sk-page__hero--case">
    <Loading what="the case study" />
    <div className="sk-stack">
      <Sk w="160px" h="0.8rem" />
      <Sk w="80%" h="clamp(2.2rem, 5vw, 4.6rem)" />
      <Lines widths={["60%", "44%"]} />
    </div>
    <Sk className="sk-page__art" r="28px" />
  </div>
);

/**
 * Every picture on the site that fills a frame (object-fit: cover) shimmers until it arrives. One observer
 * for the whole document, so pages need nothing of their own.
 */
export const ImageSkeletons = () => {
  useEffect(() => {
    const clear = (e) => e.target instanceof HTMLImageElement && e.target.removeAttribute("data-sk");
    const mark = (img) => {
      if (img.complete) return;
      if (getComputedStyle(img).objectFit === "cover") img.setAttribute("data-sk", "");
    };
    const scan = (node) => {
      if (node.nodeType !== 1) return;
      if (node.tagName === "IMG") mark(node);
      else node.querySelectorAll("img").forEach(mark);
    };
    scan(document.body);
    const mo = new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach(scan)));
    mo.observe(document.body, { childList: true, subtree: true });
    // load and error do not bubble, so listen on the way down
    document.addEventListener("load", clear, true);
    document.addEventListener("error", clear, true);
    return () => {
      mo.disconnect();
      document.removeEventListener("load", clear, true);
      document.removeEventListener("error", clear, true);
    };
  }, []);
  return null;
};
