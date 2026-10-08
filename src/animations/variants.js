import { SPRING_TACTILE, SPRING_SMOOTH, SPRING_BOUNCY, EASING_STANDARD } from './motionConfig';

// Button micro-interaction variants
export const buttonTapVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -1.5,
    transition: { duration: 0.16, ease: EASING_STANDARD }
  },
  tap: { 
    scale: 0.96, 
    y: 0,
    transition: SPRING_TACTILE
  },
  disabled: { 
    opacity: 0.5, 
    scale: 1, 
    y: 0, 
    filter: 'grayscale(0.6)' 
  },
};

// Card interaction variants
export const cardHoverVariants = {
  rest: { 
    y: 0, 
    scale: 1,
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
  },
  hover: { 
    y: -3, 
    scale: 1.01,
    boxShadow: '0 14px 28px -6px rgba(6, 182, 212, 0.18), 0 6px 12px -2px rgba(0, 0, 0, 0.4)',
    transition: { duration: 0.22, ease: EASING_STANDARD }
  },
  tap: {
    scale: 0.99,
    y: -1,
    transition: SPRING_TACTILE
  }
};

// Modal Entrance & Exit variants (Backdrop & Content)
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' }
  }
};

export const modalContentVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 12 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: SPRING_SMOOTH
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 8,
    transition: { duration: 0.18, ease: 'easeIn' }
  }
};

// Dropdown Menu variants
export const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.94, 
    y: -6,
    transformOrigin: 'top right',
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: SPRING_TACTILE
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -4,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

// List Stagger Container & Items
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    }
  }
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: SPRING_SMOOTH
  }
};

// SVG Animated Checkmark
export const checkmarkPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      duration: 0.32, 
      ease: [0.65, 0, 0.35, 1],
      delay: 0.05
    }
  }
};

// Floating XP Toast popup variants
export const xpToastVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: SPRING_BOUNCY
  },
  exit: { 
    opacity: 0, 
    scale: 0.85, 
    y: -24,
    transition: { duration: 0.28, ease: 'easeIn' }
  }
};

// Subtle Page transition
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.24, ease: EASING_STANDARD }
  },
  exit: { 
    opacity: 0, 
    y: -6,
    transition: { duration: 0.16, ease: 'easeIn' }
  }
};

// Icon micro-motions
export const iconRotateHover = {
  rest: { rotate: 0 },
  hover: { rotate: 90, transition: SPRING_TACTILE }
};

export const iconNudgeHover = {
  rest: { x: 0, y: 0 },
  hover: { x: 2, y: -2, transition: SPRING_TACTILE }
};

export const iconPulseHover = {
  rest: { scale: 1 },
  hover: { scale: 1.18, transition: SPRING_BOUNCY }
};
