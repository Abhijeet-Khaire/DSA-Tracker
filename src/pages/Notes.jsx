import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import HighlightedMarkdown from '../components/notes/HighlightedMarkdown';
import MotionButton from '../components/motion/MotionButton';
import { CURATED_PATTERN_NOTES, NOTE_CATEGORIES, HIGHLIGHT_COLORS } from '../lib/curatedNotes';
import { 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Code2, 
  Tag, 
  Highlighter,
  Pin,
  FileText,
  Trash2,
  Edit3,
  Eye,
  Check,
  ChevronLeft,
  Bold,
  Code,
  Quote,
  Copy,
  FolderOpen,
  Calendar,
  ExternalLink,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';

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
    .replace(/==([a-zA-Z]+:)?/g, '')
    .replace(/==/g, '')
    .replace(/```[a-z]*[\s\S]*?```/g, '[Code Template]')
    .replace(/[#*`>_]/g, '')
    .trim()
    .slice(0, 95);
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, problems } = useData();
  const prefersReduced = isReducedMotionPreferred();

  // Active Main Folder: 'my' | 'curated' | 'problems'
  const [activeFolder, setActiveFolder] = useState('my');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // View mode in editor: 'write' | 'preview'
  const [editorMode, setEditorMode] = useState('write');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState('Saved');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  const textareaRef = useRef(null);
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
      content: '',
      codeSnippet: '',
      language: 'cpp',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addNote(newNote);
    setSelectedNoteId(newId);
    setEditorMode('write');
    setIsMobileListVisible(false);

    // Auto focus title input
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 50);
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

  // Multi-color highlight wrapper tool
  const applyHighlightColor = (colorId) => {
    if (!activeNote || activeNote.isCurated || activeNote.isFromProblem) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content || '';
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `==${colorId}:${selectedText}==`;
    } else {
      replacement = `==${colorId}:highlighted text==`;
    }

    const nextContent = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateActiveField('content', nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + (selectedText ? replacement.length : 2 + colorId.length + 1),
        start + replacement.length - 2
      );
    }, 10);
  };

  // Quick formatting tool (Bold, Code, Quote)
  const applyFormatting = (type) => {
    if (!activeNote || activeNote.isCurated || activeNote.isFromProblem) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content || '';
    const selectedText = text.substring(start, end);

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
      fallback = 'key takeaway';
    }

    const replacement = prefix + (selectedText || fallback) + suffix;
    const nextContent = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateActiveField('content', nextContent);

    setTimeout(() => {
      textarea.focus();
      const cursorEnd = start + replacement.length;
      textarea.setSelectionRange(cursorEnd, cursorEnd);
    }, 10);
  };

  // Duplicate a curated note into My Notes for personal editing
  const handleDuplicateCuratedNote = async (curatedNote) => {
    const copyId = `note-${Date.now()}`;
    const duplicate = {
      ...curatedNote,
      id: copyId,
      title: `${curatedNote.title} (Custom)`,
      isCurated: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNote(duplicate);
    setActiveFolder('my');
    setSelectedNoteId(copyId);
    setEditorMode('write');
  };

  // Delete current active note
  const handleDeleteActiveNote = async () => {
    if (!activeNote || activeNote.isCurated || activeNote.isFromProblem) return;
    if (window.confirm(`Delete note "${activeNote.title}"?`)) {
      await deleteNote(activeNote.id);
      setSelectedNoteId(null);
    }
  };

  // Separate pinned and regular notes
  const pinnedNotesList = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotesList = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-3 pb-2 max-w-7xl mx-auto overflow-hidden">
      {/* Top macOS App Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              Notes
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-medium">
                {notes.length} total
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">macOS-style fast note taking & pattern revision</p>
          </div>
        </div>

        {/* Folder Switcher Pills: My Notes | Interview Patterns | Problem Notes */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => { setActiveFolder('my'); setIsMobileListVisible(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFolder === 'my'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Notes</span>
            <span className="text-[10px] opacity-80">({notes.length})</span>
          </button>

          <button
            onClick={() => { setActiveFolder('curated'); setIsMobileListVisible(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFolder === 'curated'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interview Patterns</span>
            <span className="text-[10px] opacity-80">({CURATED_PATTERN_NOTES.length})</span>
          </button>

          <button
            onClick={() => { setActiveFolder('problems'); setIsMobileListVisible(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFolder === 'problems'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Problem Notes</span>
            <span className="text-[10px] opacity-80">({problemNotes.length})</span>
          </button>
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
                  title="New Note (Cmd+N)"
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
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Note List */}
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
        </div>

        {/* ================= RIGHT PANE: macOS Note Workspace ================= */}
        <div className={`flex-1 flex flex-col bg-slate-900/40 h-full overflow-hidden ${
          isMobileListVisible ? 'hidden md:flex' : 'flex'
        }`}>
          {activeNote ? (
            <>
              {/* macOS Editor Top Toolbar */}
              <div className="p-3 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Mobile Back Button & Category / Status */}
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

                  {/* Note Accent Color Picker */}
                  {!activeNote.isCurated && !activeNote.isFromProblem && (
                    <div className="flex items-center gap-1 ml-1">
                      {HIGHLIGHT_COLORS.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => handleUpdateActiveField('accentColor', col.id)}
                          className={`w-4 h-4 rounded-full ${col.colorClass} transition-all cursor-pointer ${
                            activeNote.accentColor === col.id ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100'
                          }`}
                          title={`${col.name} Accent`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Multi-Color Highlighter Toolbar (Amber, Cyan, Emerald, Purple, Rose) */}
                {!activeNote.isCurated && !activeNote.isFromProblem && editorMode === 'write' && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 pl-1 pr-0.5">
                      <Highlighter className="w-3 h-3 text-cyan-400" />
                    </span>
                    {HIGHLIGHT_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => applyHighlightColor(col.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${col.badgeClass}`}
                        title={`Highlight selected text in ${col.name}`}
                      >
                        {col.name}
                      </button>
                    ))}

                    <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => applyFormatting('bold')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Bold (**text**)"
                    >
                      <Bold className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('code')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Inline Code (`code`)"
                    >
                      <Code className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('quote')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Quote (> text)"
                    >
                      <Quote className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Right Actions: View Mode, Pin, Delete, Duplicate */}
                <div className="flex items-center gap-1.5">
                  {/* Autosave status indicator */}
                  {!activeNote.isCurated && !activeNote.isFromProblem && (
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline mr-1">
                      {saveIndicator}
                    </span>
                  )}

                  {/* Write vs Preview Mode Toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => setEditorMode('write')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        editorMode === 'write'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" /> Write
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        editorMode === 'preview'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  </div>

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

                  {/* Delete Button */}
                  {!activeNote.isCurated && !activeNote.isFromProblem && (
                    <button
                      onClick={handleDeleteActiveNote}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Note Editor & Reader Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Title Input (Native in-place editable!) */}
                <div>
                  {!activeNote.isCurated && !activeNote.isFromProblem ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      placeholder="Title of your note..."
                      value={activeNote.title || ''}
                      onChange={(e) => handleUpdateActiveField('title', e.target.value)}
                      className="w-full bg-transparent text-xl font-extrabold text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors border-b border-transparent focus:border-cyan-500/40 pb-1"
                    />
                  ) : (
                    <h2 className="text-xl font-extrabold text-slate-100">
                      {activeNote.title}
                    </h2>
                  )}

                  {/* Timestamp & Tag row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activeNote.updatedAt || activeNote.createdAt
                        ? format(new Date(activeNote.updatedAt || activeNote.createdAt), 'EEEE, MMMM d, yyyy h:mm a')
                        : 'Today'}
                    </span>

                    {/* Tag chips */}
                    {Array.isArray(activeNote.tags) && activeNote.tags.length > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        {activeNote.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                {editorMode === 'write' && !activeNote.isCurated && !activeNote.isFromProblem ? (
                  <div className="space-y-4">
                    <textarea
                      ref={textareaRef}
                      placeholder="Start typing your note... Use the color buttons in the toolbar above to highlight key phrases, formulas, invariants, and edge cases."
                      value={activeNote.content || ''}
                      onChange={(e) => handleUpdateActiveField('content', e.target.value)}
                      className="w-full min-h-[320px] bg-transparent text-slate-200 text-sm font-mono leading-relaxed focus:outline-none resize-none placeholder:text-slate-600"
                    />

                    {/* Code Template Attachment Accordion */}
                    <div className="pt-4 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Code2 className="w-4 h-4" />
                          <span>{showCodeSnippet || activeNote.codeSnippet ? 'Code Template / Snippet' : '+ Attach Code Template'}</span>
                        </button>

                        {(showCodeSnippet || activeNote.codeSnippet) && (
                          <select
                            value={activeNote.language || 'cpp'}
                            onChange={(e) => handleUpdateActiveField('language', e.target.value)}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
                          >
                            {PROGRAMMING_LANGS.map((lang) => (
                              <option key={lang.id} value={lang.id}>{lang.label}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {(showCodeSnippet || activeNote.codeSnippet) && (
                        <textarea
                          rows={7}
                          placeholder={`// Paste reusable ${activeNote.language?.toUpperCase() || 'C++'} solution algorithm or template here...`}
                          value={activeNote.codeSnippet || ''}
                          onChange={(e) => handleUpdateActiveField('codeSnippet', e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-all resize-y"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Live Rendered Markdown & Highlights Preview */
                  <div className="space-y-4">
                    <HighlightedMarkdown content={activeNote.content} />

                    {activeNote.codeSnippet && (
                      <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                        <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-400">
                          <span className="uppercase font-bold">{activeNote.language || 'Code'} Template</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeNote.codeSnippet);
                              alert('Code copied to clipboard!');
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy Snippet
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                          <code>{activeNote.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
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
    </div>
  );
}

// Single Note Row in macOS List Explorer
function NoteListItem({ note, isSelected, onSelect }) {
  const snippet = getPreviewSnippet(note.content);
  const formattedDate = note.updatedAt || note.createdAt
    ? format(new Date(note.updatedAt || note.createdAt), 'MMM d')
    : 'Recent';

  const dotColor = 
    note.accentColor === 'rose' ? 'bg-rose-400' :
    note.accentColor === 'amber' ? 'bg-amber-400' :
    note.accentColor === 'emerald' ? 'bg-emerald-400' :
    note.accentColor === 'purple' ? 'bg-purple-400' : 'bg-cyan-400';

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl transition-all cursor-pointer select-none space-y-1 relative group ${
        isSelected
          ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-transparent border border-cyan-500/40 shadow-sm'
          : 'hover:bg-slate-900/80 border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
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

      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <span className="font-mono text-slate-400 shrink-0">{formattedDate}</span>
        <span className="truncate text-slate-400 text-[11px] leading-tight flex-1">
          {snippet}
        </span>
      </div>

      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <div className="flex items-center gap-1 pt-0.5 overflow-hidden">
          {note.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
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
