import React, { useCallback, useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useAnimationControls, useReducedMotion } from "framer-motion";
import { CmsProvider } from "./context/CmsContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import PageTurn from "./components/PageTurn";
import Preloader from "./components/Preloader";
import { ImageSkeletons, PageSkeleton } from "./components/Skeleton";
import Home from "./pages/Home";
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProcessPage = lazy(() => import("./pages/ProcessPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookViewPage = lazy(() => import("./pages/BookViewPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const IndustryPage = lazy(() => import("./pages/IndustryPage"));
const IndustriesPage = lazy(() => import("./pages/IndustryPage").then((m) => ({ default: m.IndustriesPage })));
const BlogIndexPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPostPage })));
const CaseStudyPage = lazy(() => import("./pages/CaseStudyPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
import Cursor from "./components/cursor/Cursor";
import SmoothScroll from "./components/motion/SmoothScroll";
import RouteSeo from "./components/RouteSeo";
import { ReadyContext } from "./animations/ReadyContext";
import { scrollToTop } from "./animations/lenis";

// Routes + the transition between them (PageTurn): blades sweep over the old page, the route swaps
// underneath, and they sweep on.
// Resolve when the animation ends OR after `ms` — a hidden tab pauses animation frames and must never block navigation.
const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

// "/company-profile" -> "Company Profile"
const pageName = (path) => {
  const last = path.split("/").filter(Boolean).pop();
  if (!last) return "Home";
  return last.split("-").map((w) => (/^(seo|geo|aeo|crm|faq)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const curtain = useAnimationControls();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      setDisplayLocation(location);
      curtain.set("idle");
      return undefined;
    }
    if (reduce) {
      setDisplayLocation(location);
      scrollToTop(true);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      await withTimeout(curtain.start("cover"), 1200);
      if (cancelled) return;
      setDisplayLocation(location);
      scrollToTop(true);
      await withTimeout(curtain.start("reveal"), 1500);
      if (!cancelled) curtain.set("idle");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <RouteSeo pathname={displayLocation.pathname} />
      <Suspense fallback={<PageSkeleton />}>
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/industries/:slug" element={<IndustryPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/brochure" element={<BookViewPage key="brochure" bookId="brochure" />} />
        <Route path="/company-profile" element={<BookViewPage key="company-profile" bookId="companyProfile" />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      <PageTurn controls={curtain} name={pageName(location.pathname)} />
    </>
  );
};

function App() {
  const [loading, setLoading] = useState(true); // the preloader is on screen
  const [ready, setReady] = useState(false); // the page behind it may start
  const reveal = useCallback(() => setReady(true), []);
  const finish = useCallback(() => setLoading(false), []);

  return (
    <ThemeProvider>
    <CmsProvider>
      <CurrencyProvider>
        <ReadyContext.Provider value={ready}>
          <a className="skip-link" href="#main">Skip to content</a>
          <SmoothScroll />
          <Cursor />
          <ImageSkeletons />
          <Router>
            <AnimatedRoutes />
          </Router>
          {loading && <Preloader onReveal={reveal} onFinish={finish} />}
        </ReadyContext.Provider>
      </CurrencyProvider>
    </CmsProvider>
    </ThemeProvider>
  );
}

export default App;
