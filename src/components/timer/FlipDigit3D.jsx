import React, { useState, useEffect, useRef } from 'react';
import './flipClock.css';

export default function FlipDigit3D({ digit, prefersReduced = false }) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const prevDigitRef = useRef(digit);
  const timerRef = useRef(null);

  useEffect(() => {
    // Only trigger flip animation if digit actually changed
    if (digit === prevDigitRef.current) return;

    const oldDigit = prevDigitRef.current;
    prevDigitRef.current = digit;

    if (prefersReduced) {
      setCurrentDigit(digit);
      setPreviousDigit(digit);
      setIsFlipping(false);
      return;
    }

    // Trigger mechanical split-flap animation cycle
    setPreviousDigit(oldDigit);
    setCurrentDigit(digit);
    setIsFlipping(true);
    setFlipCount((c) => c + 1);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsFlipping(false);
      setPreviousDigit(digit);
    }, 420);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [digit, prefersReduced]);

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

      {/* 3. Dynamic Animated Flaps: Keyed by flipCount so fresh animations mount and play on each second */}
      {isFlipping && !prefersReduced && (
        <React.Fragment key={`flip-${flipCount}`}>
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
        </React.Fragment>
      )}

      {/* 4. Physical Center Seam Gap */}
      <div className="flip-center-seam" />
    </div>
  );
}
