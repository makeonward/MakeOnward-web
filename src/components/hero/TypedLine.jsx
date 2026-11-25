import React, { useEffect, useState } from "react";
import { useReady } from "../../animations/ReadyContext";
import { usePrefersReducedMotion } from "../../animations/hooks";

const TYPE = 55;
const ERASE = 28;
const HOLD = 1300;

// Types each word once, erases it, and rests on the last one. Decorative: the headline says the same thing.
const TypedLine = ({ words }) => {
  const ready = useReady();
  const reduce = usePrefersReducedMotion();
  const last = words[words.length - 1];
  const [text, setText] = useState("");

  useEffect(() => {
    if (!ready || reduce) return undefined;
    let timer;
    let w = 0;
    let n = 0;
    let erasing = false;
    const tick = () => {
      const word = words[w];
      n += erasing ? -1 : 1;
      setText(word.slice(0, n));
      if (!erasing && n === word.length) {
        if (w === words.length - 1) return;
        erasing = true;
        timer = setTimeout(tick, HOLD);
      } else if (erasing && n === 0) {
        erasing = false;
        w += 1;
        timer = setTimeout(tick, 200);
      } else timer = setTimeout(tick, erasing ? ERASE : TYPE);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduce]);

  return (
    <span className="ph-typed" aria-hidden="true">
      {reduce ? last : text}
      <i />
    </span>
  );
};

export default TypedLine;
