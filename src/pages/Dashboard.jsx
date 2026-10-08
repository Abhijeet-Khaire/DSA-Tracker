import React from 'react';
import { motion } from 'framer-motion';
import StatsOverview from '../components/dashboard/StatsOverview';
import StreakHeatmap from '../components/dashboard/StreakHeatmap';
import TodayPanel from '../components/dashboard/TodayPanel';
import TopicProgressChart from '../components/dsa/TopicProgressChart';
import DifficultyChart from '../components/dsa/DifficultyChart';
import { Zap, Activity, Sparkles } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';

export default function Dashboard() {
  const prefersReduced = isReducedMotionPreferred();

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner with gentle greeting animation */}
      <motion.div 
        initial={prefersReduced ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_SMOOTH}
        className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-purple-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      >
        {/* Subtle decorative floating glow */}
        {!prefersReduced && (
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" 
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <motion.div
              animate={prefersReduced ? undefined : { rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.2 }}
            >
              <Zap className="w-4 h-4 fill-cyan-400" />
            </motion.div>
            <span>Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight flex items-center gap-2">
            <span>Welcome back to GrindTrack</span>
            <Sparkles className="w-5 h-5 text-amber-400 hidden sm:inline" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Consistency is your secret weapon. Tackle your due revisions and daily tasks to earn XP and level up.
          </p>
        </div>
      </motion.div>

      {/* Top Metrics Cards */}
      <StatsOverview />

      {/* 90-Day Contribution Heatmap */}
      <StreakHeatmap />

      {/* Today's Focus Action Panel */}
      <TodayPanel />

      {/* Quick Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          transition={SPRING_SMOOTH}
          className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Topic Mastery Overview</h3>
          </div>
          <TopicProgressChart />
        </motion.div>

        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          transition={SPRING_SMOOTH}
          className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-100">Difficulty Distribution</h3>
          </div>
          <DifficultyChart />
        </motion.div>
      </div>
    </div>
  );
}
