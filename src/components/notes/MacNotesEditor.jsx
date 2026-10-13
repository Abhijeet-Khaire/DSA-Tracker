import React, { useRef, useEffect, useState } from 'react';
import { 
  Highlighter, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Eraser,
  Heading1,
  Heading2,
  Strikethrough,
  Sparkles,
  CheckCircle2,
  Code,
  Minus,
  RemoveFormatting
} from 'lucide-react';
import FloatingHighlighterMenu from './FloatingHighlighterMenu';

export const MAC_HIGHLIGHT_COLORS = [
  {
    id: 'yellow',
    name: 'Yellow',
    bg: 'rgba(250, 204, 21, 0.32)',
    text: '#fef08a',
    border: 'rgba(250, 204, 21, 0.45)',
    glow: '0 0 10px rgba(250, 204, 21, 0.22)',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    bg: 'rgba(56, 189, 248, 0.32)',
    text: '#bae6fd',
    border: 'rgba(56, 189, 248, 0.45)',
    glow: '0 0 10px rgba(56, 189, 248, 0.22)',
    dotClass: 'bg-cyan-400',
  },
  {
    id: 'green',
    name: 'Green',
    bg: 'rgba(74, 222, 128, 0.32)',
    text: '#bbf7d0',
    border: 'rgba(74, 222, 128, 0.45)',
    glow: '0 0 10px rgba(74, 222, 128, 0.22)',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'purple',
    name: 'Purple',
    bg: 'rgba(192, 132, 252, 0.32)',
    text: '#e9d5ff',
    border: 'rgba(192, 132, 252, 0.45)',
    glow: '0 0 10px rgba(192, 132, 252, 0.22)',
    dotClass: 'bg-purple-400',
  },
  {
    id: 'pink',
    name: 'Pink',
    bg: 'rgba(251, 113, 133, 0.32)',
    text: '#fecdd3',
    border: 'rgba(251, 113, 133, 0.45)',
    glow: '0 0 10px rgba(251, 113, 133, 0.22)',
    dotClass: 'bg-rose-400',
  },
];

// Safely extracts content from range while detaching any trailing whitespace
// so highlight tags don't swallow following spaces
function extractAndTrimFragment(range) {
  const fragment = range.extractContents();
  const text = fragment.textContent || '';
  const match = text.match(/(\s+)$/);
  let trailingSpace = '';

  if (match) {
    trailingSpace = match[1];
    const trimLastTextNode = (node) => {
      if (!node) return false;
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(/\s+$/, '');
        return true;
      }
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        if (trimLastTextNode(node.childNodes[i])) return true;
      }
      return false;
    };
    trimLastTextNode(fragment);
  }

  return { fragment, trailingSpace };
}

// Detects if the caret is positioned at the very end boundary of an inline <mark> or <code> tag
function getInlineFormattedAtCaretEnd(selection) {
  if (!selection || !selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const container = range.startContainer;
  const offset = range.startOffset;

  if (container.nodeType === Node.TEXT_NODE) {
    const el = container.parentElement?.closest('mark.mac-highlight, code');
    if (el) {
      if (offset === container.textContent.length) {
        let next = container.nextSibling;
        let hasMore = false;
        while (next) {
          if (next.textContent && next.textContent.length > 0) {
            hasMore = true;
            break;
          }
          next = next.nextSibling;
        }
        if (!hasMore) {
          return el;
        }
      }
    }
  }

  if (container.nodeType === Node.ELEMENT_NODE && (container.tagName === 'MARK' || container.tagName === 'CODE')) {
    if (offset === container.childNodes.length) {
      return container;
    }
  }

  return null;
}

// Converts legacy ==color:text== or plain markdown into rich HTML on first load
export function normalizeContentToHtml(raw) {
  if (!raw) return '<p><br></p>';

  // Clean any legacy <mark> tags where trailing spaces were trapped inside
  let cleaned = raw.replace(/(<mark\b[^>]*>)([\s\S]*?)(\s+)(<\/mark>)/gi, '$1$2$4$3');

  // If already rich HTML (contains tags), return cleaned
  if (/<[a-z][\s\S]*>/i.test(cleaned)) {
    return cleaned;
  }

  // Convert legacy ==color:text== to styled <mark> elements
  let converted = cleaned.replace(/==([a-zA-Z]+:)?([\s\S]+?)==/g, (_, col, text) => {
    const key = (col ? col.replace(':', '') : 'yellow').toLowerCase();
    const target = MAC_HIGHLIGHT_COLORS.find((c) => c.id === key || (key === 'amber' && c.id === 'yellow') || (key === 'rose' && c.id === 'pink') || (key === 'emerald' && c.id === 'green')) || MAC_HIGHLIGHT_COLORS[0];
    const match = text.match(/^(.*?)(\s+)$/s);
    if (match) {
      return `<mark class="mac-highlight" style="background-color: ${target.bg}; color: ${target.text}; padding: 2px 6px; border-radius: 4px; box-shadow: ${target.glow}; border: 1px solid ${target.border}; font-weight: 500;">${match[1]}</mark>${match[2]}`;
    }
    return `<mark class="mac-highlight" style="background-color: ${target.bg}; color: ${target.text}; padding: 2px 6px; border-radius: 4px; box-shadow: ${target.glow}; border: 1px solid ${target.border}; font-weight: 500;">${text}</mark>`;
  });

  // Convert simple markdown headings and lines to paragraphs
  const lines = converted.split('\n');
  const htmlLines = lines.map((l) => {
    const trimmed = l.trim();
    if (!trimmed) return '<p><br></p>';
    if (trimmed.startsWith('### ')) {
      return `<h3>${trimmed.replace('### ', '')}</h3>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2>${trimmed.replace('## ', '')}</h2>`;
    }
    if (trimmed.startsWith('# ')) {
      return `<h1>${trimmed.replace('# ', '')}</h1>`;
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return `<li>${trimmed.replace(/^[\*\-]\s+/, '')}</li>`;
    }
    if (trimmed.startsWith('> ')) {
      return `<blockquote>${trimmed.replace('> ', '')}</blockquote>`;
    }
    return `<p>${l}</p>`;
  });

  return htmlLines.join('');
}

export default function MacNotesEditor({
  content,
  onChange,
  readOnly = false,
  placeholder = 'Start typing your note here... Select text for instant pop-up highlights and formatting.',
}) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef('');
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  // Update statistics
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const chars = text.length;
    setStats({ words, chars });
  };

  // Hydrate content when switching notes
  useEffect(() => {
    if (!editorRef.current) return;
    const initialHtml = normalizeContentToHtml(content);
    if (editorRef.current.innerHTML !== initialHtml && lastHtmlRef.current !== content) {
      editorRef.current.innerHTML = initialHtml;
      lastHtmlRef.current = initialHtml;
      updateStats();
    }
  }, [content]);

  const handleInput = () => {
    if (!editorRef.current) return;
    // Clean up any empty mark elements left after backspacing
    editorRef.current.querySelectorAll('mark.mac-highlight').forEach((m) => {
      if (!m.textContent) {
        m.remove();
      }
    });
    const html = editorRef.current.innerHTML;
    lastHtmlRef.current = html;
    updateStats();
    onChange(html);
  };

  const executeCommand = (command, value = null) => {
    if (readOnly) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Apple macOS Notes Highlighting tool:
  // Wraps selected text in a visually glowing <mark> tag
  const applyColorHighlight = (colorConfig) => {
    if (readOnly) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);

    // If clearing highlight
    if (colorConfig === null) {
      const parentMark = selection.anchorNode?.parentElement?.closest('mark');
      if (parentMark) {
        const parent = parentMark.parentNode;
        while (parentMark.firstChild) {
          parent.insertBefore(parentMark.firstChild, parentMark);
        }
        parent.removeChild(parentMark);
        handleInput();
        return;
      }
      document.execCommand('removeFormat', false, null);
      handleInput();
      return;
    }

    // Check if selection is already inside a mark; if so, update its color
    const existingMark = selection.anchorNode?.parentElement?.closest('mark');
    if (existingMark) {
      existingMark.style.backgroundColor = colorConfig.bg;
      existingMark.style.color = colorConfig.text;
      existingMark.style.boxShadow = colorConfig.glow;
      existingMark.style.border = `1px solid ${colorConfig.border}`;
      handleInput();
      return;
    }

    // Create styled <mark> element
    const mark = document.createElement('mark');
    mark.className = 'mac-highlight';
    mark.style.backgroundColor = colorConfig.bg;
    mark.style.color = colorConfig.text;
    mark.style.padding = '2px 6px';
    mark.style.borderRadius = '4px';
    mark.style.boxShadow = colorConfig.glow;
    mark.style.border = `1px solid ${colorConfig.border}`;
    mark.style.fontWeight = '500';

    try {
      const { fragment, trailingSpace } = extractAndTrimFragment(range);
      mark.appendChild(fragment);
      range.insertNode(mark);

      // Keep any trailing whitespace or ensure an unstyled text node exists immediately outside the mark
      let nextNode = mark.nextSibling;
      let targetOffset = 0;

      if (trailingSpace) {
        const spaceNode = document.createTextNode(trailingSpace);
        mark.parentNode?.insertBefore(spaceNode, nextNode);
        nextNode = spaceNode;
        targetOffset = trailingSpace.length;
      } else if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
        const emptyNode = document.createTextNode('');
        mark.parentNode?.insertBefore(emptyNode, nextNode);
        nextNode = emptyNode;
        targetOffset = 0;
      }

      // Position caret immediately AFTER the highlight in the outside text node, so next words are unhighlighted
      const newRange = document.createRange();
      if (nextNode) {
        newRange.setStart(nextNode, targetOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      editorRef.current?.focus();
      handleInput();
    } catch (err) {
      document.execCommand('hiliteColor', false, colorConfig.bg);
      handleInput();
    }
  };

  const applyInlineCode = () => {
    if (readOnly) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      executeCommand('insertHTML', '<code>code</code>');
      return;
    }

    const range = selection.getRangeAt(0);
    const existingCode = selection.anchorNode?.parentElement?.closest('code');
    if (existingCode) {
      const parent = existingCode.parentNode;
      while (existingCode.firstChild) {
        parent.insertBefore(existingCode.firstChild, existingCode);
      }
      parent.removeChild(existingCode);
      handleInput();
      return;
    }

    const code = document.createElement('code');
    try {
      const { fragment, trailingSpace } = extractAndTrimFragment(range);
      code.appendChild(fragment);
      range.insertNode(code);

      let nextNode = code.nextSibling;
      let targetOffset = 0;

      if (trailingSpace) {
        const spaceNode = document.createTextNode(trailingSpace);
        code.parentNode?.insertBefore(spaceNode, nextNode);
        nextNode = spaceNode;
        targetOffset = trailingSpace.length;
      } else if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
        const emptyNode = document.createTextNode('');
        code.parentNode?.insertBefore(emptyNode, nextNode);
        nextNode = emptyNode;
        targetOffset = 0;
      }

      const newRange = document.createRange();
      if (nextNode) {
        newRange.setStart(nextNode, targetOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      editorRef.current?.focus();
      handleInput();
    } catch (err) {
      document.execCommand('insertHTML', false, `<code>${selection.toString()}</code>`);
      handleInput();
    }
  };

  const handleKeyDown = (e) => {
    if (readOnly) return;
    const selection = window.getSelection();
    const el = getInlineFormattedAtCaretEnd(selection);

    if (el) {
      // 1. Space: User wants to separate the highlighted word from the next word
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        let next = el.nextSibling;
        if (next && next.nodeType === Node.TEXT_NODE) {
          next.insertData(0, ' ');
          const newRange = document.createRange();
          newRange.setStart(next, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          const spaceNode = document.createTextNode(' ');
          el.parentNode?.insertBefore(spaceNode, next);
          const newRange = document.createRange();
          newRange.setStart(spaceNode, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        handleInput();
        return;
      }

      // 2. ArrowRight: Navigate past the highlight cleanly
      if (e.key === 'ArrowRight') {
        let next = el.nextSibling;
        if (next && next.nodeType === Node.TEXT_NODE) {
          e.preventDefault();
          const newRange = document.createRange();
          newRange.setStart(next, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          return;
        } else if (!next) {
          e.preventDefault();
          const emptyNode = document.createTextNode('');
          el.parentNode?.appendChild(emptyNode);
          const newRange = document.createRange();
          newRange.setStart(emptyNode, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          return;
        }
      }

      // 3. Enter: Ensure new line doesn't start inside the highlight tag
      if (e.key === 'Enter') {
        let next = el.nextSibling;
        if (!next || next.nodeType !== Node.TEXT_NODE) {
          const emptyNode = document.createTextNode('');
          el.parentNode?.insertBefore(emptyNode, next);
          next = emptyNode;
        }
        const newRange = document.createRange();
        newRange.setStart(next, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  };

  const handleBeforeInput = (e) => {
    if (readOnly) return;
    if (e.inputType === 'insertText') {
      const selection = window.getSelection();
      const el = getInlineFormattedAtCaretEnd(selection);
      if (el) {
        // Typing at the end boundary of highlight/code: snap caret outside so typed characters are normal text
        let next = el.nextSibling;
        if (!next || next.nodeType !== Node.TEXT_NODE) {
          next = document.createTextNode('');
          el.parentNode?.insertBefore(next, el.nextSibling);
        }
        const newRange = document.createRange();
        newRange.setStart(next, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  };

  const handleMouseUp = () => {
    if (readOnly) return;
    setTimeout(() => {
      const selection = window.getSelection();
      const el = getInlineFormattedAtCaretEnd(selection);
      if (el) {
        // If clicking right after the highlighted word (on its end padding), snap cursor outside el
        let next = el.nextSibling;
        if (!next || next.nodeType !== Node.TEXT_NODE) {
          next = document.createTextNode('');
          el.parentNode?.insertBefore(next, el.nextSibling);
        }
        const newRange = document.createRange();
        newRange.setStart(next, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }, 0);
  };

  const readTimeMin = Math.max(1, Math.ceil(stats.words / 200));

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner relative group/editor">
      {/* Floating Selection Highlighter Pop-up Toolbar */}
      {!readOnly && (
        <FloatingHighlighterMenu
          editorRef={editorRef}
          onApplyHighlight={applyColorHighlight}
          onApplyFormat={executeCommand}
          onApplyInlineCode={applyInlineCode}
        />
      )}

      {/* macOS Notes Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-300 text-xs shrink-0 select-none backdrop-blur-md">
          {/* Left: macOS Window Traffic Lights + Formatting Group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 border border-rose-600/40" title="Close" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-600/40" title="Minimize" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-600/40" title="Expand" />
            </div>

            <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Bold (⌘B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Italic (⌘I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Underline (⌘U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyInlineCode}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Quote Callout"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Divider (<hr>)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('removeFormat')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Multi-Color Palette + Selection Pop-up hint */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-1 pr-1">
              <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Highlight:</span>
            </span>

            {MAC_HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColorHighlight(col)}
                className={`w-4.5 h-4.5 rounded-full ${col.dotClass} hover:scale-120 active:scale-90 transition-all cursor-pointer shadow-sm hover:ring-2 hover:ring-white`}
                title={`Highlight selected text with ${col.name} (or select text to pop-up menu)`}
              />
            ))}

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColorHighlight(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
              title="Clear Highlight"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* WYSIWYG Editable Writing Area (Native ContentEditable just like macOS Notes) */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onMouseUp={handleMouseUp}
          data-placeholder={placeholder}
          className={`min-h-[340px] focus:outline-none text-sm text-slate-100 leading-relaxed font-sans space-y-3 mac-notes-content ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          style={{
            wordBreak: 'break-word',
          }}
        />
      </div>

      {/* macOS Notes Status Bar (Word & Character counter, Read time) */}
      <div className="px-5 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
        <div className="flex items-center gap-3">
          <span>{stats.words} words</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{stats.chars} characters</span>
          <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:inline" />
          <span className="hidden sm:inline">~{readTimeMin} min read</span>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-400/90 text-[10px]">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="hidden md:inline">Select text anytime for floating highlight pop-up</span>
        </div>
      </div>
    </div>
  );
}
