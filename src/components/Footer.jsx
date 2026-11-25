import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCms } from "../context/CmsContext";
import { useLogos } from "../context/ThemeContext";
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { EASE, VIEWPORT } from "../animations/variants";
import "../styles/footer.scss";

// The essentials only: everything else is in the navbar's menus.
const links = [
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Pricing", path: "/pricing" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

const row = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: i * 0.08 } }),
};

const Footer = () => {
  const { companyInfo } = useCms();
  const logos = useLogos();
  const socials = [
    { label: "Instagram", Icon: FaInstagram, href: companyInfo?.socials?.instagram || "https://www.instagram.com/makeonward/" },
    { label: "LinkedIn", Icon: FaLinkedinIn, href: companyInfo?.socials?.linkedin || "https://www.linkedin.com/company/pixiedigitalcreatives" },
    { label: "X", Icon: FaXTwitter, href: companyInfo?.socials?.twitter || "https://x.com/pixiedigital" },
    { label: "Facebook", Icon: FaFacebookF, href: companyInfo?.socials?.facebook || "https://www.facebook.com/share/17iSpzyfRY/" },
  ];

  return (
    <footer className="footer-wrapper">
      <motion.div className="footer-container" initial="hidden" whileInView="show" viewport={VIEWPORT}>
        <motion.div className="footer-top" variants={row} custom={0}>
          <Link to="/" className="footer-logo-link" aria-label="MakeOnward — home">
            <img src={logos.lockup} alt="MakeOnward" className="footer-logo" />
          </Link>
          <nav className="footer-links" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.path} to={l.path}>{l.name}</Link>
            ))}
          </nav>
          <div className="footer-socials">
            {socials.map(({ label, Icon, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div className="footer-bottom" variants={row} custom={1}>
          <p>© {new Date().getFullYear()} MakeOnward. All rights reserved.</p>
          <p className="footer-contact">
            {companyInfo?.email && <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>}
            {companyInfo?.phone && <a href={`tel:${companyInfo.phone.replace(/[^+\d]/g, "")}`}>{companyInfo.phone}</a>}
          </p>
          <p className="footer-legal">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms &amp; Conditions</Link>
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
