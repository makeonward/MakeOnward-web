import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactModal from "../components/ContactModal";
import ProjectDetailModal from "../components/ProjectDetailModal";
import AboutLeadership from "../components/AboutLeadership";
import Hero from "../sections/Story/Hero";
import Journey from "../sections/Story/Journey";
import ServicesGrid from "../sections/Story/ServicesGrid";
import WorkShowcase from "../sections/Story/WorkShowcase";
import CtaBand from "../sections/Story/CtaBand";
import "../sections/Story/story.scss";

// The home page reads as one story:
// promise (hero) -> four chapters (Ideas, Design, Develop, Grow)
// -> what we do -> recent work -> the people -> the invitation.
const Home = () => (
  <div className="home-wrapper">
    <Navbar />
    <main id="main">
      <Hero />
      <Journey />
      <ServicesGrid />
      <WorkShowcase />
      <AboutLeadership />
      <CtaBand />
    </main>
    <Footer />
    <ContactModal />
    <ProjectDetailModal />
  </div>
);

export default Home;
