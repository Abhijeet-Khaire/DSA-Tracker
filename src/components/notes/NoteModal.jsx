import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import HighlightedMarkdown from './HighlightedMarkdown';
import { NOTE_CATEGORIES, HIGHLIGHT_COLORS } from '../../lib/curatedNotes';
import { 
  Pin, 
  Code2, 
  Eye, 
  Edit3, 
  Tag, 
  Sparkles, 
  X, 
  Bold, 
  Code, 
  Quote, 
  Highlighter,
  Check
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

const PROGRAMMING_LANGS = [
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
];

export default function NoteModal({ isOpen, onClose, onSave, initialNote = null }) {
  const prefersReduced = isReducedMotionPreferred();
  const textareaRef = useRef(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Patterns');
  const [accentColor, setAccentColor] = useState('cyan');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [mode, setMode] = useState('write'); // 'write' | 'preview'
  const [error, setError] = useState('');

  // Hydrate modal form if editing an existing note
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMode('write');
      if (initialNote) {
        setTitle(initialNote.title || '');
        setCategory(initialNote.category || 'Patterns');
        setAccentColor(initialNote.accentColor || 'cyan');
        setContent(initialNote.content || '');
        setTags(initialNote.tags || []);
        setIsPinned(!!initialNote.isPinned);
        setCodeSnippet(initialNote.codeSnippet || '');
        setLanguage(initialNote.language || 'cpp');
        setShowCodeSnippet(!!initialNote.codeSnippet);
      } else {
        setTitle('');
        setCategory('Patterns');
        setAccentColor('cyan');
        setContent('');
        setTags([]);
        setIsPinned(false);
        setCodeSnippet('');
        setLanguage('cpp');
        setShowCodeSnippet(false);
      }
    }
  }, [isOpen, initialNote]);

  // Wrap selected text inside textarea with highlight tags
  const applyHighlightColor = (colorId) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `==${colorId}:${selectedText}==`;
    } else {
      replacement = `==${colorId}:highlighted text==`;
    }

    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + (selectedText ? replacement.length : 2 + colorId.length + 1),
        start + replacement.length - 2
      );
    }, 10);
  };

  // Quick formatting insert (Bold, Code, Quote)
  const applyFormatting = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let prefix = '';
    let suffix = '';
    let fallback = '';

    if (type === 'bold') {
      prefix = '**';
      suffix = '**';
      fallback = 'bold text';
    } else if (type === 'code') {
      prefix = '`';
      suffix = '`';
      fallback = 'code';
    } else if (type === 'quote') {
      prefix = '> ';
      suffix = '';
      fallback = 'key concept or note';
    }

    const replacement = prefix + (selectedText || fallback) + suffix;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      const cursorEnd = start + replacement.length;
      textarea.setSelectionRange(cursorEnd, cursorEnd);
    }, 10);
  };

  // Add tag chip on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a note title.');
      return;
    }
    if (!content.trim() && !codeSnippet.trim()) {
      setError('Please provide some note content or code template.');
      return;
    }

    const notePayload = {
      id: initialNote?.id || `note-${Date.now()}`,
      title: title.trim(),
      category,
      accentColor,
      tags,
      content: content.trim(),
      codeSnippet: showCodeSnippet ? codeSnippet.trim() : '',
      language: showCodeSnippet ? language : 'cpp',
      isPinned,
      updatedAt: new Date().toISOString(),
      ...(initialNote ? {} : { createdAt: new Date().toISOString() }),
    };

    onSave(notePayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialNote ? 'Edit Pattern Note' : 'Create Note / Cheatsheet'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Title & Pin Header */}
        <div className="flex gap-2.5 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Note Title (e.g. Sliding Window Invariants, Monotonic Stack Template)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPinned
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={isPinned ? 'Pinned to top' : 'Pin note to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>
        </div>

        {/* Category & Accent Color Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            >
              {NOTE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2 py-1">
              {HIGHLIGHT_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setAccentColor(col.id)}
                  className={`w-6 h-6 rounded-full ${col.colorClass} transition-all flex items-center justify-center cursor-pointer ${
                    accentColor === col.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={`${col.name} Accent`}
                >
                  {accentColor === col.id && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Tabs: Write vs. Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMode('write')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'write'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'preview'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>

            {/* Markdown shortcuts */}
            {mode === 'write' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyFormatting('bold')}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Bold (**text**)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('code')}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Inline Code (`code`)"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('quote')}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Blockquote (> text)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Multi-Color Highlighter Toolbar */}
          {mode === 'write' && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mr-1">
                <Highlighter className="w-3.5 h-3.5 text-cyan-400" /> Highlight Selection:
              </span>
              {HIGHLIGHT_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => applyHighlightColor(col.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${col.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${col.colorClass}`} />
                  {col.name}
                </button>
              ))}
            </div>
          )}

          {/* Editor Area or Preview */}
          {mode === 'write' ? (
            <div className="space-y-1">
              <textarea
                ref={textareaRef}
                rows={7}
                placeholder="Write your study notes, time complexity breakdown, or algorithm intuition here... Use the color buttons above to highlight key phrases."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-all resize-y placeholder:text-slate-600"
              />
              <span className="text-[10px] text-slate-500 block">
                Tip: Select any word or phrase and click a highlight color button above.
              </span>
            </div>
          ) : (
            <div className="min-h-[160px] max-h-[320px] overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
              {content ? (
                <HighlightedMarkdown content={content} />
              ) : (
                <p className="text-xs text-slate-500 italic">No note content to preview yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Code Snippet Accordion */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCodeSnippet(!showCodeSnippet)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Code2 className="w-4 h-4" />
              <span>{showCodeSnippet ? 'Hide Code Template' : '+ Attach Code Template / Solution Snippet'}</span>
            </button>

            {showCodeSnippet && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono cursor-pointer"
              >
                {PROGRAMMING_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <AnimatePresence>
            {showCodeSnippet && (
              <motion.div
                initial={prefersReduced ? undefined : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                <textarea
                  rows={6}
                  placeholder={`// Enter reusable ${language.toUpperCase()} template or algorithm snippet here...`}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-all resize-y"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags Row */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Tags (press Enter or comma to add)
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 min-h-[42px] items-center">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-cyan-300 border border-slate-700/60 text-[11px] font-medium flex items-center gap-1 shrink-0"
              >
                <Tag className="w-3 h-3 text-cyan-400" />
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="hover:text-rose-400 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? "e.g. Sliding Window, Invariants, O(N)" : "Add more..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 bg-transparent border-none text-slate-200 text-xs focus:outline-none min-w-[120px] px-1 font-mono placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <MotionButton
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {initialNote ? 'Save Note Changes' : 'Create Note'}
          </MotionButton>
        </div>
      </form>
    </Modal>
  );
}
