import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { format, subDays, startOfWeek, addDays, isSameDay, isToday, isFuture, getMonth, getDay } from 'date-fns';
import { Link } from 'react-router-dom';
import LottieWrapper from '../shared/LottieWrapper';
import AnimatedCounter from '../motion/AnimatedCounter';
import { 
  Flame, 
  Zap, 
  Calendar, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

const TIME_RANGES = [
  { id: 30, label: '30 Days' },
  { id: 90, label: '90 Days' },
  { id: 180, label: '6 Months' },
  { id: 365, label: '1 Year' },
];

const FILTER_TYPES = [
  { id: 'all', label: 'All Activity' },
  { id: 'problems', label: 'DSA Solved' },
  { id: 'tasks', label: 'Tasks Done' },
];

export default function StreakHeatmap() {
  const { dailyLogs, calculateStreak, xp } = useData();
  const streak = calculateStreak();
  const prefersReduced = isReducedMotionPreferred();

  const [selectedRange, setSelectedRange] = useState(90);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [pinnedDay, setPinnedDay] = useState(null);

  const today = useMemo(() => new Date(), []);

  // Compute Longest Historical Streak from dailyLogs
  const longestStreak = useMemo(() => {
    let max = 0;
    let curr = 0;
    for (let i = 365; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];
      if (log && log.activeDay && (log.problemsSolved > 0 || log.tasksCompleted > 0)) {
        curr++;
        if (curr > max) max = curr;
      } else {
        curr = 0;
      }
    }
    return Math.max(max, streak);
  }, [dailyLogs, streak, today]);

  // Generate calendar columns & weeks aligned by Sunday-Saturday
  const { weeks, monthHeaders, totalActive, totalSolved, totalTasks, consistencyRate } = useMemo(() => {
    const startDate = subDays(today, selectedRange - 1);
    // Align start of first column to Sunday
    const calendarStart = startOfWeek(startDate, { weekStartsOn: 0 });

    const weeksList = [];
    const months = [];
    let currentWeek = [];
    let weekIndex = 0;
    let lastMonth = -1;

    let activeCount = 0;
    let solvedCount = 0;
    let tasksCount = 0;
    let totalEligibleDays = 0;

    // Walk from calendarStart until today's week is complete (up to Saturday)
    let iter = new Date(calendarStart);
    while (iter <= today || currentWeek.length > 0) {
      const dateStr = format(iter, 'yyyy-MM-dd');
      const isPastOrToday = iter <= today;
      const isTodayDate = isSameDay(iter, today);
      const isBeforeSelected = iter < startDate;

      const log = dailyLogs[dateStr] || { problemsSolved: 0, tasksCompleted: 0, activeDay: false };
      
      // Calculate activity score depending on active filter
      let score = 0;
      if (activeFilter === 'problems') {
        score = log.problemsSolved * 2;
      } else if (activeFilter === 'tasks') {
        score = log.tasksCompleted * 2;
      } else {
        score = (log.problemsSolved * 2) + log.tasksCompleted;
      }

      let intensity = 0;
      if (score >= 6) intensity = 4;
      else if (score >= 4) intensity = 3;
      else if (score >= 2) intensity = 2;
      else if (score >= 1) intensity = 1;

      const dayObj = {
        date: new Date(iter),
        dateStr,
        displayDate: format(iter, 'EEEE, MMM d, yyyy'),
        dayOfWeek: getDay(iter),
        isToday: isTodayDate,
        isFuture: iter > today,
        isBeforeSelected,
        log,
        score,
        intensity,
        isActive: isPastOrToday && !isBeforeSelected && (log.problemsSolved > 0 || log.tasksCompleted > 0),
      };

      if (isPastOrToday && !isBeforeSelected) {
        totalEligibleDays++;
        if (dayObj.isActive) activeCount++;
        solvedCount += log.problemsSolved || 0;
        tasksCount += log.tasksCompleted || 0;
      }

      currentWeek.push(dayObj);

      // Check month header marker on Sunday of the week
      if (currentWeek.length === 1 && isPastOrToday) {
        const m = getMonth(iter);
        if (m !== lastMonth) {
          months.push({ weekIndex, monthName: format(iter, 'MMM') });
          lastMonth = m;
        }
      }

      // 7 days complete a column
      if (currentWeek.length === 7) {
        weeksList.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      // If we passed today and finished Saturday, stop
      if (iter > today && currentWeek.length === 0) {
        break;
      }

      iter = addDays(iter, 1);
    }

    if (currentWeek.length > 0) {
      // pad rest of the week
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(iter),
          dateStr: format(iter, 'yyyy-MM-dd'),
          displayDate: format(iter, 'MMM d, yyyy'),
          dayOfWeek: getDay(iter),
          isToday: false,
          isFuture: true,
          isBeforeSelected: false,
          log: { problemsSolved: 0, tasksCompleted: 0 },
          intensity: 0,
          isActive: false,
        });
        iter = addDays(iter, 1);
      }
      weeksList.push(currentWeek);
    }

    const rate = totalEligibleDays > 0 ? Math.round((activeCount / totalEligibleDays) * 100) : 0;

    return {
      weeks: weeksList,
      monthHeaders: months,
      totalActive: activeCount,
      totalSolved: solvedCount,
      totalTasks: tasksCount,
      consistencyRate: rate,
    };
  }, [selectedRange, activeFilter, dailyLogs, today]);

  // Color intensities styling for modern neon cyber palette
  const getCellClasses = (day) => {
    if (day.isFuture) {
      return 'bg-slate-950/40 border-slate-900/60 opacity-30 cursor-not-allowed';
    }
    if (day.intensity === 0) {
      return 'bg-slate-900/80 border-slate-800/80 hover:border-slate-600 hover:bg-slate-800/80';
    }
    if (day.intensity === 1) {
      return 'bg-cyan-950/90 border-cyan-800/80 shadow-[0_0_8px_rgba(6,182,212,0.18)] hover:border-cyan-500 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]';
    }
    if (day.intensity === 2) {
      return 'bg-cyan-700/80 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.35)] hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.6)]';
    }
    if (day.intensity === 3) {
      return 'bg-cyan-400 border-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.55)] hover:border-white hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]';
    }
    return 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 border-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_24px_rgba(168,85,247,0.9)]';
  };

  // Inspect day detail
  const activeDetailDay = pinnedDay || hoveredDay || {
    dateStr: format(today, 'yyyy-MM-dd'),
    displayDate: format(today, 'EEEE, MMM d, yyyy'),
    isToday: true,
    log: dailyLogs[format(today, 'yyyy-MM-dd')] || { problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, activeDay: false },
    score: 0,
    intensity: 0,
    isActive: false,
  };

  return (
    <motion.div 
      initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_SMOOTH}
      className="p-6 sm:p-7 rounded-3xl glass-panel bg-slate-900/70 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Decorative ambient backdrop glow */}
      {!prefersReduced && (
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      )}

      {/* TOP HEADER: Title, Range Selectors & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={prefersReduced ? undefined : { scale: 1.12, rotate: 8 }}
            transition={SPRING_TACTILE}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10"
          >
            <LottieWrapper type="flame" className="w-7 h-7" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-100 tracking-tight font-sans flex items-center gap-2">
                <span>Consistency & Mastery Heatmap</span>
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Visual proof of your daily coding habits, problem solving cadence, and spaced repetition.
            </p>
          </div>
        </div>

        {/* Action Controls: Range Selector + Filter Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Time Range Pills */}
          <LayoutGroup id="heatmapRangeNav">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {TIME_RANGES.map((rng) => {
                const isSelected = selectedRange === rng.id;
                return (
                  <button
                    key={rng.id}
                    onClick={() => setSelectedRange(rng.id)}
                    className={`relative px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId={prefersReduced ? undefined : "heatmapRangeActivePill"}
                        transition={SPRING_SMOOTH}
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/25"
                      />
                    )}
                    <span className="relative z-10">{rng.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          {/* Activity Category Filters */}
          <LayoutGroup id="heatmapFilterNav">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {FILTER_TYPES.map((filt) => {
                const isActive = activeFilter === filt.id;
                return (
                  <button
                    key={filt.id}
                    onClick={() => setActiveFilter(filt.id)}
                    className={`relative px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      isActive
                        ? 'text-cyan-300'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId={prefersReduced ? undefined : "heatmapFilterActivePill"}
                        transition={SPRING_SMOOTH}
                        className="absolute inset-0 rounded-lg bg-slate-800 border border-cyan-500/30 shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{filt.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* KPI METRIC STRIP: Instant visual consistency feedback */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {/* Streak Metric with Animated Fire Glow */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 relative overflow-hidden shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-black text-amber-400 tracking-tight">
              <AnimatedCounter value={streak} />
            </span>
            <span className="text-xs font-extrabold text-amber-400">Days Active 🔥</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Personal Record: <span className="text-slate-300 font-bold">{longestStreak} Days</span>
          </div>
        </motion.div>

        {/* Consistency Rate */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consistency Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-cyan-400 tracking-tight">
              <AnimatedCounter value={consistencyRate} suffix="%" />
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            <span className="text-cyan-300 font-bold">{totalActive}</span> of {selectedRange} days logged
          </div>
        </motion.div>

        {/* Problems Solved in Window */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/20 shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Problems Solved</span>
            <Target className="w-4 h-4 text-purple-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-purple-400 tracking-tight">
              <AnimatedCounter value={totalSolved} />
            </span>
            <span className="text-xs font-extrabold text-slate-400">Questions</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Avg {selectedRange > 0 ? (totalSolved / (selectedRange / 7)).toFixed(1) : 0} per week
          </div>
        </motion.div>

        {/* Daily Tasks / Habits Completed */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { y: -2 }}
          className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks & Habits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              <AnimatedCounter value={totalTasks} />
            </span>
            <span className="text-xs font-extrabold text-slate-400">Done</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Spaced reviews & daily checklist
          </div>
        </motion.div>
      </div>

      {/* MAIN HEATMAP CALENDAR GRID */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 overflow-x-auto relative z-10">
        <div className="inline-block min-w-full">
          {/* Month labels header */}
          <div className="flex text-[11px] font-bold text-slate-400 mb-2 pl-8">
            <div className="relative w-full h-4">
              {monthHeaders.map((m, mIdx) => (
                <span
                  key={mIdx}
                  className="absolute font-mono text-[10px] uppercase text-cyan-400 font-extrabold tracking-wider"
                  style={{ left: `${m.weekIndex * 19}px` }}
                >
                  {m.monthName}
                </span>
              ))}
            </div>
          </div>

          {/* Grid Layout: Day labels on left + Weekly Columns */}
          <div className="flex items-start gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between h-[112px] text-[10px] font-mono text-slate-500 font-bold pr-1 select-none pt-0.5">
              <span className="h-3.5 flex items-center">Sun</span>
              <span className="h-3.5 flex items-center text-slate-400">Tue</span>
              <span className="h-3.5 flex items-center">Thu</span>
              <span className="h-3.5 flex items-center text-slate-400">Sat</span>
            </div>

            {/* Weekly columns of 7 days */}
            <div className="flex items-center gap-[5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[5px]">
                  {week.map((day, dIdx) => {
                    const isSelected = activeDetailDay?.dateStr === day.dateStr;
                    return (
                      <motion.div
                        key={dIdx}
                        whileHover={day.isFuture ? undefined : (prefersReduced ? undefined : { scale: 1.45, zIndex: 40 })}
                        whileTap={day.isFuture ? undefined : { scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => !day.isFuture && setPinnedDay(day)}
                        className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-150 relative cursor-pointer ${getCellClasses(day)} ${
                          isSelected ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950 scale-110 z-20' : ''
                        } ${
                          day.isToday ? 'ring-1 ring-cyan-400 animate-pulse' : ''
                        }`}
                        title={`${day.displayDate}: ${day.log.problemsSolved} Solved, ${day.log.tasksCompleted} Tasks`}
                      >
                        {/* Little pulsing glowing beacon dot for today */}
                        {day.isToday && (
                          <span className="absolute inset-0 rounded-[3px] bg-cyan-400/30 animate-ping pointer-events-none" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Activity Legend:</span>
            <span className="text-[11px]">Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-[2px] bg-slate-900 border border-slate-800" title="0 Actions" />
              <div className="w-3 h-3 rounded-[2px] bg-cyan-950 border border-cyan-800 shadow-sm" title="1-2 Actions" />
              <div className="w-3 h-3 rounded-[2px] bg-cyan-700 border border-cyan-500 shadow-sm" title="3-4 Actions" />
              <div className="w-3 h-3 rounded-[2px] bg-cyan-400 border border-cyan-200 shadow-sm" title="5-6 Actions" />
              <div className="w-3 h-3 rounded-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 border border-purple-200 shadow-md" title="7+ Actions (Peak Day)" />
            </div>
            <span className="text-[11px]">More</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>Click any square to inspect that day's log</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DAY INSPECTOR CARD: Instant breakdown of highlighted or clicked day */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDetailDay?.dateStr || 'none'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
              activeDetailDay.log?.problemsSolved > 0 || activeDetailDay.log?.tasksCompleted > 0
                ? 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              {activeDetailDay.log?.problemsSolved > 0 ? (
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              ) : activeDetailDay.log?.tasksCompleted > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Calendar className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-100">
                  {activeDetailDay.displayDate}
                </span>
                {activeDetailDay.isToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    TODAY
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-semibold">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>{activeDetailDay.log?.problemsSolved || 0} Problems Solved</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeDetailDay.log?.tasksCompleted || 0} Tasks Done</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{activeDetailDay.log?.xpEarned || 0} XP</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/dsa"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Practice DSA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
