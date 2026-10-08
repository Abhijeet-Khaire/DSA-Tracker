import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { getRevisionStatus } from '../../lib/revisionEngine';
import MotionButton from '../motion/MotionButton';
import AnimatedCheckmark from '../motion/AnimatedCheckmark';
import { CheckCircle2, RotateCw, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LottieWrapper from '../shared/LottieWrapper';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function TodayPanel() {
  const { problems, tasks, completeRevision, toggleTask } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter due revisions
  const dueRevisions = problems.filter(
    (p) => p.status === 'solved' && p.revisionDate && p.revisionDate <= todayStr
  );

  // Filter pending tasks
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

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
                Great job maintaining your recall memory. Solve new problems to populate your schedule!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {dueRevisions.map((prob) => {
                  const statusInfo = getRevisionStatus(prob.revisionDate);
                  return (
                    <motion.div
                      key={prob.id}
                      layout={!prefersReduced}
                      initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
                      whileHover={prefersReduced ? undefined : { y: -2 }}
                      transition={SPRING_SMOOTH}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col gap-1 pr-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100 hover:text-cyan-400 transition-colors truncate">
                            {prob.title}
                          </span>
                          {prob.url && (
                            <a
                              href={prob.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-cyan-400 shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-slate-400">• {prob.platform}</span>
                          <span className="text-slate-400">• Revision #{prob.revisionCount + 1}</span>
                        </div>
                      </div>

                      <MotionButton
                        onClick={() => completeRevision(prob.id)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  Today's Pending Tasks
                </h3>
                <p className="text-xs text-slate-400">Daily habits and priority action items</p>
              </div>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <LottieWrapper type="target" className="w-20 h-20 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">No pending tasks for today!</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                You've completed all scheduled tasks. Add new tasks from the Tasks tab!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout={!prefersReduced}
                    initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
                    whileHover={prefersReduced ? undefined : { y: -2 }}
                    transition={SPRING_SMOOTH}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <motion.button
                        onClick={() => toggleTask(task.id)}
                        whileTap={prefersReduced ? undefined : { scale: 0.85 }}
                        className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-600 hover:border-cyan-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Mark as done"
                        aria-label={`Mark task ${task.title} as done`}
                      >
                        <AnimatedCheckmark checked={false} size={14} color="#06b6d4" />
                      </motion.button>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-medium">
                            {task.category}
                          </span>
                          <span>Priority: {task.priority}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
