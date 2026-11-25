import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { useCms } from "../context/CmsContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLogos } from "../context/ThemeContext";
import { HiArrowRight, HiOutlineArrowUpRight, HiOutlineChevronDown, HiOutlineEnvelope } from "react-icons/hi2";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import Magnetic from "./buttons/Magnetic";
import ThemeToggle from "./ThemeToggle";
import { lockScroll, unlockScroll } from "../animations/lenis";
import { EASE, EASE_IN_OUT } from "../animations/variants";
import "../styles/navbar.scss";

// Related pages share one entry with a dropdown; the first child is the group's main page.
const navLinks = [
  { name: "Home", path: "/" },
  {
    name: "Services",
    children: [
      { name: "All services", path: "/services", note: "Everything we do" },
      { name: "Pricing", path: "/pricing", note: "Plans and price ranges" },
      { name: "Process", path: "/process", note: "How a project runs" },
      { name: "Industries", path: "/industries", note: "Who we build for" },
    ],
  },
  { name: "Portfolio", path: "/portfolio" },
  {
    name: "About",
    children: [
      { name: "About us", path: "/about", note: "Our story and team" },
      { name: "Company Profile", path: "/company-profile", note: "Who we are, page by page" },
      { name: "Brochure", path: "/brochure", note: "Our brochure, page by page" },
      { name: "Blog", path: "/blog", note: "Guides on websites, SEO and AI search" },
    ],
  },
  { name: "Contact", path: "/contact" },
];

const keyOf = (link) => link.path || link.name;
const isActive = (link, pathname) =>
  link.children ? link.children.some((c) => c.path === pathname) : link.path === pathname;

const homeSections = [
  { id: "hero", label: "Intro" },
  { id: "journey", label: "Our story" },
  { id: "services", label: "Services" },
  { id: "work", label: "Recent work" },
  { id: "about", label: "Team" },
  { id: "start", label: "Start a project" },
];

// Which home section is currently in view (single IntersectionObserver, no scroll listeners).
const useActiveSection = (enabled) => {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = null;
        let ratio = 0;
        seen.forEach((r, id) => {
          if (r > ratio) {
            ratio = r;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    homeSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [enabled]);
  return active;
};

const PILL_SPRING = { type: "spring", stiffness: 420, damping: 36 };

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [band, setBand] = useState(null); // the group open in the phone menu
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [hoverPath, setHoverPath] = useState(null);
  const [menu, setMenu] = useState(null); // name of the open dropdown group
  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  const { setIsContactModalOpen, companyInfo } = useCms();
  const logos = useLogos();
  const { selectedCountry, countries, setSelectedCountry } = useCurrency();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const activeSection = useActiveSection(isHome);
  const activeLabel = homeSections.find((s) => s.id === activeSection)?.label;

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  // State only flips at thresholds, so React does not re-render per scroll tick.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (y < 120) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      unlockScroll();
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setCountryDropdownOpen(false);
        setMenu(null);
      }
    };
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setCountryDropdownOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const email = companyInfo?.email || "info@makeonward.com";

  return (
    <>
      <motion.header
        className={`navbar-wrapper ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""}`}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="logo-link" aria-label="MakeOnward — home">
              <span className="logo-stack">
                <img src={logos.lockup} alt="MakeOnward" className="logo-img logo-img--primary" />
                <img src={logos.mark} alt="" aria-hidden="true" className="logo-img logo-img--secondary" />
              </span>
            </Link>
          </div>

          <nav className="navbar-center" aria-label="Primary" ref={navRef}>
            {/* The pill follows the hovered link and settles back on the current page. */}
            <ul className="nav-list" onMouseLeave={() => setHoverPath(null)}>
              {navLinks.map((link) => {
                const key = keyOf(link);
                const active = isActive(link, location.pathname);
                const current = navLinks.find((l) => isActive(l, location.pathname));
                const pillHere = (hoverPath ?? (current && keyOf(current))) === key;
                const pill = pillHere && <motion.span layoutId="nav-pill" className="nav-pill" transition={PILL_SPRING} />;

                if (!link.children) {
                  return (
                    <li key={key} className="nav-item">
                      <Link
                        to={link.path}
                        className={`nav-link ${active ? "active" : ""} ${pillHere ? "has-pill" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHoverPath(key)}
                        onFocus={() => setHoverPath(key)}
                      >
                        {pill}
                        <span className="nav-link__text">{link.name}</span>
                      </Link>
                    </li>
                  );
                }

                // A group opens on hover (mouse) or on click / tap, and closes when the pointer or focus leaves.
                const isOpen = menu === link.name;
                const menuId = `nav-menu-${link.name.toLowerCase()}`;
                return (
                  <li
                    key={key}
                    className="nav-item nav-item--menu"
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      setHoverPath(key);
                      setMenu(link.name);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType === "mouse") setMenu(null);
                    }}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) setMenu(null);
                    }}
                  >
                    <button
                      type="button"
                      className={`nav-link ${active ? "active" : ""} ${pillHere ? "has-pill" : ""}`}
                      aria-expanded={isOpen}
                      aria-controls={menuId}
                      onClick={() => setMenu(isOpen ? null : link.name)}
                      onFocus={() => setHoverPath(key)}
                    >
                      {pill}
                      <span className="nav-link__text">{link.name}</span>
                      <HiOutlineChevronDown className={`nav-link__chev ${isOpen ? "open" : ""}`} aria-hidden="true" />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          id={menuId}
                          className="nav-menu"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.22, ease: EASE }}
                        >
                          <ul className="nav-menu__list">
                            {link.children.map((c, i) => {
                              const here = location.pathname === c.path;
                              return (
                                <li key={c.path}>
                                  <Link
                                    to={c.path}
                                    className={`nav-menu__item ${here ? "active" : ""}`}
                                    aria-current={here ? "page" : undefined}
                                    onClick={() => setMenu(null)}
                                  >
                                    <span className="nav-menu__no" aria-hidden="true">0{i + 1}</span>
                                    <span className="nav-menu__name">{c.name}</span>
                                    <span className="nav-menu__note">{c.note}</span>
                                    <HiArrowRight aria-hidden="true" />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="navbar-right">
            <div className="currency-selector-wrap" ref={dropdownRef}>
              <button
                className="currency-toggle-btn"
                onClick={() => setCountryDropdownOpen((v) => !v)}
                aria-label="Select country"
                aria-expanded={countryDropdownOpen}
              >
                <span className="country-code-pill">{selectedCountry.countryCode}</span>
                <span className="currency-code-text">{selectedCountry.currencyCode}</span>
                <HiOutlineChevronDown className={`chevron-icon ${countryDropdownOpen ? "open" : ""}`} />
              </button>

              <AnimatePresence>
                {countryDropdownOpen && (
                  <motion.div
                    className="currency-dropdown-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <div className="dropdown-header-lbl">Select your country</div>
                    {countries.map((c) => (
                      <button
                        key={c.countryCode}
                        className={`currency-option-item ${selectedCountry.countryCode === c.countryCode ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryDropdownOpen(false);
                        }}
                      >
                        <span className="country-code-badge">{c.countryCode}</span>
                        <span className="name">{c.countryName}</span>
                        <span className="symbol">{c.currencyCode} ({c.symbol})</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle className="navbar-theme" />

            <Magnetic strength={0.2}>
              <button onClick={() => setIsContactModalOpen(true)} className="navbar-cta-btn">
                <span>Let&apos;s Talk</span>
                <HiArrowRight className="arrow-icon" />
              </button>
            </Magnetic>

            <button
              className={`hamburger-btn ${open ? "is-open" : ""}`}
              onClick={() => {
                setBand(navLinks.find((l) => l.children && isActive(l, location.pathname))?.name ?? null);
                setOpen((v) => !v);
              }}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
            >
              <span className="line" />
              <span className="line" />
            </button>
          </div>
        </div>

        <motion.span className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </motion.header>

      {/* PHONES: the menu fills the screen with one band per entry; a group opens its pages inside its band */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            data-lenis-prevent
            initial={{ clipPath: "polygon(125% 0%, 125% 0%, 125% 100%, 100% 100%)" }}
            animate={{ clipPath: "polygon(0% 0%, 125% 0%, 125% 100%, -25% 100%)" }}
            exit={{ clipPath: "polygon(125% 0%, 125% 0%, 125% 100%, 100% 100%)" }}
            transition={{ duration: 0.65, ease: EASE_IN_OUT }}
          >
            <nav className="mobile-menu__bands" aria-label="Mobile">
              {navLinks.map((link, idx) => {
                const active = isActive(link, location.pathname);
                const isOpen = band === link.name;
                const face = (
                  <>
                    <span className="mobile-menu__name">{link.name}</span>
                    {link.children ? <i className="mobile-menu__plus" aria-hidden="true" /> : <HiArrowRight aria-hidden="true" />}
                  </>
                );
                return (
                  <motion.div
                    key={keyOf(link)}
                    className={`mobile-menu__band ${active ? "is-here" : ""} ${isOpen ? "is-open" : ""}`}
                    initial={{ x: "60%", opacity: 0 }}
                    animate={{ x: "0%", opacity: 1 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.22 + idx * 0.07 }}
                  >
                    {link.children ? (
                      <button type="button" className="mobile-menu__row" aria-expanded={isOpen} onClick={() => setBand(isOpen ? null : link.name)}>
                        {face}
                      </button>
                    ) : (
                      <Link to={link.path} className="mobile-menu__row" aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                        {face}
                      </Link>
                    )}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          className="mobile-menu__pages"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                        >
                          {link.children.map((c) => {
                            const here = location.pathname === c.path;
                            return (
                              <li key={c.path}>
                                <Link to={c.path} className={here ? "is-here" : undefined} aria-current={here ? "page" : undefined} onClick={() => setOpen(false)}>
                                  {c.name}
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              className="mobile-menu__foot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            >
              <button
                type="button"
                className="mobile-menu__cta"
                onClick={() => {
                  setOpen(false);
                  setIsContactModalOpen(true);
                }}
              >
                <span>Let&apos;s talk</span>
                <HiOutlineArrowUpRight aria-hidden="true" />
              </button>

              <div className="mobile-menu__tools">
                <label className="mobile-menu__country">
                  <span>{selectedCountry.countryCode} · {selectedCountry.currencyCode}</span>
                  <HiOutlineChevronDown aria-hidden="true" />
                  <select
                    aria-label="Select your country"
                    value={selectedCountry.countryCode}
                    onChange={(e) => setSelectedCountry(countries.find((c) => c.countryCode === e.target.value))}
                  >
                    {countries.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>{c.countryName} ({c.currencyCode})</option>
                    ))}
                  </select>
                </label>
                <ThemeToggle />
                <div className="mobile-menu__socials">
                  <a href={`mailto:${email}`} aria-label={`Email ${email}`}><HiOutlineEnvelope /></a>
                  <a href={companyInfo?.socials?.instagram || "https://www.instagram.com/makeonward/"} target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                  <a href={companyInfo?.socials?.linkedin || "https://www.linkedin.com/company/pixiedigitalcreatives"} target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
                  <a href={companyInfo?.socials?.twitter || "https://x.com/pixiedigital"} target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
