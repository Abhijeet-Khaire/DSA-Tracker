import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { getRevisionStatus } from '../../lib/revisionEngine';
import ProblemForm from './ProblemForm';
import ProblemDetailModal from './ProblemDetailModal';
import LottieWrapper from '../shared/LottieWrapper';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Eye,
  Code2
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

export default function ProblemList() {
  const { problems, addProblem, updateProblem, deleteProblem } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [inspectProblem, setInspectProblem] = useState(null);
  const prefersReduced = isReducedMotionPreferred();

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesDiff;
  });

  const handleFormSubmit = (data) => {
    if (editingProblem) {
      updateProblem(editingProblem.id, data);
    } else {
      addProblem(data);
    }
    setEditingProblem(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input with smooth focus */}
        <div className="relative w-full md:w-80 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search problems or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Add Problem Button with Code icon micro-movement */}
          <motion.button
            onClick={() => {
              setEditingProblem(null);
              setIsFormOpen(true);
            }}
            whileHover={prefersReduced ? undefined : { scale: 1.03, y: -1 }}
            whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            className="group px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <motion.div
              whileHover={prefersReduced ? undefined : { x: 2, y: -2 }}
              transition={SPRING_TACTILE}
            >
              <Code2 className="w-4 h-4" />
            </motion.div>
            <span>Add Problem</span>
          </motion.button>
        </div>
      </div>

      {/* Problem Cards with AnimatePresence */}
      {filteredProblems.length === 0 ? (
        <motion.div 
          initial={prefersReduced ? undefined : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 glass-panel rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center"
        >
          <LottieWrapper type="target" className="w-24 h-24 mb-3" />
          <h4 className="text-base font-bold text-slate-200">No Problems Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Try adjusting your search query or filters, or add a new DSA problem to your tracker!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {filteredProblems.map((prob) => {
              return (
                <motion.div
                  key={prob.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
                  whileHover={prefersReduced ? undefined : { y: -2 }}
                  transition={SPRING_SMOOTH}
                  className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        onClick={() => setInspectProblem(prob)}
                        className="text-base font-bold text-slate-100 hover:text-cyan-400 cursor-pointer transition-colors truncate"
                      >
                        {prob.title}
                      </span>

                      {prob.url && (
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-cyan-400 shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Difficulty Badge with subtle hover */}
                      <motion.span
                        whileHover={prefersReduced ? undefined : { scale: 1.08 }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-default ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : prob.difficulty === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {prob.difficulty}
                      </motion.span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {prob.platform}
                      </span>
                    </div>

                    {/* Topics Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {prob.topics?.map((t) => (
                        <span key={t} className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {/* Status badge / selector */}
                    <select
                      value={prob.status}
                      onChange={(e) => updateProblem(prob.id, { status: e.target.value })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                        prob.status === 'solved'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : prob.status === 'attempted'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <option value="todo">To Do</option>
                      <option value="attempted">Attempted</option>
                      <option value="solved">Solved</option>
                    </select>

                    {/* Action Buttons with subtle spring */}
                    <motion.button
                      onClick={() => setInspectProblem(prob)}
                      whileHover={prefersReduced ? undefined : { scale: 1.1 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Inspect Notes"
                      aria-label="Inspect Notes"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setEditingProblem(prob);
                        setIsFormOpen(true);
                      }}
                      whileHover={prefersReduced ? undefined : { scale: 1.1 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Edit Problem"
                      aria-label="Edit Problem"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => deleteProblem(prob.id)}
                      whileHover={prefersReduced ? undefined : { scale: 1.1 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete Problem"
                      aria-label="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <ProblemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProblem}
      />

      {/* Detail Inspection Modal */}
      <ProblemDetailModal
        isOpen={!!inspectProblem}
        onClose={() => setInspectProblem(null)}
        problem={inspectProblem}
      />
    </div>
  );
}
