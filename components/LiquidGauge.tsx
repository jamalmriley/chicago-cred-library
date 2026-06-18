"use client";

import { motion } from "framer-motion";

interface GaugeProps {
  value: number;
  caption?: string;
  waviness?: number;
}

function Wave({ waviness }: { waviness: number }) {
  return (
    <motion.div
      className="absolute left-0 top-0 w-[200%] h-full text-primary"
      animate={{
        x: ["0%", "-50%"],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "linear",
      }}
    >
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          fill="currentColor"
          d={`
            M0 ${waviness}
            C 50 0, 150 0, 200 ${waviness}
            S 350 ${waviness * 2}, 400 ${waviness}
            S 550 0, 600 ${waviness}
            S 750 ${waviness * 2}, 800 ${waviness}
            S 950 0, 1000 ${waviness}
            V100
            H0
            Z
          `}
        />
      </svg>
    </motion.div>
  );
}

export default function LiquidGauge({
  value,
  caption,
  waviness = 8,
}: GaugeProps) {
  const fillPercent = Math.max(0, Math.min(100, value));
  const yOffset = 100 - fillPercent;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-card select-none rounded-lg">
      {/* Background text */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <span className="text-5xl font-black tracking-tight text-foreground">
          {Math.round(fillPercent)}%
        </span>

        {caption && (
          <span className="absolute mt-15 text-xs font-medium text-foreground/70">
            {caption}
          </span>
        )}
      </div>

      {/* Liquid */}
      <motion.div
        className="absolute inset-0 z-10 overflow-hidden"
        initial={{ y: "100%" }}
        animate={{ y: `${yOffset}%` }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Liquid body */}
        <div className="absolute inset-0 bg-primary" />

        {/* Wave surface */}
        <div
          className="absolute left-0 right-0 top-0"
          style={{ height: `${waviness * 2}px` }}
        >
          <Wave waviness={waviness} />
        </div>

        {/* Filled text */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          initial={{ y: "-100%" }}
          animate={{ y: `-${yOffset}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <span className="text-5xl font-black tracking-tight text-primary-foreground">
            {Math.round(fillPercent)}%
          </span>

          {caption && (
            <span className="absolute mt-15 text-xs font-medium text-primary-foreground/70">
              {caption}
            </span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
