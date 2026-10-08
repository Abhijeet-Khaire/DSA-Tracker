import React from 'react';
import Lottie from 'lottie-react';
import { LOTTIE_DATA } from '../../lib/lottieAssets';
import ErrorBoundary from './ErrorBoundary';
import { Flame, Trophy, Target, Sparkles } from 'lucide-react';

function InternalLottie({ type, className, loop, autoplay }) {
  const animationData = LOTTIE_DATA[type] || LOTTIE_DATA.flame;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default function LottieWrapper({ type = 'flame', className = 'w-10 h-10', loop = true, autoplay = true }) {
  // SVG Icon fallbacks in case Lottie rendering errors out
  const renderFallback = () => {
    if (type === 'flame') {
      return (
        <div className={`inline-flex items-center justify-center text-amber-500 animate-pulse ${className}`}>
          <Flame className="w-full h-full fill-amber-500/20" />
        </div>
      );
    }
    if (type === 'trophy') {
      return (
        <div className={`inline-flex items-center justify-center text-yellow-400 animate-bounce ${className}`}>
          <Trophy className="w-full h-full fill-yellow-400/20" />
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center justify-center text-cyan-400 animate-spin-slow ${className}`}>
        <Target className="w-full h-full" />
      </div>
    );
  };

  return (
    <ErrorBoundary fallback={renderFallback()}>
      <InternalLottie type={type} className={className} loop={loop} autoplay={autoplay} />
    </ErrorBoundary>
  );
}
