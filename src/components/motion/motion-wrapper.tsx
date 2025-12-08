"use client";

import { type HTMLMotionProps, motion } from "motion/react";

export function MotionDiv(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />;
}

export function MotionP(props: HTMLMotionProps<"p">) {
  return <motion.p {...props} />;
}

export function MotionH2(props: HTMLMotionProps<"h2">) {
  return <motion.h2 {...props} />;
}

export function MotionSection(props: HTMLMotionProps<"section">) {
  return <motion.section {...props} />;
}

export function MotionArticle(props: HTMLMotionProps<"article">) {
  return <motion.article {...props} />;
}
