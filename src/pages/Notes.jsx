import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useData } from '../context/DataContext';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import MotionButton from '../components/motion/MotionButton';
import { CURATED_PATTERN_NOTES, NOTE_CATEGORIES, HIGHLIGHT_COLORS } from '../lib/curatedNotes';
import { 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  Code2, 
  Tag, 
  Highlighter,
  Pin,
  FileText
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, problems } = useData();
  const prefersReduced = isReducedMotionPreferred();

  // Active Main Tab: 'my' | 'curated' | 'problems'
  const [activeTab, setActiveTab] = useState('my');
  
  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAccentColor, setSelectedAccentColor] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Aggregated problem solution notes from DSA problems that have non-empty notes
  const problemNotes = useMemo(() => {
    return problems
      .filter((p) => p.notes && p.notes.trim().length > 0)
      .map((p) => ({
        id: `prob-note-${p.id}`,
        title: `${p.title} (${p.difficulty})`,
        category: p.topic || 'Problems',
        accentColor: p.difficulty === 'Hard' ? 'rose' : p.difficulty === 'Medium' ? 'amber' : 'emerald',
        tags: [p.topic, p.platform || 'LeetCode', p.difficulty].filter(Boolean),
        content: p.notes,
        codeSnippet: '',
        isPinned: false,
        isFromProblem: true,
        problemId: p.id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || p.createdAt,
      }));
  }, [problems]);

  // Active dataset based on tab
  const currentDataset = useMemo(() => {
    if (activeTab === 'curated') {
      return CURATED_PATTERN_NOTES;
    }
    if (activeTab === 'problems') {
      return problemNotes;
    }
    return notes;
  }, [activeTab, notes, problemNotes]);

  // Filtered notes based on search query, category, and accent color
  const filteredNotes = useMemo(() => {
    return currentDataset.filter((n) => {
      // Category filter
      if (selectedCategory !== 'All' && n.category !== selectedCategory) {
        return false;
      }

      // Color filter
      if (selectedAccentColor !== 'All' && n.accentColor !== selectedAccentColor) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchContent = n.content?.toLowerCase().includes(q);
      const matchCode = n.codeSnippet?.toLowerCase().includes(q);
      const matchTags = Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchContent || matchCode || matchTags;
    });
  }, [currentDataset, selectedCategory, selectedAccentColor, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (noteData) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote(noteData);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
            <motion.div
              whileHover={prefersReduced ? undefined : { rotate: 12, scale: 1.1 }}
              transition={SPRING_SMOOTH}
              className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 cursor-default border border-cyan-500/30"
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
            Notes & Pattern Cheatsheets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic patterns, revision notes, and code templates with multi-color highlighting.
          </p>
        </div>

        <MotionButton
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Note
        </MotionButton>
      </div>

      {/* Tabs navigation: My Notes | Interview Patterns | Problem Notes */}
      <LayoutGroup id="notesTabs">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'my', label: 'My Notes', count: notes.length, icon: FileText },
            { id: 'curated', label: 'Interview Patterns', count: CURATED_PATTERN_NOTES.length, icon: Sparkles },
            { id: 'problems', label: 'Problem Notes Feed', count: problemNotes.length, icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={prefersReduced ? undefined : "activeNotesTab"}
                    transition={SPRING_SMOOTH}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md -z-10"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes by title, syntax, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Color Accent Filter Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Highlighter className="w-3 h-3 text-cyan-400" /> Color:
            </span>
            <button
              onClick={() => setSelectedAccentColor('All')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedAccentColor === 'All'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedAccentColor(selectedAccentColor === col.id ? 'All' : col.id)}
                className={`w-5 h-5 rounded-full ${col.colorClass} transition-all cursor-pointer flex items-center justify-center ${
                  selectedAccentColor === col.id
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title={`Filter by ${col.name}`}
              />
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800/80">
          <Filter className="w-3 h-3 text-slate-500 shrink-0 mr-1" />
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={!note.isCurated && !note.isFromProblem ? handleEditNote : null}
              onDelete={!note.isCurated && !note.isFromProblem ? deleteNote : null}
              onTogglePin={!note.isCurated && !note.isFromProblem ? togglePinNote : null}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-3xl glass-panel bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {searchQuery || selectedCategory !== 'All' || selectedAccentColor !== 'All'
                ? 'No matching notes found'
                : activeTab === 'my'
                ? 'No custom notes created yet'
                : 'No notes available'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {searchQuery || selectedCategory !== 'All' || selectedAccentColor !== 'All'
                ? 'Try broadening your search query or resetting active filters.'
                : 'Document pattern intuitions, time complexity reminders, and reusable templates with multi-color highlighting.'}
            </p>
          </div>

          {activeTab === 'my' && !searchQuery && selectedCategory === 'All' && (
            <MotionButton
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Your First Note
            </MotionButton>
          )}
        </motion.div>
      )}

      {/* Note Creation / Editing Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />
    </div>
  );
}
