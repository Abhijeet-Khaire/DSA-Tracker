import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium SVG Vector Streak Flame Drawable
 * Replaces broken Lottie/emojis with a crisp, glowing multi-layer vector flame.
 * Visible and styled for both 0-day (dormant ember) and active (fiery blaze) states.
 */
export default function StreakFlameDrawable({ 
  streak = 0, 
  className = 'w-6 h-6', 
  active = false 
}) {
  const isLit = Number(streak) > 0 || active;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Dynamic ambient glow behind active flame */}
      {isLit && (
        <span 
          className="absolute inset-0 rounded-full blur-[5px] opacity-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.65) 0%, rgba(239,68,68,0.25) 70%, transparent 100%)'
          }}
        />
      )}

      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full relative z-10 select-none ${isLit ? 'filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.4)]' : 'opacity-70'}`}
      >
        <defs>
          {/* Active Flame Gradient: Golden tip -> Vivid Orange -> Deep Crimson base */}
          <linearGradient id="streakFlameActiveGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />    {/* Electric Amber / Gold Tip */}
            <stop offset="28%" stopColor="#F59E0B" />   {/* Amber */}
            <stop offset="65%" stopColor="#EA580C" />   {/* Fiery Orange */}
            <stop offset="100%" stopColor="#DC2626" />  {/* Crimson Red Base */}
          </linearGradient>

          {/* Inner Core Flame Gradient: White-hot center */}
          <linearGradient id="streakFlameCoreGrad" x1="12" y1="10" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Dormant Ember Gradient (for streak = 0 so it's always clearly visible) */}
          <linearGradient id="streakFlameDormantGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#78716C" />
            <stop offset="100%" stopColor="#44403C" />
          </linearGradient>
        </defs>

        {/* Outer Flame Shell */}
        <path
          d="M12 2C11.5 5.2 8.5 7.2 8.5 10.8C8.5 11.5 8.65 12.2 8.95 12.8C7.3 13.4 6 15 6 16.9C6 20.27 8.69 23 12 23C15.31 23 18 20.27 18 16.9C18 13.5 15.5 11.4 15 7.9C14.5 9.8 13.1 10.9 13.1 10.9C13.1 10.9 13.6 5.1 12 2Z"
          fill={isLit ? "url(#streakFlameActiveGrad)" : "url(#streakFlameDormantGrad)"}
        />

        {/* Inner Heart of the Flame */}
        <path
          d="M12 11.2C11.3 13 10.2 14.1 10.2 16.4C10.2 18.3 11.7 19.9 13.5 19.9C15.3 19.9 16.8 18.3 16.8 16.4C16.8 14.1 14.7 13.1 14.2 11.2C13.7 12.6 12.6 12.6 12 11.2Z"
          fill={isLit ? "url(#streakFlameCoreGrad)" : "rgba(255,255,255,0.2)"}
          opacity={isLit ? 0.95 : 0.6}
        />

        {/* Dynamic Sparks / Embers */}
        {isLit && (
          <>
            <circle cx="7" cy="9.5" r="0.9" fill="#FDE047" opacity="0.85" />
            <circle cx="17" cy="7.8" r="1.1" fill="#FB923C" opacity="0.9" />
            <circle cx="15.8" cy="14" r="0.7" fill="#FEF08A" opacity="0.75" />
          </>
        )}
      </svg>
    </div>
  );
}
