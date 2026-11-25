import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactModal from "../components/ContactModal";
import ProjectDetailModal from "../components/ProjectDetailModal";
import { PostersSkeleton } from "../components/Skeleton";
import ScrollProgress from "../components/motion/ScrollProgress";
import CtaBand from "../sections/Story/CtaBand";
import PortfolioHero from "../sections/PortfolioStory/PortfolioHero";
import PortfolioControls from "../sections/PortfolioStory/PortfolioControls";
import ProjectPoster from "../sections/PortfolioStory/ProjectPoster";
import ProjectIndex from "../sections/PortfolioStory/ProjectIndex";
import { byOrder, searchable } from "../sections/PortfolioStory/data";
import { useCms } from "../context/CmsContext";
import { useScenes } from "../animations/hooks";
import "../sections/Story/story.scss";
import "../sections/PortfolioStory/portfoliostory.scss";
import "../styles/portfoliopage.scss";

// The portfolio reads as one story: the promise (a wall of the real work) -> the work itself, as
// case-study posters or a typographic index you can filter and search -> the invitation.
// Everything shown comes from the CMS; with no projects the page says so and the wall is hidden.
const PortfolioPage = () => {
  const { cmsReady, portfolioProjects, setSelectedProjectModal } = useCms();
  const scenes = useScenes();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("showcase");

  const projects = useMemo(() => byOrder(portfolioProjects), [portfolioProjects]);
  // Filters follow whatever categories the projects actually use
  const categories = useMemo(() => {
    const counts = new Map();
    projects.forEach((p) => p.category && counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts].map(([name, count]) => ({ name, count }));
  }, [projects]);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => projects.filter((p) => (filter === "All" || p.category === filter) && (!q || searchable(p).includes(q))),
    [projects, filter, q]
  );

  const mode = scenes ? "scroll" : "rise";
  const open = (project) => setSelectedProjectModal(project);
  const clear = () => {
    setFilter("All");
    setQuery("");
  };

  return (
    <div className="portfolio-page">
      <Navbar />
      <ScrollProgress />

      <main id="main">
        <PortfolioHero projects={projects} onOpen={open} />

        <section className="pf-work" id="work" aria-label="Projects">
          {projects.length > 0 && (
            <PortfolioControls
              categories={categories}
              filter={filter}
              setFilter={setFilter}
              query={query}
              setQuery={setQuery}
              view={view}
              setView={setView}
              total={projects.length}
              shown={shown.length}
            />
          )}

          <div className="pf-work__body">
            {projects.length === 0 && !cmsReady ? (
              <PostersSkeleton />
            ) : projects.length === 0 ? (
              <div className="pf-empty"><p>New work is being added. Check back soon.</p></div>
            ) : shown.length === 0 ? (
              <div className="pf-empty">
                <p>No projects match your current search or category filter.</p>
                <button type="button" className="btn-secondary" onClick={clear}>Clear filters</button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${view}|${filter}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  {view === "showcase" ? (
                    <ol className="pf-posters">
                      {shown.map((project, i) => (
                        <ProjectPoster key={project.id || project.title} project={project} i={i} n={shown.length} mode={mode} onOpen={open} />
                      ))}
                    </ol>
                  ) : (
                    <ProjectIndex projects={shown} onOpen={open} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>

        <CtaBand
          title={["Have a project", <><span className="grad-text">in mind?</span></>]}
          text="Let's work together on something that fits your business goals."
          button="Start a Project"
        />
      </main>

      <Footer />
      <ContactModal />
      <ProjectDetailModal />
    </div>
  );
};

export default PortfolioPage;
