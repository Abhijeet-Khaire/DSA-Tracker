import React from 'react';
import { motion } from 'framer-motion';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * AnimatedProgressBar — Smoothly fills progress from 0% to 100%
 */
export function AnimatedProgressBar({ 
  value = 0, 
  max = 100, 
  className = 'h-2 bg-slate-800 rounded-full', 
  barClassName = 'bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full' 
}) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const prefersReduced = isReducedMotionPreferred();

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${barClassName}`}
        initial={prefersReduced ? { width: `${percent}%` } : { width: '0%' }}
        animate={{ width: `${percent}%` }}
        transition={prefersReduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/**
 * AnimatedProgressRing — Smoothly animates SVG strokeDashoffset
 */
export function AnimatedProgressRing({
  radius = 64,
  stroke = 6,
  progress = 0, // 0 to 1
  color = '#06b6d4',
  bgColor = 'rgba(255, 255, 255, 0.1)',
  className = ''
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  const prefersReduced = isReducedMotionPreferred();

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className={`transform -rotate-90 ${className}`}
    >
      <circle
        stroke={bgColor}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        initial={prefersReduced ? { strokeDashoffset } : { strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={prefersReduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}
