import React, { useState, useEffect, useRef } from 'react';
import './flipClock.css';

export default function FlipDigit3D({ digit, prefersReduced = false }) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipTimerRef = useRef(null);

  useEffect(() => {
    if (digit === currentDigit) return;

    if (prefersReduced) {
      setCurrentDigit(digit);
      setPreviousDigit(digit);
      setIsFlipping(false);
      return;
    }

    // Trigger true mechanical 3D split-flap transition
    setPreviousDigit(currentDigit);
    setCurrentDigit(digit);
    setIsFlipping(true);

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
      setPreviousDigit(digit);
    }, 520);

    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [digit, currentDigit, prefersReduced]);

  return (
    <div className="flip-digit-module">
      <div className="flip-digit-card">
        {/* 1. Static Upper Half (Shows the new digit behind the falling flap) */}
        <div className="flip-half flip-half-top">
          <span className="flip-number-text">{currentDigit}</span>
        </div>

        {/* 2. Static Lower Half (Shows previous digit until covered by flap landing) */}
        <div className="flip-half flip-half-bottom">
          <span className="flip-number-text">
            {isFlipping ? previousDigit : currentDigit}
          </span>
        </div>

        {/* 3. The 3D Rotating Leaf (Active during split-flap transition) */}
        {isFlipping && !prefersReduced && (
          <div className="flip-flipper-leaf flip-animate">
            {/* Front of leaf: Upper half of old digit falling downward */}
            <div className="flip-leaf-front">
              <span className="flip-number-text">{previousDigit}</span>
              <div className="flip-shadow-overlay" />
            </div>

            {/* Back of leaf: Lower half of new digit landing on bottom plate */}
            <div className="flip-leaf-back">
              <span className="flip-number-text">{currentDigit}</span>
              <div className="flip-shadow-overlay" />
            </div>
          </div>
        )}

        {/* 4. Physical Center Seam & Mechanical Hinge Gap */}
        <div className="flip-center-split" />
      </div>
    </div>
  );
}
