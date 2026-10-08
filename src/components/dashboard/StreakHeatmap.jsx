import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { format, subDays } from 'date-fns';
import LottieWrapper from '../shared/LottieWrapper';
import AnimatedCounter from '../motion/AnimatedCounter';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function StreakHeatmap() {
  const { dailyLogs, calculateStreak } = useData();
  const streak = calculateStreak();
  const prefersReduced = isReducedMotionPreferred();

  // Generate days array for past 90 days
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = dailyLogs[dateStr] || { problemsSolved: 0, tasksCompleted: 0, activeDay: false };
    const score = (log.problemsSolved * 2) + log.tasksCompleted;

    let intensity = 0;
    if (score >= 5) intensity = 4;
    else if (score >= 3) intensity = 3;
    else if (score >= 2) intensity = 2;
    else if (score >= 1) intensity = 1;

    days.push({
      dateStr,
      displayDate: format(d, 'MMM d, yyyy'),
      log,
      intensity,
    });
  }

  // Color intensities with subtle glow
  const cellColors = [
    'bg-slate-900/90 border-slate-800/80',
    'bg-cyan-950/80 border-cyan-800/40 text-cyan-400 hover:border-cyan-500/50',
    'bg-cyan-700/60 border-cyan-500/50 shadow-sm shadow-cyan-500/20 hover:border-cyan-400',
    'bg-cyan-500 border-cyan-400 shadow-md shadow-cyan-500/30 hover:border-white',
    'bg-gradient-to-tr from-cyan-400 to-purple-500 border-cyan-300 shadow-lg shadow-purple-500/40 hover:scale-125',
  ];

  return (
    <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={prefersReduced ? undefined : { scale: 1.15, rotate: 6 }}
            transition={SPRING_SMOOTH}
          >
            <LottieWrapper type="flame" className="w-8 h-8" />
          </motion.div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 tracking-wide font-sans">
              90-Day Consistency Grid
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Every active day builds muscle memory and reinforces long-term recall
            </p>
          </div>
        </div>

        <motion.div 
          whileHover={prefersReduced ? undefined : { scale: 1.03 }}
          className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto cursor-default"
        >
          <span className="text-xs font-semibold text-slate-400">Current Streak:</span>
          <span className="text-sm font-extrabold text-amber-400">
            <AnimatedCounter value={streak} suffix=" Days 🔥" />
          </span>
        </motion.div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-sm border ${cellColors[day.intensity]} heatmap-cell cursor-pointer relative group transition-all duration-150`}
            >
              {/* Tooltip with smooth fade-in */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none transition-opacity duration-200">
                <div className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] font-medium rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                  <div className="font-bold text-cyan-400">{day.displayDate}</div>
                  <div>Problems Solved: {day.log.problemsSolved}</div>
                  <div>Tasks Completed: {day.log.tasksCompleted}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-4">
        <span>Less</span>
        {cellColors.map((colorClass, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm border ${colorClass}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
