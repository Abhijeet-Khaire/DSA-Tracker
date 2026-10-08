import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import LottieWrapper from '../shared/LottieWrapper';
import FocusTimerModal from '../dashboard/FocusTimerModal';
import CommandPalette from '../shared/CommandPalette';
import AnimatedCounter from '../motion/AnimatedCounter';
import MotionButton from '../motion/MotionButton';
import { Sun, Moon, LogOut, Search, Timer, Sparkles } from 'lucide-react';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

export default function Navbar() {
  const { currentUser, isDemoMode, logout } = useAuth();
  const { xp, levelInfo, calculateStreak } = useData();
  const { theme, toggleTheme } = useTheme();

  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const streak = calculateStreak();
  const prefersReduced = isReducedMotionPreferred();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left: Command Palette trigger & Demo badge */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => setIsCommandOpen(true)}
          whileHover={prefersReduced ? undefined : { scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.4)' }}
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Search or Cmd + K...</span>
        </motion.button>

        {isDemoMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Mode Active</span>
          </motion.div>
        )}
      </div>

      {/* Right: Timer, Streak, Level, Theme & User */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Focus Timer Button with micro-rotation */}
        <motion.button
          onClick={() => setIsTimerOpen(true)}
          whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: -8 }}
          whileTap={prefersReduced ? undefined : { scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          title="Mock Interview & Focus Timer"
          aria-label="Open Focus Timer"
        >
          <Timer className="w-5 h-5 text-cyan-400" />
        </motion.button>

        {/* Active Streak with animated count */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { scale: 1.04, y: -1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm cursor-default"
        >
          <LottieWrapper type="flame" className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-amber-400 tracking-tight leading-none">
              <AnimatedCounter value={streak} suffix=" Days" />
            </span>
            <span className="text-[9px] text-slate-400 font-medium uppercase leading-tight">Streak</span>
          </div>
        </motion.div>

        {/* Level & XP Widget with animated counter & progress */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800"
        >
          <motion.div 
            key={levelInfo.level}
            initial={false}
            animate={{ scale: 1 }}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${levelInfo.badgeColor} shadow-md shrink-0`}
          >
            Lvl {levelInfo.level}
          </motion.div>
          <div className="flex flex-col w-36 sm:w-44">
            <div className="flex justify-between items-center text-[10px] mb-1 gap-2">
              <span className="font-semibold text-slate-200 truncate">{levelInfo.title}</span>
              <span className="text-cyan-400 font-bold whitespace-nowrap shrink-0">
                <AnimatedCounter value={levelInfo.currentXp} suffix=" XP" />
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                initial={false}
                animate={{ width: `${levelInfo.progressPercent}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* Theme Toggle with smooth spinning rotation and scale flip */}
        <motion.button
          onClick={toggleTheme}
          whileHover={prefersReduced ? undefined : { scale: 1.1 }}
          whileTap={prefersReduced ? undefined : { scale: 0.9, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={prefersReduced ? undefined : { opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-cyan-400" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* User Profile / Logout */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <motion.img
              whileHover={prefersReduced ? undefined : { scale: 1.08 }}
              src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt="Avatar"
              className="w-8 h-8 rounded-xl object-cover border border-cyan-500/40"
            />
            <motion.button
              onClick={logout}
              whileHover={prefersReduced ? undefined : { scale: 1.1 }}
              whileTap={prefersReduced ? undefined : { scale: 0.92 }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Focus Timer Modal */}
      <FocusTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </header>
  );
}
