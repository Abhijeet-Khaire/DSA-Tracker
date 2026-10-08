import React from 'react';
import { motion } from 'framer-motion';
import { buttonTapVariants } from '../../animations/variants';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * MotionButton — Accessible, tactile button with micro-animations
 * Scales slightly on hover (1.02) and compresses on click (0.96)
 */
export default function MotionButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title = '',
  id,
  variant = 'default', // 'default' | 'subtle' | 'ghost' | 'danger'
  ...props
}) {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <motion.button
      id={id}
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      variants={prefersReduced ? undefined : buttonTapVariants}
      initial="rest"
      whileHover={disabled || prefersReduced ? undefined : 'hover'}
      whileTap={disabled || prefersReduced ? undefined : 'tap'}
      className={`relative inline-flex items-center justify-center font-bold outline-none select-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
