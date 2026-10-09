import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useData } from '../context/DataContext';
import { ACHIEVEMENTS } from '../lib/xpEngine';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';

export default function Achievements() {
  const { unlockedAchievements } = useData();
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const prefersReduced = isReducedMotionPreferred();

  const displayedAchievements = ACHIEVEMENTS.filter((ach) => {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header and Filter Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
            <motion.div 
              whileHover={prefersReduced ? undefined : { rotate: 12, scale: 1.1 }}
              className="p-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-default"
            >
              <Trophy className="w-6 h-6" />
            </motion.div>
            Achievements & Badges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Unlock badges as you solve problems, maintain streaks, and complete daily tasks!
          </p>
        </div>

        {/* Segmented Filter Navbar with Sliding Pill */}
        <LayoutGroup id="achievementsFilterNav">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs shrink-0 self-start sm:self-auto">
            {[
              { id: 'all', label: `All (${ACHIEVEMENTS.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedAchievements.length})` },
              { id: 'locked', label: `Locked (${Math.max(0, ACHIEVEMENTS.length - unlockedAchievements.length)})` },
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer select-none ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId={prefersReduced ? undefined : "achievementFilterActivePill"}
                      transition={SPRING_SMOOTH}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/30"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Grid of achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedAchievements.map((ach) => {
          const isUnlocked = unlockedAchievements.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              whileHover={prefersReduced ? undefined : { y: -3, scale: 1.015 }}
              transition={SPRING_SMOOTH}
              className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between cursor-default group transition-colors ${
                isUnlocked
                  ? 'bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-500/10 hover:border-amber-400/60'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <motion.span 
                    whileHover={prefersReduced ? undefined : { scale: 1.25, rotate: 6 }}
                    className="text-3xl select-none inline-block"
                  >
                    {ach.icon}
                  </motion.span>
                  {isUnlocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-extrabold ${isUnlocked ? 'text-amber-300' : 'text-slate-200'}`}>
                  {ach.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Reward:</span>
                <span className="font-extrabold text-cyan-400">+{ach.xpReward} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
