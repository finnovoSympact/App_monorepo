"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Animated number counter. Great for KPI tiles.
 * <NumberTicker value={12450} formatter={formatTND} />
 */
export function NumberTicker({
  value,
  formatter = (v) => v.toLocaleString(),
  duration = 1.2,
  className,
}: {
  value: number;
  formatter?: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => formatter(Math.round(v)));

  React.useEffect(() => {
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
