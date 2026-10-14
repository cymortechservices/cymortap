'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Decorative only. Nothing on the page depends on it. */
export function Background() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <motion.div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-tap-500/20 blur-[90px]"
        animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-tap-600/20 blur-[100px]"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
