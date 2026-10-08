import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Wifi, Cpu, ShieldCheck } from 'lucide-react';

const WEB_STATUS_MESSAGES = [
  'Connecting to web mesh...',
  'Resolving decentralized nodes...',
  'Traversing graph pathways...',
  'Hydrating web components...',
  'Synchronizing GrindTrack cloud...',
];

/**
 * WebLoader - A high-performance, aesthetically rich loading animation
 * themed around the World Wide Web, cyber network graphs, and digital web nodes.
 *
 * Props:
 *  - size: 'sm' | 'md' | 'lg' | 'xl'
 *  - message: optional custom loading message (if not provided, rotates through web-themed status)
 *  - showProgress: boolean, display glowing cyber progress bar
 *  - showBadges: boolean, display web network telemetry badges
 *  - className: string, custom wrapper styling
 */
export default function WebLoader({
  size = 'lg',
  message,
  showProgress = true,
  showBadges = true,
  className = '',
}) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % WEB_STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [message]);

  // Size configurations
  const config = {
    sm: {
      dimension: 60,
      hubRadius: 10,
      iconSize: 14,
      strokeWidth: 1.2,
      particleRadius: 2,
    },
    md: {
      dimension: 110,
      hubRadius: 18,
      iconSize: 20,
      strokeWidth: 1.5,
      particleRadius: 3,
    },
    lg: {
      dimension: 180,
      hubRadius: 28,
      iconSize: 30,
      strokeWidth: 1.8,
      particleRadius: 4.5,
    },
    xl: {
      dimension: 240,
      hubRadius: 36,
      iconSize: 40,
      strokeWidth: 2,
      particleRadius: 6,
    },
  }[size] || {
    dimension: 180,
    hubRadius: 28,
    iconSize: 30,
    strokeWidth: 1.8,
    particleRadius: 4.5,
  };

  const center = config.dimension / 2;
  const numSpokes = 8;
  const outerRadius = center * 0.88;
  const ringDistances = [0.35, 0.6, 0.85, 1.0];

  // Generate spokes for the web (angles around 360 degrees)
  const spokes = Array.from({ length: numSpokes }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / numSpokes;
    return {
      x2: center + Math.cos(angle) * outerRadius,
      y2: center + Math.sin(angle) * outerRadius,
      angle,
    };
  });

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center select-none ${className}`}>
      {/* Central Cyber Web Graphics */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Radial Web Glow */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full blur-2xl pointer-events-none"
          style={{
            width: config.dimension * 1.2,
            height: config.dimension * 1.2,
            background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)',
          }}
        />

        {/* Web SVG Structure */}
        <svg
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          className="relative z-10 overflow-visible"
        >
          <defs>
            {/* Linear gradients for futuristic web strands */}
            <linearGradient id="webCyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="webPulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing filter for nodes */}
            <filter id="webNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Concentric Web Rings (Connecting strands) */}
          {ringDistances.map((distRatio, rIdx) => {
            const currentRadius = outerRadius * distRatio;
            // Generate points of polygon along the spokes
            const polygonPoints = spokes
              .map((spoke) => {
                const px = center + Math.cos(spoke.angle) * currentRadius;
                const py = center + Math.sin(spoke.angle) * currentRadius;
                return `${px},${py}`;
              })
              .join(' ');

            return (
              <g key={`ring-${rIdx}`}>
                {/* Polygonal Web Strand */}
                <motion.polygon
                  points={polygonPoints}
                  fill="none"
                  stroke="url(#webCyanPurple)"
                  strokeWidth={config.strokeWidth * (0.8 + rIdx * 0.2)}
                  strokeDasharray={rIdx % 2 === 1 ? '4 3' : 'none'}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: [0.35, 0.75, 0.35],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2.4 + rIdx * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: rIdx * 0.2,
                  }}
                  style={{ transformOrigin: `${center}px ${center}px` }}
                />
              </g>
            );
          })}

          {/* 2. Web Radial Spokes (Radiating strands) */}
          {spokes.map((spoke, sIdx) => (
            <motion.line
              key={`spoke-${sIdx}`}
              x1={center}
              y1={center}
              x2={spoke.x2}
              y2={spoke.y2}
              stroke="rgba(6, 182, 212, 0.45)"
              strokeWidth={config.strokeWidth}
              initial={{ pathLength: 0.2 }}
              animate={{
                opacity: [0.3, 0.85, 0.3],
                stroke: [
                  'rgba(6, 182, 212, 0.35)',
                  'rgba(168, 85, 247, 0.7)',
                  'rgba(6, 182, 212, 0.35)',
                ],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: sIdx * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 3. Outer Rotating Cyber Ring with Dash Array */}
          <motion.circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={config.strokeWidth * 1.2}
            strokeDasharray={`${outerRadius * 0.5} ${outerRadius * 0.3}`}
            strokeOpacity="0.5"
            animate={{ rotate: 360 }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Counter-rotating Inner Segment Ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={outerRadius * 0.65}
            fill="none"
            stroke="#a855f7"
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${outerRadius * 0.3} ${outerRadius * 0.4}`}
            strokeOpacity="0.6"
            animate={{ rotate: -360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* 4. Intersection Web Nodes (Glowing Data Anchors) */}
          {ringDistances.map((distRatio, rIdx) => {
            const currentRadius = outerRadius * distRatio;
            return spokes.map((spoke, sIdx) => {
              const nx = center + Math.cos(spoke.angle) * currentRadius;
              const ny = center + Math.sin(spoke.angle) * currentRadius;
              const isAccent = (rIdx + sIdx) % 3 === 0;

              return (
                <motion.circle
                  key={`node-${rIdx}-${sIdx}`}
                  cx={nx}
                  cy={ny}
                  r={config.particleRadius * (isAccent ? 1.25 : 0.8)}
                  fill={isAccent ? '#38bdf8' : '#c084fc'}
                  filter="url(#webNodeGlow)"
                  animate={{
                    r: [
                      config.particleRadius * 0.7,
                      config.particleRadius * 1.3,
                      config.particleRadius * 0.7,
                    ],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: (rIdx * 0.2 + sIdx * 0.1) % 1.5,
                    ease: 'easeInOut',
                  }}
                />
              );
            });
          })}

          {/* 5. Orbiting Data Packets (Traveling Along the Web) */}
          <g style={{ transformOrigin: `${center}px ${center}px` }}>
            <motion.circle
              cx={center + outerRadius * 0.6}
              cy={center}
              r={config.particleRadius * 1.4}
              fill="#22d3ee"
              filter="url(#webNodeGlow)"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
            <motion.circle
              cx={center - outerRadius * 0.85}
              cy={center}
              r={config.particleRadius * 1.2}
              fill="#f43f5e"
              filter="url(#webNodeGlow)"
              animate={{ rotate: -360 }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
          </g>

          {/* 6. Central Web Hub Core */}
          <motion.circle
            cx={center}
            cy={center}
            r={config.hubRadius}
            fill="#090d16"
            stroke="url(#webCyanPurple)"
            strokeWidth={config.strokeWidth * 1.5}
            animate={{
              scale: [1, 1.08, 1],
              strokeWidth: [config.strokeWidth * 1.5, config.strokeWidth * 2.2, config.strokeWidth * 1.5],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        </svg>

        {/* Central Web Emblem / Code Tag Icon */}
        <div
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          style={{ width: config.hubRadius * 1.8, height: config.hubRadius * 1.8 }}
        >
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [0.92, 1.05, 0.92],
            }}
            transition={{
              rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="flex items-center justify-center text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          >
            <Globe style={{ width: config.iconSize, height: config.iconSize }} />
          </motion.div>
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-5 flex flex-col items-center gap-1.5 max-w-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={message || statusIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm md:text-base font-semibold tracking-wide bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent"
          >
            {message || WEB_STATUS_MESSAGES[statusIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="text-xs text-slate-400 font-mono tracking-tight">
          GrindTrack Web Engine • Reactive Pipeline
        </p>
      </div>

      {/* Glowing Cyber Progress Bar */}
      {showProgress && (
        <div className="mt-4 w-48 sm:w-64 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: 'easeInOut',
            }}
            style={{ width: '60%' }}
          />
        </div>
      )}

      {/* Web Network Telemetry Badges */}
      {showBadges && size !== 'sm' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400"
        >
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-cyan-400/90 shadow-sm">
            <Wifi className="w-3 h-3 text-cyan-400 animate-pulse" />
            HTTP/3 Web Mesh
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-purple-400/90 shadow-sm">
            <Cpu className="w-3 h-3 text-purple-400" />
            V8 Fast Paths
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-emerald-400/90 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            TLS 1.3
          </span>
        </motion.div>
      )}
    </div>
  );
}
