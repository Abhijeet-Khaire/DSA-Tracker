// Global Motion Physics & Timing Configuration for GrindTrack

export const SPRING_TACTILE = {
  type: 'spring',
  stiffness: 500,
  damping: 32,
  mass: 0.8,
};

export const SPRING_SMOOTH = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const SPRING_BOUNCY = {
  type: 'spring',
  stiffness: 420,
  damping: 18,
};

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 200,
  damping: 24,
};

// Micro-interaction timing guide (in seconds)
export const TIMING = {
  buttonPress: 0.15,
  hoverTransition: 0.18,
  checkbox: 0.22,
  tooltip: 0.16,
  dropdown: 0.2,
  modalEntrance: 0.26,
  cardEntrance: 0.28,
  progressTransition: 0.6,
  xpNotification: 0.9,
  celebration: 1.2,
};

export const EASING_STANDARD = [0.22, 1, 0.36, 1]; // cubic-bezier smooth deceleration
export const EASING_ACCEL = [0.4, 0, 1, 1];
export const EASING_DECEL = [0, 0, 0.2, 1];

/**
 * Checks if reduced motion is requested by the OS or user preference in localStorage
 */
export function isReducedMotionPreferred() {
  if (typeof window === 'undefined') return false;
  const userPref = localStorage.getItem('grindtrack_reduced_motion');
  if (userPref !== null) {
    return userPref === 'true';
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
