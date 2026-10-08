import React from 'react';
import { motion } from 'framer-motion';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * AnimatedCheckmark — SVG path drawing animation for task/habit completion
 */
export default function AnimatedCheckmark({ 
  checked = false, 
  size = 20, 
  className = '', 
  strokeWidth = 3,
  color = 'currentColor'
}) {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {checked && (
        <motion.path
          d="M4.5 12.75l6 6 9-13.5"
          initial={prefersReduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={prefersReduced ? { duration: 0 } : {
            pathLength: { duration: 0.28, ease: [0.65, 0, 0.35, 1] },
            opacity: { duration: 0.1 }
          }}
        />
      )}
    </svg>
  );
}
