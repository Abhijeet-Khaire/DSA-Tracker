import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebLoader from './WebLoader';

export default function WebLoadingScreen({ message, isVisible = true }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="web-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl overflow-hidden select-none"
        >
          {/* Subtle Ambient Background Cyber Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(6,182,212,0.18) 1px, transparent 0)`,
              backgroundSize: '36px 36px',
            }}
          />

          {/* Glowing Ambient Light Orbs */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

          {/* Top Brand Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 flex items-center gap-3 z-10"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <span className="font-extrabold text-white text-base font-mono">&lt;/&gt;</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                GrindTrack
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase">
                  Web v1.0
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">DSA + Daily Tracker Engine</span>
            </div>
          </motion.div>

          {/* Main Web Themed Loader */}
          <WebLoader size="lg" message={message} showProgress={true} showBadges={true} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
