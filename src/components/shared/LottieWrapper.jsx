import React from 'react';
import StreakFlameDrawable from './StreakFlameDrawable';
import { Trophy, Target, Sparkles } from 'lucide-react';

/**
 * Robust Vector Drawable Wrapper
 * Replaces heavy/broken Lottie JSON with ultra-crisp vector SVG drawables.
 */
export default function LottieWrapper({ 
  type = 'flame', 
  className = 'w-10 h-10', 
  loop = true, 
  autoplay = true 
}) {
  if (type === 'flame') {
    return <StreakFlameDrawable streak={1} className={className} active={true} />;
  }

  if (type === 'trophy') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        {/* Ambient Gold Glow */}
        <span 
          className="absolute inset-0 rounded-full blur-[8px] opacity-70 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.5) 0%, transparent 70%)' }}
        />
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full relative z-10 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]"
        >
          <defs>
            <linearGradient id="trophyGoldGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <path 
            d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V5A2 2 0 0 1 4 3H6M18 9H19.5A2.5 2.5 0 0 0 22 6.5V5A2 2 0 0 0 20 3H18M4 3H20V10A6 6 0 0 1 14 16H10A6 6 0 0 1 4 10V3ZM12 16V20M8 21H16" 
            stroke="url(#trophyGoldGrad)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
    );
  }

  if (type === 'target') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        {/* Ambient Cyan Glow */}
        <span 
          className="absolute inset-0 rounded-full blur-[8px] opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.45) 0%, transparent 70%)' }}
        />
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full relative z-10 filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]"
        >
          <defs>
            <linearGradient id="targetCyanGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" stroke="url(#targetCyanGrad)" strokeWidth="2" opacity="0.4" />
          <circle cx="12" cy="12" r="6" stroke="url(#targetCyanGrad)" strokeWidth="2" opacity="0.8" />
          <circle cx="12" cy="12" r="2" fill="url(#targetCyanGrad)" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 text-amber-400 ${className}`}>
      <Sparkles className="w-full h-full animate-pulse" />
    </div>
  );
}
