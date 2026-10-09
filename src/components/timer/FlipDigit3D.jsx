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

    // Trigger true mechanical 2-phase split-flap transition
    setPreviousDigit(currentDigit);
    setCurrentDigit(digit);
    setIsFlipping(true);

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
      setPreviousDigit(digit);
    }, 480);

    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [digit, currentDigit, prefersReduced]);

  return (
    <div className="flip-digit-module">
      {/* 1. Static Top Plate: Shows current (new) digit's upper half */}
      <div className="flip-plate flip-plate-top">
        <div className="flip-plate-bg" />
        <div className="flip-glyph-wrapper">
          <span className="flip-glyph">{currentDigit}</span>
        </div>
      </div>

      {/* 2. Static Bottom Plate: Shows previous digit until animation completes */}
      <div className="flip-plate flip-plate-bottom">
        <div className="flip-plate-bg" />
        <div className="flip-glyph-wrapper">
          <span className="flip-glyph">
            {isFlipping ? previousDigit : currentDigit}
          </span>
        </div>
      </div>

      {/* 3. Dynamic Animated Flaps (Active during 3D flip transition) */}
      {isFlipping && !prefersReduced && (
        <>
          {/* Top Flap: Shows previous digit upper half, swings down 0deg -> -90deg */}
          <div className="flip-plate flip-plate-top flip-flap-top-animated">
            <div className="flip-plate-bg" />
            <div className="flip-glyph-wrapper">
              <span className="flip-glyph">{previousDigit}</span>
            </div>
          </div>

          {/* Bottom Flap: Shows new digit lower half, swings down 90deg -> 0deg */}
          <div className="flip-plate flip-plate-bottom flip-flap-bottom-animated">
            <div className="flip-plate-bg" />
            <div className="flip-glyph-wrapper">
              <span className="flip-glyph">{currentDigit}</span>
            </div>
          </div>
        </>
      )}

      {/* 4. Physical Center Seam Gap */}
      <div className="flip-center-seam" />
    </div>
  );
}
