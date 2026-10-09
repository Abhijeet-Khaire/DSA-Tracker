import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAC_HIGHLIGHT_COLORS } from './MacNotesEditor';
import { Bold, Italic, Underline, Code, Eraser, Sparkles, Strikethrough } from 'lucide-react';

export default function FloatingHighlighterMenu({ editorRef, onApplyHighlight, onApplyFormat }) {
  const [menuPosition, setMenuPosition] = useState(null);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setVisible(false);
        return;
      }

      // Ensure selection is inside the editor element
      const anchorNode = selection.anchorNode;
      const editorEl = editorRef?.current;
      if (!editorEl || !editorEl.contains(anchorNode)) {
        setVisible(false);
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        setVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const clientRects = range.getClientRects();
      const firstRect = clientRects.length > 0 ? clientRects[0] : range.getBoundingClientRect();

      // Only show if selection has visible dimensions
      if (firstRect && firstRect.width > 0 && firstRect.height > 0) {
        const menuWidth = 320;
        
        // Place above the first line of selection; if near the top boundary, place below the selection
        let top = firstRect.top - 52;
        if (top < 120) {
          const lastRect = clientRects.length > 0 ? clientRects[clientRects.length - 1] : firstRect;
          top = lastRect.bottom + 12;
        }

        const left = Math.max(
          16,
          Math.min(window.innerWidth - menuWidth - 16, firstRect.left + firstRect.width / 2 - menuWidth / 2)
        );

        setMenuPosition({ top, left });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    const handleSelectionChange = () => {
      requestAnimationFrame(updatePosition);
    };

    const handleScrollOrResize = () => {
      if (visible) {
        updatePosition();
      }
    };

    const editor = editorRef?.current;
    if (editor) {
      editor.addEventListener('mouseup', handleSelectionChange);
      editor.addEventListener('keyup', handleSelectionChange);
    }
    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      if (editor) {
        editor.removeEventListener('mouseup', handleSelectionChange);
        editor.removeEventListener('keyup', handleSelectionChange);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [editorRef, visible]);

  if (!visible || !menuPosition) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 6 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 99999,
        }}
        className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-slate-200 select-none pointer-events-auto"
        onMouseDown={(e) => {
          // Prevent losing selection inside editor
          e.preventDefault();
        }}
      >
        {/* Quick Formatting Tools */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-800">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplyFormat('bold')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bold (⌘B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplyFormat('italic')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Italic (⌘I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplyFormat('underline')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Underline (⌘U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplyFormat('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 macOS Glow Highlighter Color Swatches */}
        <div className="flex items-center gap-1.5 px-1">
          {MAC_HIGHLIGHT_COLORS.map((col) => (
            <motion.button
              key={col.id}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.85 }}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyHighlight(col);
                setVisible(false);
              }}
              className={`w-5 h-5 rounded-full ${col.dotClass} cursor-pointer shadow-md transition-all ring-1 ring-white/20 hover:ring-2 hover:ring-white`}
              title={`Highlight with ${col.name}`}
            />
          ))}

          {/* Eraser */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onApplyHighlight(null);
              setVisible(false);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
            title="Remove Highlight"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
