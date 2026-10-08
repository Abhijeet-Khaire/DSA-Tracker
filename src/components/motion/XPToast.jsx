import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { xpToastVariants } from '../../animations/variants';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

/**
 * XPToastContainer — Renders floating animated XP reward toasts.
 * Rapid rewards are grouped automatically to avoid cluttering the viewport.
 */
export default function XPToastContainer({ activeReward, onDismiss }) {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <div className="fixed bottom-8 right-8 z-[120] pointer-events-none flex flex-col items-end gap-2">
      <AnimatePresence>
        {activeReward && (
          <motion.div
            key={activeReward.id}
            variants={prefersReduced ? undefined : xpToastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-500/90 to-amber-600/90 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 border border-amber-300/60 backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-xl bg-slate-950/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-wide">
                +{activeReward.amount} XP Earned!
              </span>
              {activeReward.reason && (
                <span className="text-[10px] font-bold text-slate-900/80 leading-tight">
                  {activeReward.reason}
                </span>
              )}
            </div>
            <Sparkles className="w-4 h-4 text-slate-950 ml-1 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
