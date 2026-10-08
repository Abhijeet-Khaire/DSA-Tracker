import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import LottieWrapper from '../shared/LottieWrapper';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import { isReducedMotionPreferred, SPRING_BOUNCY } from '../../animations/motionConfig';

export default function AchievementModal({ achievement, onClose }) {
  const prefersReduced = isReducedMotionPreferred();

  useEffect(() => {
    if (achievement && !prefersReduced) {
      // Trigger celebratory confetti burst
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'],
      });
    }
  }, [achievement, prefersReduced]);

  if (!achievement) return null;

  return (
    <Modal isOpen={!!achievement} onClose={onClose} title="Achievement Unlocked! 🎉" maxWidth="max-w-md">
      <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
        {/* Animated Trophy */}
        <motion.div
          initial={prefersReduced ? undefined : { scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={SPRING_BOUNCY}
        >
          <LottieWrapper type="trophy" className="w-28 h-28" />
        </motion.div>

        <div>
          <motion.span 
            initial={prefersReduced ? undefined : { scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={SPRING_BOUNCY}
            className="text-3xl mb-1 block select-none"
          >
            {achievement.icon}
          </motion.span>
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
            {achievement.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">{achievement.description}</p>
        </div>

        <motion.div 
          initial={prefersReduced ? undefined : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 text-xs font-extrabold"
        >
          +{achievement.xpReward} XP Reward Claimed!
        </motion.div>

        <MotionButton
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20"
        >
          Keep Grinding 🔥
        </MotionButton>
      </div>
    </Modal>
  );
}
