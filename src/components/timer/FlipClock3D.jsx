import React from 'react';
import FlipDigit3D from './FlipDigit3D';
import './flipClock.css';

export default function FlipClock3D({ 
  hours = 0, 
  minutes = 0, 
  seconds = 0, 
  isActive = false, 
  prefersReduced = false 
}) {
  // Pad each unit to exactly 2 digits
  const hStr = String(Math.max(0, hours)).padStart(2, '0');
  const mStr = String(Math.max(0, minutes)).padStart(2, '0');
  const sStr = String(Math.max(0, seconds)).padStart(2, '0');

  const [h1, h2] = hStr.split('');
  const [m1, m2] = mStr.split('');
  const [s1, s2] = sStr.split('');

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* 3D Floating Housing Container */}
      <div className="flip-clock-housing p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-[#29334A] w-full max-w-xl mx-auto flex flex-col items-center justify-center">
        {/* Digits & Colons Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5">
          {/* HOURS GROUP */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <FlipDigit3D digit={h1} prefersReduced={prefersReduced} />
              <FlipDigit3D digit={h2} prefersReduced={prefersReduced} />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8] mt-3 select-none">
              Hours
            </span>
          </div>

          {/* COLON 1 */}
          <div className={`flex flex-col justify-center gap-3 sm:gap-4 pb-6 px-0.5 ${isActive ? 'flip-colon-pulsing' : ''}`}>
            <div className="flip-colon-dot" />
            <div className="flip-colon-dot" />
          </div>

          {/* MINUTES GROUP */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <FlipDigit3D digit={m1} prefersReduced={prefersReduced} />
              <FlipDigit3D digit={m2} prefersReduced={prefersReduced} />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8] mt-3 select-none">
              Minutes
            </span>
          </div>

          {/* COLON 2 */}
          <div className={`flex flex-col justify-center gap-3 sm:gap-4 pb-6 px-0.5 ${isActive ? 'flip-colon-pulsing' : ''}`}>
            <div className="flip-colon-dot" />
            <div className="flip-colon-dot" />
          </div>

          {/* SECONDS GROUP */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <FlipDigit3D digit={s1} prefersReduced={prefersReduced} />
              <FlipDigit3D digit={s2} prefersReduced={prefersReduced} />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8] mt-3 select-none">
              Seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
