import React, { useRef } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "../../animations/hooks";
import HeroDust from "../../components/hero/HeroDust";
import PageHero, { SlantButton } from "../../components/hero/PageHero";
import { useCurrency } from "../../context/CurrencyContext";
import PriceTags from "./PriceTags";
import { seoPage } from "../../data/seo";

// Keyword line and intro text are shared with the page's SEO copy (src/data/seo.js).
const SEO = seoPage("/pricing");

// The promise on the left, the price list hanging on strings on the right.
const PricingHero = ({ categories, pricesReady, onQuote, openContact, onJump }) => {
  const root = useRef(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(root, { amount: 0.1 });
  const { selectedCountry } = useCurrency();

  return (
    <div ref={root}>
      <PageHero
        variant="tags"
        label="Pricing and plans"
        kicker={SEO.kicker}
        lines={["Clear pricing,", "built around you."]}
        lead={SEO.lead}
        note={`All prices are in Indian Rupees (₹).${
          selectedCountry.countryCode !== "IN" ? ` Outside India? Ask us for a quote in ${selectedCountry.currencyCode}.` : ""
        }`}
        actions={
          <>
            <SlantButton onClick={() => onQuote()}>Request a custom quote</SlantButton>
            <SlantButton line onClick={openContact}>Discuss your project</SlantButton>
          </>
        }
      >
        <HeroDust running={inView && !reduce} />
        {(!pricesReady || categories.length > 0) && <PriceTags categories={categories} pricesReady={pricesReady} onJump={onJump} />}
      </PageHero>
    </div>
  );
};

export default PricingHero;
