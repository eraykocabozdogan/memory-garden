import { useEffect, useRef, useState } from "react";

// Decision 9-5: a number that runs up to its value once. For the countdown card and the garden's
// counts; anything that is not a headline number is simply printed.

export function CountUp({
  to,
  duration = 1200,
  className,
}: {
  to: number;
  /** Milliseconds for the whole run. */
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease out, so the last digits settle instead of snapping.
      setValue(Math.round(to * (1 - (1 - t) ** 3)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [to, duration]);

  // tabular-nums keeps the digits from shifting the layout as they run.
  return <span className={`tabular-nums ${className ?? ""}`}>{value}</span>;
}
