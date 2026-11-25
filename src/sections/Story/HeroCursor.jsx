import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const FOLLOW = { stiffness: 420, damping: 34, mass: 0.6 };

// A cursor that reads what it is over, inside `rootRef`: a thin ring by default, a filled disc with a word
// over [data-hero-cursor="Word"], and over a button the ring snaps to the button's centre. Clicks pulse.
// Mouse only (the caller mounts it for fine pointers); decorative.
const HeroCursor = ({ rootRef }) => {
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState("idle"); // idle | disc | snap
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(0);
  const tx = useMotionValue(-200);
  const ty = useMotionValue(-200);
  const x = useSpring(tx, FOLLOW);
  const y = useSpring(ty, FOLLOW);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      const target = e.target.closest?.("[data-hero-cursor]");
      const button = target ? null : e.target.closest?.("button, a");
      if (button) {
        const b = button.getBoundingClientRect();
        tx.set(b.left - r.left + b.width / 2);
        ty.set(b.top - r.top + b.height / 2);
      } else {
        tx.set(e.clientX - r.left);
        ty.set(e.clientY - r.top);
      }
      setKind(target ? "disc" : button ? "snap" : "idle");
      if (target) setLabel(target.dataset.heroCursor);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPulse((n) => n + 1);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    };
  }, [rootRef, tx, ty]);

  const spring = { type: "spring", stiffness: 360, damping: 26 };
  return (
    <div className="st-cursor" aria-hidden="true">
      <motion.span className="st-cursor__at" style={{ x, y }}>
        <motion.i
          className="st-cursor__ring"
          initial={{ scale: 0 }}
          animate={{ scale: !visible || kind === "disc" ? 0 : kind === "snap" ? 2.1 : 1, opacity: kind === "snap" ? 0.45 : 1 }}
          transition={spring}
        />
        <motion.span className="st-cursor__disc" initial={{ scale: 0 }} animate={{ scale: visible && kind === "disc" ? 1 : 0 }} transition={spring}>
          {label}
        </motion.span>
        {pulse > 0 && (
          <motion.i
            key={pulse}
            className="st-cursor__pulse"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </motion.span>
    </div>
  );
};

export default HeroCursor;
