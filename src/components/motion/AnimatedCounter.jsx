import React, { useEffect, useState, useRef } from 'react';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * AnimatedCounter — Smoothly counts up/down when numerical values change
 */
export default function AnimatedCounter({ 
  value = 0, 
  duration = 600, 
  prefix = '', 
  suffix = '', 
  className = '' 
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValRef = useRef(value);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // If value contains non-numeric strings or reduced motion is preferred, render directly
    if (typeof value !== 'number' || isReducedMotionPreferred()) {
      setDisplayValue(value);
      return;
    }

    const start = displayValue;
    const target = value;
    if (start === target) return;

    startValRef.current = start;
    startTimeRef.current = performance.now();

    const updateCounter = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth deceleration curve: 1 - Math.pow(1 - progress, 3)
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValRef.current + (target - startValRef.current) * easeOutProgress);

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
    </span>
  );
}
