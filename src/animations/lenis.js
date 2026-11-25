import Lenis from "lenis";

// One smooth-scroll instance for the whole app. Framer Motion's useScroll follows its native scroll events.
let instance = null;
let frame = 0;

export const getLenis = () => instance;

export const startLenis = () => {
  if (instance) return instance;
  instance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  });
  const tick = (time) => {
    instance?.raf(time);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return instance;
};

export const stopLenis = () => {
  if (!instance) return;
  cancelAnimationFrame(frame);
  instance.destroy();
  instance = null;
};

export const lockScroll = () => instance && instance.stop();
export const unlockScroll = () => instance && instance.start();
export const scrollToTop = (immediate = true) => {
  if (instance) instance.scrollTo(0, { immediate });
  else window.scrollTo(0, 0);
};
export const scrollToTarget = (target, opts = {}) => {
  if (instance) instance.scrollTo(target, { offset: 0, duration: 1.4, ...opts });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el && el.scrollIntoView({ behavior: "smooth" });
  }
};
