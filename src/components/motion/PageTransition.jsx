import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../../animations/variants';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * PageTransition — Subtle fade and upward nudge when switching pages
 */
export default function PageTransition({ children }) {
  const prefersReduced = isReducedMotionPreferred();

  if (prefersReduced) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
