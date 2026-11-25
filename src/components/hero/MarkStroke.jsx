import React from "react";
import { motion } from "framer-motion";
import { useReady } from "../../animations/ReadyContext";
import { EASE } from "../../animations/variants";

// The two strokes of the MakeOnward mark as hairlines that draw themselves. Quiet decoration for the
// reading pages (services, industries, blog, FAQ, 404).
const MarkStroke = ({ className = "" }) => {
  const ready = useReady();
  const draw = (delay) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: ready ? { pathLength: 1, opacity: 1 } : undefined,
    transition: { pathLength: { duration: 2.2, ease: EASE, delay }, opacity: { duration: 0.3, delay } },
  });
  return (
    <svg className={`mark-stroke ${className}`} viewBox="0 0 230 134" fill="none" aria-hidden="true" focusable="false">
      <motion.path d="M4 130 L78 41 Q81 37 86 37 H122 Q129 37 127 44 L122 60 Q121 63 118 66 L62 126 Q59 130 54 130 Z" {...draw(0.4)} />
      <motion.path d="M132 58 L172 8 Q178 2 186 2 H221 Q228 2 226 9 L201 107 Q200 112 195 114 L148 130 Q142 132 144 125 L159 64 Q160 60 156 60 H134 Q130 60 132 58 Z" {...draw(0.7)} />
    </svg>
  );
};

export default MarkStroke;
