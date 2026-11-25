import React, { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const between = (a, b) => a + Math.random() * (b - a);

// Fine dust behind a hero, drifting up. With `sceneRef` (the services tower) some of it circles that element as
// it rises. Decorative. Draws one still frame when not `running`.
const HeroDust = ({ sceneRef, running }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let cx = 0;
    let reach = 0;
    let colors = [];
    let specks = [];
    let raf = 0;
    let last = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      const s = sceneRef?.current?.getBoundingClientRect() || r;
      const fresh = !specks.length || Math.abs(r.width - w) > 40;
      w = r.width;
      h = r.height;
      cx = s.left - r.left + s.width / 2;
      reach = Math.min(s.width * 0.52, 520);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (!fresh) return;
      const n = w < 768 ? 70 : 170;
      specks = Array.from({ length: n }, (_, i) => ({
        orbit: !!sceneRef && i % 5 < 2,
        x: Math.random(),
        y: Math.random(),
        a: Math.random() * TAU,
        spread: between(0.55, 1.15),
        spin: between(0.1, 0.2),
        rise: between(0.008, 0.024), // screens per second
        size: between(0.8, 2.1),
        light: between(0.3, 0.85),
        pulse: between(0.4, 1.1),
        warm: i % 4 === 0,
      }));
    };
    const paint = () => {
      const css = getComputedStyle(canvas);
      colors = [css.getPropertyValue("--fg").trim(), css.getPropertyValue("--btn-bg").trim()];
    };

    const draw = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      specks.forEach((p) => {
        p.y -= p.rise * dt;
        if (p.y < -0.02) p.y = 1.02;
        p.a += p.spin * dt;
        const near = p.orbit ? (Math.sin(p.a) + 1) / 2 : 0.5; // 1: this side of the tower
        const x = p.orbit ? cx + Math.cos(p.a) * reach * p.spread : p.x * w + Math.sin(p.a) * 14;
        const twinkle = 0.75 + 0.25 * Math.sin((now / 1000) * p.pulse * 2 + p.a);
        const edge = Math.min(1, p.y * 8, (1 - p.y) * 8); // fades in and out at the top and bottom
        ctx.globalAlpha = Math.max(0, p.light * twinkle * edge * (0.45 + near * 0.55));
        ctx.fillStyle = colors[p.warm ? 1 : 0];
        ctx.beginPath();
        ctx.arc(x, p.y * h, p.size * (0.7 + near * 0.7), 0, TAU);
        ctx.fill();
      });
      if (running) raf = requestAnimationFrame(draw);
    };

    build();
    paint();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {
      build();
      if (!running) draw(last);
    });
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      paint();
      if (!running) draw(last);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [sceneRef, running]);

  return <canvas className="hero-dust" ref={ref} aria-hidden="true" />;
};

export default HeroDust;
