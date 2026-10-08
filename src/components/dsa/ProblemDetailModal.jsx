import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import { ExternalLink, RotateCw, Copy, Check, Code2 } from 'lucide-react';
import { getRevisionStatus } from '../../lib/revisionEngine';
import { isReducedMotionPreferred, SPRING_TACTILE } from '../../animations/motionConfig';

export default function ProblemDetailModal({ isOpen, onClose, problem }) {
  const [copied, setCopied] = useState(false);
  const prefersReduced = isReducedMotionPreferred();

  if (!problem) return null;

  const revisionStatus = problem.revisionDate ? getRevisionStatus(problem.revisionDate) : null;

  const handleCopyNotes = () => {
    if (problem.notes) {
      navigator.clipboard.writeText(problem.notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={problem.title} maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Meta badges header */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.span
            whileHover={prefersReduced ? undefined : { scale: 1.06 }}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-default ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {problem.difficulty}
          </motion.span>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {problem.platform}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              problem.status === 'solved'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : problem.status === 'attempted'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            Status: {problem.status}
          </span>

          {problem.url && (
            <motion.a
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline"
            >
              Open Problem <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          )}
        </div>

        {/* Topics */}
        {problem.topics && problem.topics.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Topics</span>
            <div className="flex flex-wrap gap-1.5">
              {problem.topics.map((t) => (
                <motion.span 
                  key={t} 
                  whileHover={prefersReduced ? undefined : { scale: 1.06 }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-xs border border-slate-800 cursor-default"
                >
                  #{t}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Spaced Repetition Info */}
        {problem.status === 'solved' && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={prefersReduced ? undefined : { rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="p-2 rounded-lg bg-amber-500/20 text-amber-400 cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Revision Schedule</span>
                <span className={`text-sm font-bold ${revisionStatus?.color}`}>
                  {revisionStatus?.label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Revisions Completed</span>
              <span className="text-sm font-extrabold text-cyan-400">{problem.revisionCount || 0} Times</span>
            </div>
          </div>
        )}

        {/* Notes & Solution writeup container */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Code2 className="w-4 h-4 text-cyan-400" /> Solution Approach & Code Notes
            </span>
            {problem.notes && (
              <motion.button
                onClick={handleCopyNotes}
                whileHover={prefersReduced ? undefined : { scale: 1.06 }}
                whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                transition={SPRING_TACTILE}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                aria-label="Copy Notes"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.div
                      key="copied"
                      initial={prefersReduced ? undefined : { scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 text-emerald-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={prefersReduced ? undefined : { scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-white">
            {problem.notes || 'No notes provided for this problem.'}
          </div>
        </div>
      </div>
    </Modal>
  );
}
