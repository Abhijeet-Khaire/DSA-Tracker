import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { getRevisionStatus } from '../../lib/revisionEngine';
import MotionButton from '../motion/MotionButton';
import AnimatedCheckmark from '../motion/AnimatedCheckmark';
import { CheckCircle2, RotateCw, ExternalLink, ArrowRight, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import LottieWrapper from '../shared/LottieWrapper';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

export default function TodayPanel() {
  const { problems, tasks, completeRevision, toggleTask } = useData();
  const prefersReduced = isReducedMotionPreferred();
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'done'

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter due revisions
  const dueRevisions = problems.filter(
    (p) => p.status === 'solved' && p.revisionDate && p.revisionDate <= todayStr
  );

  // Filter tasks
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const displayedTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'done') return t.status === 'done';
    return true; // 'all'
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Due DSA Revisions Section */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={prefersReduced ? undefined : { rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="p-2 rounded-xl bg-rose-500/20 text-rose-400 cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  DSA Revisions Due Today
                </h3>
                <p className="text-xs text-slate-400">Spaced repetition queue for long-term recall</p>
              </div>
            </div>
            <Link
              to="/dsa"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {dueRevisions.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <LottieWrapper type="target" className="w-20 h-20 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">All caught up on revisions!</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                No algorithm problems are scheduled for revision today. Great job staying ahead!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {dueRevisions.map((problem) => {
                  const revStatus = getRevisionStatus(problem.revisionDate);
                  return (
                    <motion.div
                      key={problem.id}
                      layout={!prefersReduced}
                      initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
                      whileHover={prefersReduced ? undefined : { y: -2 }}
                      transition={SPRING_SMOOTH}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-100">{problem.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              problem.difficulty === 'Easy'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : problem.difficulty === 'Medium'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="font-mono text-[11px] text-cyan-400">{problem.platform}</span>
                          <span>&bull;</span>
                          <span>Rev #{problem.revisionCount || 0}</span>
                          <span>&bull;</span>
                          <span className={revStatus.color}>{revStatus.label}</span>
                        </div>
                      </div>

                      <MotionButton
                        onClick={() => completeRevision(problem.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors"
                      >
                        Mark Revised
                      </MotionButton>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  Today's Tasks & Habits
                </h3>
                <p className="text-xs text-slate-400">
                  {doneTasks.length} of {tasks.length} tasks completed
                </p>
              </div>
            </div>

            {/* Quick Filter Tabs & Link */}
            <div className="flex items-center gap-2">
              <LayoutGroup id="todayTaskFilterNav">
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] relative">
                  {[
                    { id: 'all', label: `All (${tasks.length})` },
                    { id: 'pending', label: `Pending (${pendingTasks.length})` },
                    { id: 'done', label: `Done (${doneTasks.length})` },
                  ].map((tab) => {
                    const isActive = taskFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTaskFilter(tab.id)}
                        className={`relative px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer select-none ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId={prefersReduced ? undefined : "todayTaskFilterActivePill"}
                            transition={SPRING_SMOOTH}
                            className="absolute inset-0 rounded-lg bg-cyan-500 shadow-sm shadow-cyan-500/30"
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>

              <Link
                to="/tasks"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group shrink-0 ml-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <LottieWrapper type="target" className="w-20 h-20 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">
                {taskFilter === 'pending'
                  ? 'All tasks completed for today!'
                  : taskFilter === 'done'
                  ? 'No completed tasks yet today.'
                  : 'No tasks scheduled.'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {taskFilter === 'pending'
                  ? 'Great momentum! You can uncheck tasks anytime or add more from the Tasks tab.'
                  : 'Check off your daily habits to earn XP and build your streak!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {displayedTasks.map((task) => {
                  const isDone = task.status === 'done';
                  return (
                    <motion.div
                      key={task.id}
                      layout={!prefersReduced}
                      initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
                      whileHover={prefersReduced ? undefined : { y: -2 }}
                      transition={SPRING_SMOOTH}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <motion.button
                          onClick={() => toggleTask(task.id)}
                          whileTap={prefersReduced ? undefined : { scale: 0.85 }}
                          transition={SPRING_TACTILE}
                          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/30'
                              : 'border-slate-600 hover:border-cyan-400 bg-slate-950'
                          }`}
                          title={isDone ? "Uncheck task" : "Mark as done"}
                          aria-label={`Toggle task ${task.title}`}
                        >
                          <AnimatedCheckmark checked={isDone} size={14} color="#ffffff" strokeWidth={3.5} />
                        </motion.button>
                        <div>
                          <h4
                            className={`text-sm font-semibold transition-all ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-medium text-[10px]">
                              {task.category}
                            </span>
                            <span className="text-[11px]">Priority: {task.priority}</span>
                            {isDone && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
