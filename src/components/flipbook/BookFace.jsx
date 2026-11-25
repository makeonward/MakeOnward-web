import React from "react";
import { useCms } from "../../context/CmsContext";
import { SERVICE_ICONS } from "../../sections/Story/icons";
import { cldUrl } from "../../sections/Story/cloudinary";
import { PHASES, pad } from "../../sections/ProcessStory/data";
import { serviceMockup } from "../../data/mockups";
import "../../styles/bookpages.scss";

// What is printed on one side of a sheet. Sizes inside a page use container units (cqw), so a page reads the
// same at any book size. The print is black or white, with orange only as ink, in both themes.
// Page types are described in src/data/books.js.

const siteUrl = (website) => `https://${website.replace(/^https?:\/\//, "")}`;

// The two strokes of the mark, as a picture that can bleed off a page
const Strokes = ({ className = "" }) => (
  <svg className={`bp-strokes ${className}`} viewBox="0 0 1200 692" aria-hidden="true" focusable="false">
    <path d="M386 216 Q408 190 436 190 H640 Q664 192 663 214 L649 264 Q645 292 632 308 L318 654 Q300 679 274 679 H20 Q5 678 5 662 Q6 654 14 645 Z" />
    <path d="M906 28 Q922 7 942 7 H1164 Q1187 9 1185 32 L1050 556 Q1044 598 1010 607 L762 686 Q744 690 744 674 L845 322 Q846 315 838 315 H694 Q682 312 682 301 Q684 294 692 285 Z" />
  </svg>
);

// An inside page: running head, content, running foot
const Page = ({ tone = "white", kicker, number, className = "", children }) => (
  <div className={`bp bp--${tone} ${className}`}>
    <header className="bp__head">
      <span>{kicker || "MakeOnward"}</span>
      <Strokes />
    </header>
    {children}
    <footer className="bp__foot">
      <span>makeonward.com</span>
      <b>{pad(number)}</b>
    </footer>
  </div>
);
// "02 — CORE SERVICES" -> "Core services"
const plain = (kicker = "") => {
  const t = kicker.replace(/^\d+\s*—\s*/, "").toLowerCase().replace("makeonward", "MakeOnward");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const Title = ({ children, small = false }) => <h2 className={`bp__title${small ? " bp__title--small" : ""}`}>{children}</h2>;

// ---- Covers ------------------------------------------------------------------------------------
const Cover = ({ book, page }) => {
  const { companyInfo } = useCms();
  const white = book.slug === "brochure";
  const words = (page.title || book.title).split(" ");
  return (
    <div className={`bp bp-cover bp--${white ? "white" : "onyx"}`}>
      <Strokes className="bp-cover__strokes" />
      <div className="bp-cover__top">
        <img src={`/brand/lockup-${white ? "light" : "dark"}.webp`} alt="MakeOnward" draggable={false} />
        <span>{page.year || new Date().getFullYear()}</span>
      </div>
      <div className="bp-cover__foot">
        <h2>{words.map((w) => <span key={w}>{w}</span>)}</h2>
        <p>{page.tagline || companyInfo?.tagline}</p>
      </div>
    </div>
  );
};

const BackCover = ({ book, page }) => {
  const { companyInfo } = useCms();
  const website = page.website || companyInfo?.website || "makeonward.com";
  const white = book.slug === "brochure";
  return (
    <div className={`bp bp-cover bp-cover--back bp--${white ? "white" : "onyx"}`}>
      <Strokes className="bp-cover__strokes" />
      <p className="bp-cover__line">{page.title || page.tagline || companyInfo?.tagline}</p>
      <div className="bp-cover__end">
        <img src={`/brand/lockup-${white ? "light" : "dark"}.webp`} alt="MakeOnward" draggable={false} />
        <a href={siteUrl(website)} target="_blank" rel="noreferrer">{website}</a>
      </div>
    </div>
  );
};

// A page that says one thing
const StatementPage = ({ page, number }) => (
  <Page tone={page.tone || "onyx"} kicker={page.kicker} number={number} className="bp-statement">
    <Strokes className="bp-statement__strokes" />
    <div className="bp-statement__body">
      <h2>{page.title}</h2>
      {page.text && <p>{page.text}</p>}
    </div>
  </Page>
);

// ---- Company profile -----------------------------------------------------------------------------
const ApproachPage = ({ page, number }) => (
  <Page kicker="Our approach" number={number}>
    <Title>{page.title}</Title>
    <ol className="bp-steps">
      {page.approach.map((a, i) => (
        <li key={a.title}>
          <b>{pad(i + 1)}</b>
          <div>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </div>
        </li>
      ))}
    </ol>
  </Page>
);

const ClientsPage = ({ page, number }) => (
  <Page tone="onyx" kicker="Who we work with" number={number}>
    <ul className="bp-big">
      {page.whoWeWorkWith.map((c) => <li key={c}>{c}</li>)}
    </ul>
  </Page>
);

const ValuesPage = ({ page, number }) => (
  <Page kicker="What we stand for" number={number}>
    <blockquote className="bp-quote">{page.brandPromise}</blockquote>
    <ul className="bp-rows">
      {page.coreValues.map((v) => (
        <li key={v.label}>
          <h3>{v.label}</h3>
          <p>{v.text}</p>
        </li>
      ))}
    </ul>
  </Page>
);

const CapabilitiesPage = ({ page, number }) => (
  <Page kicker={plain(page.kicker)} number={number}>
    {page.title && <Title>{page.title}</Title>}
    <ul className="bp-caps">
      {page.services.map((s) => (
        <li key={s.title}>
          <img src={serviceMockup(s.visual).src} alt="" draggable={false} decoding="async" />
          <div>
            <h3>{s.title}</h3>
            <p>{s.offer}</p>
          </div>
        </li>
      ))}
    </ul>
  </Page>
);

const PricingPage = ({ page, number }) => (
  <Page kicker={plain(page.kicker)} number={number}>
    <Title small>{page.title}</Title>
    <div className="bp-prices">
      {page.groups.map((g) => (
        <section key={g.category}>
          <h3>{g.category}</h3>
          <ul>
            {g.rows.map((r) => (
              <li key={r.name}>
                <b>{r.name}</b>
                <em>{r.price}</em>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
    {page.note && <p className="bp__note">{page.note}</p>}
  </Page>
);

const EngagementPage = ({ page, number }) => (
  <Page tone="onyx" kicker={plain(page.kicker)} number={number}>
    <Title>{page.title}</Title>
    <ol className="bp-steps bp-steps--tight">
      {page.steps.map((s) => (
        <li key={s.number}>
          <b>{s.number}</b>
          <div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  </Page>
);

const TeamPage = ({ number }) => {
  const { teamMembers } = useCms();
  const team = [...teamMembers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter((m) => m.image).slice(0, 4);
  return (
    <Page kicker="The people" number={number}>
      <Title>The people behind every project.</Title>
      <ul className={`bp-team bp-team--${team.length}`}>
        {team.map((m) => (
          <li key={m.id || m.name}>
            <img src={cldUrl(m.image, 600)} alt={m.name} draggable={false} decoding="async" />
            <h3>{m.name}</h3>
            <p>{m.role}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
};

const ContactPage = ({ page, number }) => {
  const { companyInfo } = useCms();
  const website = page.website || companyInfo?.website || "makeonward.com";
  const email = page.email || companyInfo?.email || "info@makeonward.com";
  const phone = page.phone || companyInfo?.phone || "+91 96086 84177";
  return (
    <Page tone="onyx" kicker={plain(page.kicker)} number={number} className="bp--contact">
      <Title>{page.title}</Title>
      <Strokes className="bp-contact__strokes" />
      <ul className="bp-contact">
        <li><span>Website</span><a href={siteUrl(website)} target="_blank" rel="noreferrer">{website}</a></li>
        <li><span>Email</span><a href={`mailto:${email}`}>{email}</a></li>
        <li><span>Call</span><a href={`tel:${phone.split(",")[0].trim()}`}>{phone}</a></li>
      </ul>
    </Page>
  );
};

// ---- Both books ------------------------------------------------------------------------------------
// The studio's projects, from the CMS
const WorkPage = ({ page, number }) => {
  const { portfolioProjects } = useCms();
  const list = [...portfolioProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter((p) => p.image).slice(0, 7);
  return (
    <Page tone={page.tone || "onyx"} kicker="Selected work" number={number}>
      <Title small>Work that speaks for itself.</Title>
      <ul className="bp-work">
        {list.map((p) => (
          <li key={p.id || p.title}>
            <img src={cldUrl(p.image, 700)} alt="" draggable={false} decoding="async" />
            <h3>{p.title}</h3>
          </li>
        ))}
      </ul>
    </Page>
  );
};

// The services of one or more categories, with the Services page's own words (CMS)
const ServicesPage = ({ page, number }) => {
  const { services } = useCms();
  const groups = page.categories
    .map((cat) => ({ cat, items: services.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);
  const picture = groups[0]?.items[0] && serviceMockup(groups[0].items[0].visual).src;
  return (
    <Page kicker={page.kicker} number={number}>
      {picture && <img className="bp-svc__shot" src={picture} alt="" draggable={false} decoding="async" />}
      <Title>{page.title}</Title>
      <ul className="bp-svc">
        {groups.flatMap((g) => g.items).map((s) => {
          const Icon = SERVICE_ICONS[s.visual] || SERVICE_ICONS.web;
          return (
            <li key={s.id || s.title}>
              <Icon aria-hidden="true" />
              <h3>{s.title}</h3>
            </li>
          );
        })}
      </ul>
    </Page>
  );
};

const ProcessPage = ({ page, number }) => (
  <Page tone="onyx" kicker={page.kicker} number={number}>
    <Title>{page.title}</Title>
    <ol className="bp-steps bp-steps--tight bp-steps--seven">
      {PHASES.map((ph, i) => (
        <li key={ph.short}>
          <b>{pad(i + 1)}</b>
          <h3>{ph.name}</h3>
        </li>
      ))}
    </ol>
  </Page>
);

// Price list of the brochure
const CardsPage = ({ page, number }) => (
  <Page kicker="Pricing" number={number}>
    <Title small>{page.title}</Title>
    <ul className="bp-list">
      {page.cards.map((c) => (
        <li key={c.label}>
          <b>{c.label}</b>
          <em>{c.price}</em>
        </li>
      ))}
    </ul>
    {page.note && <p className="bp__note">{page.note}</p>}
  </Page>
);

const Placeholder = ({ number }) => (
  <Page kicker="" number={number}><Title>Content coming soon</Title></Page>
);

const TYPES = {
  cover: Cover,
  back: BackCover,
  statement: StatementPage,
  approach: ApproachPage,
  clients: ClientsPage,
  values: ValuesPage,
  "profile-services": CapabilitiesPage,
  "profile-pricing": PricingPage,
  "profile-process": EngagementPage,
  "profile-contact": ContactPage,
  team: TeamPage,
  work: WorkPage,
  services: ServicesPage,
  process: ProcessPage,
  cards: CardsPage,
  placeholder: Placeholder,
};

const BookFace = ({ page, number, book }) => {
  if (!page) return <div className="fb-sheet fb-sheet--reverse" />;
  const Type = TYPES[page.type];
  return (
    <div className="fb-sheet">
      {page.type === "image" && <img className="fb-img" src={page.src} alt={page.alt || `Page ${number}`} draggable={false} decoding="async" />}
      {Type && <Type book={book} page={page} number={number} />}
    </div>
  );
};

export default BookFace;
