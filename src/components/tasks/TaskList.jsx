import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import TaskForm from './TaskForm';
import LottieWrapper from '../shared/LottieWrapper';
import MotionButton from '../motion/MotionButton';
import AnimatedCheckmark from '../motion/AnimatedCheckmark';
import { Plus, Trash2, Repeat } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

export default function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask } = useData();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const prefersReduced = isReducedMotionPreferred();

  const filteredTasks = tasks.filter((t) => {
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && t.status === 'pending') || 
                          (statusFilter === 'done' && t.status === 'done');
    return matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="DSA">DSA</option>
            <option value="System Design">System Design</option>
            <option value="Projects">Projects</option>
            <option value="Fitness">Fitness</option>
            <option value="Reading">Reading</option>
            <option value="Misc">Misc</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="done">Completed</option>
          </select>
        </div>

        {/* Add Habit/Task Button with rotating plus icon */}
        <motion.button
          onClick={() => setIsFormOpen(true)}
          whileHover={prefersReduced ? undefined : { scale: 1.03, y: -1 }}
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          className="group px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-end sm:self-auto cursor-pointer"
        >
          <motion.div
            whileHover={prefersReduced ? undefined : { rotate: 90 }}
            transition={SPRING_TACTILE}
          >
            <Plus className="w-4 h-4 transition-transform" />
          </motion.div>
          <span>Add Task</span>
        </motion.button>
      </div>

      {/* Task List with AnimatePresence */}
      {filteredTasks.length === 0 ? (
        <motion.div 
          initial={prefersReduced ? undefined : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 glass-panel rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center"
        >
          <LottieWrapper type="target" className="w-24 h-24 mb-3" />
          <h4 className="text-base font-bold text-slate-200">No Tasks Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            No items match your selected filters. Create a new task to stay productive!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <motion.div
                  key={task.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96, y: -6 }}
                  whileHover={prefersReduced ? undefined : { y: -2 }}
                  transition={SPRING_SMOOTH}
                  className={`p-4 rounded-2xl glass-panel border flex items-center justify-between gap-4 transition-colors duration-200 ${
                    isDone 
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-75' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left check & info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <motion.button
                      onClick={() => toggleTask(task.id)}
                      whileTap={prefersReduced ? undefined : { scale: 0.85 }}
                      transition={SPRING_TACTILE}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/30'
                          : 'border-slate-600 hover:border-cyan-400 bg-slate-950'
                      }`}
                      aria-label={`Toggle task ${task.title}`}
                    >
                      <AnimatedCheckmark checked={isDone} size={14} color="#ffffff" strokeWidth={3.5} />
                    </motion.button>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm font-semibold truncate transition-all duration-200 ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 text-[10px] font-bold border border-slate-800">
                          {task.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'High'
                              ? 'text-rose-400 bg-rose-500/10'
                              : task.priority === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        {task.recurring && task.recurring !== 'none' && (
                          <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-medium">
                            <Repeat className="w-3 h-3" /> {task.recurring}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete button — subtle, non-playful */}
                  <motion.button
                    onClick={() => deleteTask(task.id)}
                    whileHover={prefersReduced ? undefined : { scale: 1.08 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                    title="Delete Task"
                    aria-label="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addTask}
      />
    </div>
  );
}
