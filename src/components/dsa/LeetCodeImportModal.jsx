import React from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import { Sparkles, Clock, Zap, Flame, Trophy, ExternalLink, ArrowRight } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function LeetCodeImportModal({ isOpen, onClose }) {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LeetCode Direct Sync" maxWidth="max-w-md">
      <div className="space-y-5 py-1">
        {/* Glowing Badge & Header Graphic */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <motion.div
            initial={prefersReduced ? undefined : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_SMOOTH}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 relative"
          >
            <Clock className="w-8 h-8 text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          </motion.div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" /> Coming Soon
            </div>
            <h3 className="text-base font-extrabold text-slate-100">
              Direct LeetCode Profile Sync
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              We are building a direct, rate-limit-proof integration for real-time problem tracking and submission verification.
            </p>
          </div>
        </div>

        {/* Feature Roadmap Preview Cards */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            What's in the works
          </span>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Instant Problem Sync</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Automatically import your solved problems, difficulty counts, and topic mastery.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400 shrink-0 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Daily Streak Alignment</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Sync submission calendar timestamps directly to your GrindTrack streak heatmap.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 shrink-0 mt-0.5">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Contest & Rank Badges</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Showcase global rank percentiles and contest ratings on your shareable resume card.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2">
          <MotionButton
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            Got It
          </MotionButton>
        </div>
      </div>
    </Modal>
  );
}
