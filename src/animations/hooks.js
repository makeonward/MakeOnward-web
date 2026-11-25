import { useSyncExternalStore } from "react";

const subscribeTo = (query) => (cb) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export const useMediaQuery = (query) =>
  useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false
  );

// Layout: wide screens.
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

// Pinned scroll scenes run on phones too; only a very short screen or reduced motion gets the plain version.
export const useScenes = () => {
  const room = useMediaQuery("(min-width: 1024px), (min-height: 600px)");
  return !usePrefersReducedMotion() && room;
};
