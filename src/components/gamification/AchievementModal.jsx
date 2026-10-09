import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import BadgeDrawable from '../shared/BadgeDrawable';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import { isReducedMotionPreferred, SPRING_BOUNCY } from '../../animations/motionConfig';
import { Award, Sparkles } from 'lucide-react';

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
    <Modal isOpen={!!achievement} onClose={onClose} title="Achievement Unlocked!" maxWidth="max-w-md">
      <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
        {/* Animated Vector Badge Drawable */}
        <motion.div
          initial={prefersReduced ? undefined : { scale: 0.5, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={SPRING_BOUNCY}
          className="my-2"
        >
          <BadgeDrawable 
            drawable={achievement.drawable} 
            isUnlocked={true} 
            badgeColor={achievement.badgeColor} 
            size="xl" 
          />
        </motion.div>

        <div>
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
            {achievement.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">{achievement.description}</p>
        </div>

        <motion.div 
          initial={prefersReduced ? undefined : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 text-xs font-extrabold flex items-center gap-1.5"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>+{achievement.xpReward} XP Reward Claimed!</span>
        </motion.div>

        <MotionButton
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20"
        >
          Continue Grind
        </MotionButton>
      </div>
    </Modal>
  );
}
