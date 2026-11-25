import React, { useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactModal from "../components/ContactModal";
import ProjectDetailModal from "../components/ProjectDetailModal";
import Marquee from "../components/motion/Marquee";
import ScrollProgress from "../components/motion/ScrollProgress";
import CtaBand from "../sections/Story/CtaBand";
import ServicesHero from "../sections/ServicesStory/ServicesHero";
import ServiceChapter from "../sections/ServicesStory/ServiceChapter";
import { groupServices } from "../sections/ServicesStory/data";
import { useCms } from "../context/CmsContext";
import "../sections/Story/story.scss";
import "../sections/ServicesStory/servicesstory.scss";
import "../styles/servicespage.scss";

// The services page reads as one scroll story, like the home page:
// the promise (hero + a spiral of every service) -> one chapter per category (Build, Social, Content,
// Growth), each laid out its own way -> the invitation.
// It renders whatever services the CMS holds, so it always matches the home page.
const ServicesPage = () => {
  const { services, setIsContactModalOpen } = useCms();
  const groups = useMemo(() => groupServices(services), [services]);
  // the hero counts the services as the chapters below do
  const ordered = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.service)), [groups]);
  const openContact = () => setIsContactModalOpen(true);

  return (
    <div className="services-page">
      <Navbar />
      <ScrollProgress />

      <main id="main">
        <ServicesHero services={ordered} openContact={openContact} />

        {services.length > 0 && (
          <>
            <div id="chapters" className="sv-chapters">
              {groups.map((group) => (
                <ServiceChapter
                  key={group.slug}
                  group={group}
                  chapters={groups.length}
                  totalServices={services.length}
                  openContact={openContact}
                />
              ))}
            </div>

            <Marquee items={["Design", "Develop", "Content", "Social", "Growth"]} speed={38} reverse />
          </>
        )}

        <CtaBand />
      </main>

      <Footer />
      <ContactModal />
      <ProjectDetailModal />
    </div>
  );
};

export default ServicesPage;
