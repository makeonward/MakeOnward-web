import { useEffect } from "react";
import { startLenis, stopLenis } from "../../animations/lenis";
import { usePrefersReducedMotion } from "../../animations/hooks";

// Mounts Lenis once. Skipped entirely for reduced-motion users (native scroll).
const SmoothScroll = () => {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return undefined;
    startLenis();
    return stopLenis;
  }, [reduce]);

  return null;
};

export default SmoothScroll;
