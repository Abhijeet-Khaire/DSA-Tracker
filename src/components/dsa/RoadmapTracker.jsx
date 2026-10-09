import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { CURATED_ROADMAPS } from '../../lib/curatedRoadmaps';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import MotionButton from '../motion/MotionButton';
import { 
  BookMarked, 
  CheckCircle2, 
  Circle, 
  Plus, 
  ExternalLink, 
  Youtube, 
  Terminal, 
  Layers, 
  CheckSquare, 
  Calendar,
  Cloud,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

export default function RoadmapTracker() {
  const { problems, addProblem, addTask, addXp, roadmapProgress, saveRoadmapProgress } = useData();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReduced = isReducedMotionPreferred();

  const initialRoadmap = searchParams.get('roadmap') || 'aws-devops-30';
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(initialRoadmap);
  const [selectedWeek, setSelectedWeek] = useState('all'); // 'all' | 1 | 2 | 3 | 4
  const [searchFilter, setSearchFilter] = useState('');

  const completedItems = roadmapProgress?.[selectedRoadmapId] || [];

  const activeRoadmap = CURATED_ROADMAPS.find((r) => r.id === selectedRoadmapId) || CURATED_ROADMAPS[0];

  const handleSelectRoadmap = (id) => {
    setSelectedRoadmapId(id);
    setSelectedWeek('all');
    setSearchParams({ roadmap: id });
  };

  // Helper to check if user already has this problem title in problems list
  const getExistingProblem = (title) => {
    return problems.find((p) => p.title.toLowerCase() === title.toLowerCase());
  };

  // Check if item is marked completed (either directly or via solved problem)
  const isItemCompleted = (item, idx) => {
    const key = item.day ? `day-${item.day}` : item.title || `item-${idx}`;
    if (completedItems.includes(key)) return true;
    const match = getExistingProblem(item.title);
    return match && match.status === 'solved';
  };

  const toggleItemCompletion = (item, idx) => {
    const key = item.day ? `day-${item.day}` : item.title || `item-${idx}`;
    let next;
    if (completedItems.includes(key)) {
      next = completedItems.filter((k) => k !== key);
    } else {
      next = [...completedItems, key];
      addXp(50, `Roadmap: ${item.title}`);
    }
    saveRoadmapProgress(selectedRoadmapId, next);
  };

  // Compute total roadmap progress
  const totalCount = activeRoadmap.problems.length;
  const solvedCount = activeRoadmap.problems.filter((p, idx) => isItemCompleted(p, idx)).length;
  const progressPercent = Math.round((solvedCount / totalCount) * 100) || 0;

  // Add day item to problem queue
  const handleAddProblemToQueue = (prob) => {
    addProblem({
      title: prob.title,
      platform: prob.platform || (activeRoadmap.id === 'aws-devops-30' ? 'AWS DevOps' : 'LeetCode'),
      url: prob.url || '',
      difficulty: prob.difficulty || 'Medium',
      topics: prob.topics || [prob.category],
      status: 'todo',
      notes: prob.description || `Curated from ${activeRoadmap.title} (${prob.category}).`,
      timeSpentMin: 0,
    });
  };

  // Add day item to daily tasks board
  const handleAddTask = (prob) => {
    addTask({
      title: `${prob.title}: ${prob.description?.slice(0, 70) || prob.category}...`,
      category: activeRoadmap.id === 'aws-devops-30' ? 'DevOps' : 'DSA',
      priority: prob.difficulty === 'Hard' ? 'high' : 'medium',
      dueDate: new Date().toISOString().split('T')[0],
    });
  };

  // Filter problems by week and search
  const filteredItems = activeRoadmap.problems.filter((item) => {
    const matchesWeek = selectedWeek === 'all' || item.week === Number(selectedWeek);
    const matchesSearch =
      !searchFilter ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.topics?.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase())) ||
      item.description?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesWeek && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Roadmap Selector Cards / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CURATED_ROADMAPS.map((roadmap) => {
          const isSelected = roadmap.id === selectedRoadmapId;
          const isDevOps = roadmap.id === 'aws-devops-30';

          return (
            <motion.div
              key={roadmap.id}
              onClick={() => handleSelectRoadmap(roadmap.id)}
              whileHover={prefersReduced ? undefined : { y: -2 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isDevOps && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" /> Hands-On
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`p-1.5 rounded-lg text-xs ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isDevOps ? <Cloud className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {roadmap.category || 'Study Plan'}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 line-clamp-1">
                  {roadmap.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {roadmap.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{roadmap.problems.length} Modules / Days</span>
                <span className={isSelected ? 'text-cyan-400 font-bold' : ''}>
                  {isSelected ? 'Active Track ✓' : 'Select Track →'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Header Info & Progress Dashboard */}
      <motion.div
        key={activeRoadmap.id}
        initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl glass-panel bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BookMarked className="w-4 h-4" />
            <span>Curated Curriculum • {activeRoadmap.duration || `${activeRoadmap.problems.length} Lessons`}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 font-sans tracking-tight flex items-center gap-2 flex-wrap">
            {activeRoadmap.title}
            {activeRoadmap.badge && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-normal">
                {activeRoadmap.badge}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">{activeRoadmap.description}</p>
        </div>

        {/* Progress Gauge */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[240px] shrink-0 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">Total Completion</span>
            <span className="text-cyan-400 font-mono">
              {solvedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
            <span>{totalCount - solvedCount} Remaining</span>
            <span>+50 XP per day</span>
          </div>
        </div>
      </motion.div>

      {/* Week Filters for 30-Day Roadmaps */}
      {activeRoadmap.weeks && (
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button
            onClick={() => setSelectedWeek('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedWeek === 'all'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All 30 Days
          </button>
          {activeRoadmap.weeks.map((week) => {
            const isSelected = selectedWeek === week.weekNumber;
            return (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{week.icon}</span>
                <span>Week {week.weekNumber}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Roadmap Items / Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => {
          const completed = isItemCompleted(item, idx);
          const existing = getExistingProblem(item.title);
          const isAdded = !!existing;

          return (
            <motion.div
              key={item.day || item.title || idx}
              whileHover={prefersReduced ? undefined : { y: -2 }}
              transition={SPRING_SMOOTH}
              className={`p-5 rounded-2xl glass-panel border flex flex-col justify-between gap-4 transition-colors ${
                completed
                  ? 'bg-slate-950/50 border-emerald-500/40 opacity-90'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top: Badges, Day, Title */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {item.day && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-extrabold">
                        Day {item.day < 10 ? `0${item.day}` : item.day}
                      </span>
                    )}
                    {item.week && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        Week {item.week}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.difficulty === 'Easy'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : item.difficulty === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {item.difficulty || 'Medium'}
                    </span>
                  </div>

                  {/* Complete Checkbox Toggle */}
                  <button
                    onClick={() => toggleItemCompletion(item, idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Hands-On Tasks Checklist */}
                {item.tasks && item.tasks.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Hands-On Milestones
                    </span>
                    {item.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2">
                        <span className="text-cyan-400 text-xs mt-0.5">•</span>
                        <span className="text-slate-300 leading-tight">{task}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Commands Cheat Sheet if present */}
                {item.commands && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase mb-1">
                      <Terminal className="w-3 h-3 text-cyan-400" /> Terminal Commands:
                    </div>
                    <code className="text-slate-200 break-words">{item.commands}</code>
                  </div>
                )}
              </div>

              {/* Card Footer: Topics & Quick Action Buttons */}
              <div className="pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* External links */}
                <div className="flex items-center gap-2 flex-wrap">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-cyan-400" /> Docs / Guide
                    </a>
                  )}
                  {item.tutorialUrl && (
                    <a
                      href={item.tutorialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      <Youtube className="w-3 h-3 text-rose-400" /> Video
                    </a>
                  )}
                  <span className="text-[11px] text-slate-400">• {item.category}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <motion.button
                    onClick={() => handleAddTask(item)}
                    whileHover={prefersReduced ? undefined : { scale: 1.04 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-purple-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add to Daily Tasks"
                  >
                    <CheckSquare className="w-3 h-3 text-purple-400" /> Add Task
                  </motion.button>

                  {!isAdded ? (
                    <motion.button
                      onClick={() => handleAddProblemToQueue(item)}
                      whileHover={prefersReduced ? undefined : { scale: 1.04 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-cyan-400" /> Add to Queue
                    </motion.button>
                  ) : (
                    <span className="text-[11px] font-mono text-cyan-400/80 px-2">
                      In Queue ✓
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
