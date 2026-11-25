import React from "react";
import { Link } from "react-router-dom";
import { SlantButton } from "../../components/hero/PageHero";
import { pricingForService } from "../../data/pricing";
import { servicePathFor } from "../../data/servicePages";
import { useCms } from "../../context/CmsContext";

// What every layout says about a service: description, what is included, and where to go next.
const ServiceText = ({ service, openContact }) => {
  const { pricing: pricingDoc } = useCms();
  const pricing = pricingForService(pricingDoc.categories, service.visual);
  const path = servicePathFor(service.visual);
  const lists = [
    ["What's included", service.points],
    ["Approaches", service.approaches],
  ].filter(([, list]) => Array.isArray(list) && list.length > 0);

  return (
    <div className="sv-text">
      <p className="sv-text__desc">{service.description}</p>
      {lists.length > 0 && (
        <div className="sv-text__lists">
          {lists.map(([label, list]) => (
            <div key={label}>
              <h4>{label}</h4>
              <ul className="sv-points">
                {list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="sv-text__foot">
        <SlantButton onClick={openContact}>Discuss this service</SlantButton>
        <span className="sv-text__links">
          {path && <Link to={path}>Learn more</Link>}
          {pricing && <Link to={`/pricing#price-${pricing.slug}`}>See pricing</Link>}
        </span>
      </div>
    </div>
  );
};

export default ServiceText;
