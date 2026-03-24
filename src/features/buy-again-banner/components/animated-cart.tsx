"use client";

import { motion } from "motion/react";

const CYCLE = 3.5;

const ITEMS = [
  [12, 22],
  [20, 22],
  [16, 15],
];

export function AnimatedCart({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={40}
      viewBox="0 0 40 40"
      width={40}
    >
      <motion.g
        animate={{
          x: [0, 0, 50, -50, 0, 0],
          opacity: [1, 1, 0, 0, 1, 1],
        }}
        transition={{
          duration: CYCLE,
          times: [0, 0.43, 0.54, 0.55, 0.66, 1],
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <g
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        >
          <path d="M8 14h24l-3 16H11z" fill="none" />
          <path d="M8 14L6 8H2" fill="none" />
          <circle cx={14} cy={34} fill="currentColor" r={2} stroke="none" />
          <circle cx={28} cy={34} fill="currentColor" r={2} stroke="none" />
        </g>

        {ITEMS.map(([x, y], i) => (
          <motion.rect
            animate={{
              y: [2, 2, y, y, 2, 2],
              opacity: [0, 0, 1, 1, 0, 0],
            }}
            fill="currentColor"
            height={7}
            key={`${x}-${y}`}
            rx={1}
            transition={{
              duration: CYCLE,
              times: [0, i * 0.11, (i + 1) * 0.11, 0.54, 0.55, 1],
              repeat: Number.POSITIVE_INFINITY,
            }}
            width={7}
            x={x}
          />
        ))}
      </motion.g>
    </svg>
  );
}
