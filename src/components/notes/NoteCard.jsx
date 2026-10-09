import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HighlightedMarkdown from './HighlightedMarkdown';
import { 
  Pin, 
  Code2, 
  Edit3, 
  Trash2, 
  Tag, 
  Copy, 
  Check, 
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

const ACCENT_STYLES = {
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    dot: 'bg-cyan-400',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dot: 'bg-purple-400',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    glow: 'shadow-amber-500/10 hover:shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dot: 'bg-amber-400',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-500/60',
    glow: 'shadow-rose-500/10 hover:shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dot: 'bg-rose-400',
  },
};

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  const prefersReduced = isReducedMotionPreferred();
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const style = ACCENT_STYLES[note.accentColor] || ACCENT_STYLES.cyan;

  const handleCopySnippet = (e) => {
    e.stopPropagation();
    if (!note.codeSnippet) return;
    navigator.clipboard.writeText(note.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formattedDate = note.updatedAt || note.createdAt
    ? format(new Date(note.updatedAt || note.createdAt), 'MMM d, yyyy')
    : '';

  return (
    <motion.div
      layout
      transition={SPRING_SMOOTH}
      className={`relative p-5 rounded-2xl glass-panel bg-slate-900/60 border ${style.border} ${style.glow} shadow-lg transition-all duration-300 flex flex-col justify-between group`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${style.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {note.category || 'General'}
            </span>

            {note.isCurated && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Curated
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(note.id)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  note.isPinned
                    ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit note"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && !note.isCurated && (
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2.5">
          {note.title}
        </h3>

        {/* Markdown Content with Multi-Color Highlights */}
        <div className="text-xs text-slate-300 leading-relaxed mb-4 max-h-[280px] overflow-y-auto pr-1">
          <HighlightedMarkdown content={note.content} />
        </div>

        {/* Code Snippet Drawer */}
        {note.codeSnippet && (
          <div className="mb-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden">
            <div
              onClick={() => setShowCode(!showCode)}
              className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 cursor-pointer select-none text-[11px] font-mono text-cyan-400 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span className="uppercase font-semibold">{note.language || 'cpp'} Template</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
                {showCode ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            <AnimatePresence>
              {showCode && (
                <motion.pre
                  initial={prefersReduced ? undefined : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[220px]"
                >
                  <code>{note.codeSnippet}</code>
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Footer: Tags & Date */}
      <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
        <div className="flex flex-wrap items-center gap-1">
          {Array.isArray(note.tags) && note.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-md bg-slate-800/70 text-slate-400 border border-slate-700/50 font-mono text-[10px]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1 text-slate-500 font-mono shrink-0 ml-auto">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
