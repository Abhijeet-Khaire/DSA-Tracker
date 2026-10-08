import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants, staggerItemVariants } from '../../animations/variants';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * MotionCard — Tactile card with subtle lift & glow
 */
export default function MotionCard({
  children,
  className = '',
  onClick,
  isStaggerItem = false,
  interactive = true,
  ...props
}) {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <motion.div
      variants={isStaggerItem ? staggerItemVariants : (interactive && !prefersReduced ? cardHoverVariants : undefined)}
      initial={isStaggerItem ? 'hidden' : 'rest'}
      animate={isStaggerItem ? 'visible' : undefined}
      whileHover={interactive && !prefersReduced ? 'hover' : undefined}
      whileTap={interactive && onClick && !prefersReduced ? 'tap' : undefined}
      onClick={onClick}
      className={`glass-panel rounded-2xl border transition-colors ${className} ${onClick ? 'cursor-pointer' : ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
