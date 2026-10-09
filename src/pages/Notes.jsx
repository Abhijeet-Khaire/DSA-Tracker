import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useData } from '../context/DataContext';
import MacNotesEditor, { normalizeContentToHtml } from '../components/notes/MacNotesEditor';
import MotionButton from '../components/motion/MotionButton';
import { CURATED_PATTERN_NOTES, NOTE_CATEGORIES, HIGHLIGHT_COLORS } from '../lib/curatedNotes';
import { 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Code2, 
  Pin, 
  FileText, 
  Trash2, 
  Copy, 
  Calendar, 
  ChevronLeft,
  Tag,
  AlertTriangle,
  HelpCircle,
  Keyboard,
  Highlighter,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

const PROGRAMMING_LANGS = [
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
];

function getPreviewSnippet(content) {
  if (!content) return 'No additional text';
  return content
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/==([a-zA-Z]+:)?/g, '')
    .replace(/==/g, '')
    .replace(/```[a-z]*[\s\S]*?```/g, '[Code Template]')
    .replace(/[#*`>_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 95);
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, problems } = useData();

  // Active Main Folder: 'my' | 'curated' | 'problems'
  const [activeFolder, setActiveFolder] = useState('my');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState('Saved');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Pop-ups states
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAddTagPopover, setShowAddTagPopover] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const titleInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Aggregated problem solution notes from solved DSA problems
  const problemNotes = useMemo(() => {
    return problems
      .filter((p) => p.notes && p.notes.trim().length > 0)
      .map((p) => ({
        id: `prob-note-${p.id}`,
        title: `${p.title} (${p.difficulty})`,
        category: p.topic || 'Problems',
        accentColor: p.difficulty === 'Hard' ? 'pink' : p.difficulty === 'Medium' ? 'yellow' : 'green',
        tags: [p.topic, p.platform || 'LeetCode', p.difficulty].filter(Boolean),
        content: normalizeContentToHtml(p.notes),
        codeSnippet: '',
        isPinned: false,
        isFromProblem: true,
        problemId: p.id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || p.createdAt,
      }));
  }, [problems]);

  // Current folder's notes
  const folderNotes = useMemo(() => {
    if (activeFolder === 'curated') return CURATED_PATTERN_NOTES;
    if (activeFolder === 'problems') return problemNotes;
    return notes;
  }, [activeFolder, notes, problemNotes]);

  // Filtered notes by search & category
  const filteredNotes = useMemo(() => {
    return folderNotes.filter((n) => {
      if (selectedCategory !== 'All' && n.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchContent = n.content?.toLowerCase().includes(q);
      const matchCode = n.codeSnippet?.toLowerCase().includes(q);
      const matchTags = Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchContent || matchCode || matchTags;
    });
  }, [folderNotes, selectedCategory, searchQuery]);

  // Active selected note object
  const activeNote = useMemo(() => {
    if (!selectedNoteId) return filteredNotes[0] || null;
    return folderNotes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;
  }, [selectedNoteId, folderNotes, filteredNotes]);

  // Auto-select first note when folder changes or list refreshes
  useEffect(() => {
    if (!selectedNoteId && filteredNotes.length > 0) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, selectedNoteId]);

  // Keyboard shortcut: Cmd+N / Ctrl+N to create a note
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFolder]);

  // Create a brand new note macOS-style (immediately in-place)
  const handleCreateNewNote = async () => {
    setActiveFolder('my');
    const newId = `note-${Date.now()}`;
    const newNote = {
      id: newId,
      title: 'New Note',
      category: 'Patterns',
      accentColor: 'cyan',
      tags: [],
      content: '<p><br></p>',
      codeSnippet: '',
      language: 'cpp',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addNote(newNote);
    setSelectedNoteId(newId);
    setIsMobileListVisible(false);

    // Auto focus title input
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 60);
  };

  // Real-time auto-save updater for custom user notes
  const handleUpdateActiveField = (field, value) => {
    if (!activeNote || activeNote.isCurated || activeNote.isFromProblem) return;

    setSaveIndicator('Saving...');
    updateNote(activeNote.id, { [field]: value });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveIndicator('Saved');
    }, 600);
  };

  // Tag management
  const handleAddTag = (e) => {
    e?.preventDefault();
    if (!activeNote || !newTagInput.trim()) return;
    const currentTags = Array.isArray(activeNote.tags) ? activeNote.tags : [];
    const formatted = newTagInput.trim().replace(/^#/, '');
    if (!currentTags.includes(formatted)) {
      handleUpdateActiveField('tags', [...currentTags, formatted]);
    }
    setNewTagInput('');
    setShowAddTagPopover(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    if (!activeNote) return;
    const currentTags = Array.isArray(activeNote.tags) ? activeNote.tags : [];
    handleUpdateActiveField('tags', currentTags.filter((t) => t !== tagToRemove));
  };

  // Duplicate a curated note into My Notes for personal editing
  const handleDuplicateCuratedNote = async (curatedNote) => {
    const copyId = `note-${Date.now()}`;
    const duplicate = {
      ...curatedNote,
      id: copyId,
      title: `${curatedNote.title} (Custom)`,
      content: normalizeContentToHtml(curatedNote.content),
      isCurated: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNote(duplicate);
    setActiveFolder('my');
    setSelectedNoteId(copyId);
  };

  // Delete current active note with custom pop-up modal
  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    await deleteNote(noteToDelete.id);
    setNoteToDelete(null);
    setSelectedNoteId(null);
  };

  const handleCopySnippet = () => {
    if (!activeNote?.codeSnippet) return;
    navigator.clipboard.writeText(activeNote.codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Separate pinned and regular notes
  const pinnedNotesList = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotesList = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-3 pb-2 max-w-7xl mx-auto overflow-hidden">
      {/* Top macOS App Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              Notes
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-medium">
                {notes.length} custom
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">macOS-style WYSIWYG editor with smooth sliding & pop-up tools</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Help & Shortcuts Pop-up trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors cursor-pointer"
            title="Notes Shortcuts & Highlighter Tips"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Folder Switcher Pills: My Notes | Interview Patterns | Problem Notes with smooth sliding pill */}
          <LayoutGroup id="notesFolderTabs">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md relative">
              <button
                onClick={() => { setActiveFolder('my'); setIsMobileListVisible(true); }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer z-10 ${
                  activeFolder === 'my' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeFolder === 'my' && (
                  <motion.div
                    layoutId="activeFolderPill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <FileText className="w-3.5 h-3.5" />
                <span>My Notes</span>
                <span className="text-[10px] opacity-80 font-mono">({notes.length})</span>
              </button>

              <button
                onClick={() => { setActiveFolder('curated'); setIsMobileListVisible(true); }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer z-10 ${
                  activeFolder === 'curated' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeFolder === 'curated' && (
                  <motion.div
                    layoutId="activeFolderPill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interview Patterns</span>
                <span className="text-[10px] opacity-80 font-mono">({CURATED_PATTERN_NOTES.length})</span>
              </button>

              <button
                onClick={() => { setActiveFolder('problems'); setIsMobileListVisible(true); }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer z-10 ${
                  activeFolder === 'problems' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeFolder === 'problems' && (
                  <motion.div
                    layoutId="activeFolderPill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Code2 className="w-3.5 h-3.5" />
                <span>Problem Notes</span>
                <span className="text-[10px] opacity-80 font-mono">({problemNotes.length})</span>
              </button>
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Main Split-Pane macOS Interface */}
      <div className="flex-1 flex rounded-2xl glass-panel bg-slate-900/60 border border-slate-800/90 overflow-hidden shadow-2xl relative">
        {/* ================= LEFT PANE: Notes List Explorer ================= */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800/80 bg-slate-950/60 shrink-0 h-full ${
          !isMobileListVisible ? 'hidden md:flex' : 'flex'
        }`}>
          {/* List Search & New Note Header */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {activeFolder === 'my' && (
                <button
                  onClick={handleCreateNewNote}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
                  title="New Note (⌘N)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Note List with Smooth Sliding Active Indicator */}
          <LayoutGroup id="notesListGroup">
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
              {/* Pinned section */}
              {pinnedNotesList.length > 0 && (
                <div className="space-y-1 pb-2">
                  <div className="px-2.5 pt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-400 fill-amber-400" /> Pinned
                  </div>
                  {pinnedNotesList.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      isSelected={activeNote?.id === note.id}
                      onSelect={() => {
                        setSelectedNoteId(note.id);
                        setIsMobileListVisible(false);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* All / Other Notes section */}
              {otherNotesList.length > 0 ? (
                <div className="space-y-1 pt-1.5">
                  {pinnedNotesList.length > 0 && (
                    <div className="px-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Notes
                    </div>
                  )}
                  {otherNotesList.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      isSelected={activeNote?.id === note.id}
                      onSelect={() => {
                        setSelectedNoteId(note.id);
                        setIsMobileListVisible(false);
                      }}
                    />
                  ))}
                </div>
              ) : pinnedNotesList.length === 0 ? (
                <div className="py-12 text-center px-4 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">No notes in this view</p>
                  {activeFolder === 'my' && (
                    <button
                      onClick={handleCreateNewNote}
                      className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Create a note now
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </LayoutGroup>
        </div>

        {/* ================= RIGHT PANE: macOS WYSIWYG Workspace ================= */}
        <div className={`flex-1 flex flex-col bg-slate-900/40 h-full overflow-hidden ${
          isMobileListVisible ? 'hidden md:flex' : 'flex'
        }`}>
          {activeNote ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNote.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Note Header Meta Bar */}
                <div className="px-6 pt-3 pb-2.5 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMobileListVisible(true)}
                      className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Category Selector */}
                    {!activeNote.isCurated && !activeNote.isFromProblem ? (
                      <select
                        value={activeNote.category || 'Patterns'}
                        onChange={(e) => handleUpdateActiveField('category', e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        {NOTE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
                        {activeNote.isCurated ? <Sparkles className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
                        {activeNote.category}
                      </span>
                    )}

                    {/* Note Accent Color Dot Selector */}
                    {!activeNote.isCurated && !activeNote.isFromProblem && (
                      <div className="flex items-center gap-1 ml-1">
                        {HIGHLIGHT_COLORS.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => handleUpdateActiveField('accentColor', col.id)}
                            className={`w-3.5 h-3.5 rounded-full ${col.colorClass} transition-all cursor-pointer ${
                              activeNote.accentColor === col.id ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100'
                            }`}
                            title={`${col.name} Accent`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Autosave indicator, Pin, Duplicate, Delete */}
                  <div className="flex items-center gap-1.5">
                    {!activeNote.isCurated && !activeNote.isFromProblem && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mr-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${saveIndicator === 'Saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        <span>{saveIndicator}</span>
                      </div>
                    )}

                    {/* Pin Toggle */}
                    {!activeNote.isCurated && !activeNote.isFromProblem && (
                      <button
                        onClick={() => togglePinNote(activeNote.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          activeNote.isPinned
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                        title={activeNote.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${activeNote.isPinned ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {/* Curated Duplicate Button */}
                    {activeNote.isCurated && (
                      <MotionButton
                        onClick={() => handleDuplicateCuratedNote(activeNote)}
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Duplicate & Edit
                      </MotionButton>
                    )}

                    {/* Custom Pop-up Delete Trigger */}
                    {!activeNote.isCurated && !activeNote.isFromProblem && (
                      <button
                        onClick={() => setNoteToDelete(activeNote)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title, Date & Tag Chips Section */}
                <div className="px-6 pt-3 pb-2 shrink-0 space-y-2">
                  {!activeNote.isCurated && !activeNote.isFromProblem ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      placeholder="Title..."
                      value={activeNote.title || ''}
                      onChange={(e) => handleUpdateActiveField('title', e.target.value)}
                      className="w-full bg-transparent text-xl font-extrabold text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors border-b border-transparent focus:border-cyan-500/40 pb-1"
                    />
                  ) : (
                    <h2 className="text-xl font-extrabold text-slate-100">
                      {activeNote.title}
                    </h2>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {activeNote.updatedAt || activeNote.createdAt
                        ? format(new Date(activeNote.updatedAt || activeNote.createdAt), 'EEEE, MMMM d, yyyy h:mm a')
                        : 'Today'}
                    </span>

                    {/* Tag Badges and Add Tag Popover */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.isArray(activeNote.tags) && activeNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 font-mono group/tag"
                        >
                          <span>#{tag}</span>
                          {!activeNote.isCurated && !activeNote.isFromProblem && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-slate-500 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}

                      {/* Add Tag Popover Trigger */}
                      {!activeNote.isCurated && !activeNote.isFromProblem && (
                        <div className="relative">
                          {showAddTagPopover ? (
                            <form onSubmit={handleAddTag} className="flex items-center gap-1">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Tag name..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-cyan-500/50 text-[10px] text-slate-200 font-mono focus:outline-none w-24"
                              />
                              <button
                                type="submit"
                                className="p-1 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddTagPopover(false)}
                                className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-slate-200"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAddTagPopover(true)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>+ Tag</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* WYSIWYG macOS Notes Editor (Visually highlights text in real-time!) */}
                <div className="flex-1 px-6 py-2 overflow-hidden flex flex-col">
                  <MacNotesEditor
                    content={activeNote.content}
                    onChange={(newHtml) => handleUpdateActiveField('content', newHtml)}
                    readOnly={activeNote.isCurated}
                    placeholder="Start typing your note here... Select text anywhere for instant floating formatting & highlighter pop-up."
                  />
                </div>

                {/* Attached Code Template Drawer with Smooth Accordion Slide */}
                <AnimatePresence>
                  {(showCodeSnippet || activeNote.codeSnippet) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="px-6 pb-3 pt-1 shrink-0 overflow-hidden"
                    >
                      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
                        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-cyan-400">
                          <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5" />
                            <span className="uppercase font-bold">{activeNote.language || 'cpp'} Template</span>
                            {!activeNote.isCurated && (
                              <select
                                value={activeNote.language || 'cpp'}
                                onChange={(e) => handleUpdateActiveField('language', e.target.value)}
                                className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] cursor-pointer border border-slate-700"
                              >
                                {PROGRAMMING_LANGS.map((lang) => (
                                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopySnippet}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> {copiedSnippet ? 'Copied' : 'Copy'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCodeSnippet(false)}
                              className="text-slate-500 hover:text-slate-300"
                              title="Hide template"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {!activeNote.isCurated ? (
                          <textarea
                            rows={5}
                            placeholder={`// Paste reusable ${activeNote.language?.toUpperCase() || 'C++'} template code here...`}
                            value={activeNote.codeSnippet || ''}
                            onChange={(e) => handleUpdateActiveField('codeSnippet', e.target.value)}
                            className="w-full p-3 bg-transparent text-cyan-300 text-xs font-mono leading-relaxed focus:outline-none resize-none"
                          />
                        ) : (
                          <pre className="p-3 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[160px]">
                            <code>{activeNote.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Code Template Toggle Button (if hidden) */}
                {!showCodeSnippet && !activeNote.codeSnippet && !activeNote.isCurated && (
                  <div className="px-6 pb-3 pt-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCodeSnippet(true)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>+ Attach Code Template Snippet</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* macOS Empty Workspace State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-bold text-slate-200">No Note Selected</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a note from the left list to view or edit, or click the button below to create a new one.
                </p>
              </div>
              <MotionButton
                onClick={handleCreateNewNote}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Create New Note
              </MotionButton>
            </div>
          )}
        </div>
      </div>

      {/* ================= POP-UP 1: Delete Confirmation Modal ================= */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 14 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Delete Note?</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                Are you sure you want to delete <span className="font-bold text-white">"{noteToDelete.title}"</span>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-rose-950"
                >
                  Delete Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= POP-UP 2: Notes Tips & Shortcuts Modal ================= */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 14 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">macOS Notes Guide & Shortcuts</h3>
                    <p className="text-xs text-slate-400">Master real-time highlighting & fast workflows</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>Floating Selection Pop-up Menu</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Select any phrase or sentence in your note with your mouse or keyboard. A floating macOS toolbar pops up immediately above your selection with 5 glowing color highlighters and text styling tools.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200">Keyboard Shortcuts:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Create New Note</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">⌘N / Ctrl+N</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Bold Text</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">⌘B / Ctrl+B</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Italic Text</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">⌘I / Ctrl+I</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Underline Text</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">⌘U / Ctrl+U</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated Interview Patterns & Problem Notes</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Switch between your personal notes, top DSA interview patterns (Two Pointers, Sliding Window, Monotonic Stack, Backtracking, Union Find), and notes automatically aggregated from your solved problems.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold cursor-pointer transition-colors"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Single Note Row in macOS List Explorer with Smooth Sliding Pill
function NoteListItem({ note, isSelected, onSelect }) {
  const snippet = getPreviewSnippet(note.content);
  const formattedDate = note.updatedAt || note.createdAt
    ? format(new Date(note.updatedAt || note.createdAt), 'MMM d')
    : 'Recent';

  const dotColor = 
    note.accentColor === 'pink' || note.accentColor === 'rose' ? 'bg-rose-400' :
    note.accentColor === 'yellow' || note.accentColor === 'amber' ? 'bg-amber-400' :
    note.accentColor === 'green' || note.accentColor === 'emerald' ? 'bg-emerald-400' :
    note.accentColor === 'purple' ? 'bg-purple-400' : 'bg-cyan-400';

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl transition-all cursor-pointer select-none space-y-1 relative group ${
        isSelected ? 'text-white' : 'hover:bg-slate-900/80 text-slate-300'
      }`}
    >
      {/* Smooth sliding pill indicator between active notes */}
      {isSelected && (
        <motion.div
          layoutId="activeNotePill"
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-transparent border border-cyan-500/50 rounded-xl shadow-sm -z-0"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-200' : 'text-slate-200 group-hover:text-slate-100'}`}>
            {note.title || 'Untitled Note'}
          </h4>
        </div>
        {note.isPinned && (
          <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
        )}
      </div>

      <div className="relative z-10 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="font-mono text-slate-400 shrink-0">{formattedDate}</span>
        <span className="truncate text-slate-400 text-[11px] leading-tight flex-1">
          {snippet}
        </span>
      </div>

      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <div className="relative z-10 flex items-center gap-1 pt-0.5 overflow-hidden">
          {note.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
              #{t}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-[9px] text-slate-500 font-mono">+{note.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
