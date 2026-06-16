import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({
  value,
  direction = "up",
}: {
  value: number;
  direction?: "up" | "down";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === "down" ? 0 : value);
    }
  }, [motionValue, isInView, value, direction]);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US").format(
        Math.round(springValue.get()),
      );
    }

    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.round(latest),
        );
      }
    });
  }, [springValue]);

  return <span ref={ref} />;
}

export default function TextTicker({ value }: { value: number }) {
  return (
    <span className="text-7xl font-bold tabular-nums tracking-tight">
      <Counter value={value} /> {/* use direction param for "up" or "down" */}
    </span>
  );
}
