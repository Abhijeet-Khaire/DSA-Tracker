import React, { useRef, useEffect } from 'react';
import { 
  Highlighter, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Eraser,
  Heading1,
  Heading2
} from 'lucide-react';

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

// Converts legacy ==color:text== or plain markdown into rich HTML on first load
export function normalizeContentToHtml(raw) {
  if (!raw) return '<p><br></p>';

  // If already rich HTML (contains tags), return as is
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }

  // Convert legacy ==color:text== to styled <mark> elements
  let converted = raw.replace(/==([a-zA-Z]+:)?([\s\S]+?)==/g, (_, col, text) => {
    const key = (col ? col.replace(':', '') : 'yellow').toLowerCase();
    const target = MAC_HIGHLIGHT_COLORS.find((c) => c.id === key || (key === 'amber' && c.id === 'yellow') || (key === 'rose' && c.id === 'pink') || (key === 'emerald' && c.id === 'green')) || MAC_HIGHLIGHT_COLORS[0];
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
  placeholder = 'Start typing your note here... Select text and click any color to highlight it just like macOS Notes.',
}) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef('');

  // Hydrate content when switching notes
  useEffect(() => {
    if (!editorRef.current) return;
    const initialHtml = normalizeContentToHtml(content);
    if (editorRef.current.innerHTML !== initialHtml && lastHtmlRef.current !== content) {
      editorRef.current.innerHTML = initialHtml;
      lastHtmlRef.current = initialHtml;
    }
  }, [content]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastHtmlRef.current = html;
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
      alert('Please select some text first to highlight it.');
      return;
    }

    const range = selection.getRangeAt(0);

    // If clearing highlight
    if (colorConfig === null) {
      // Remove any parent mark enclosing selection
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
      const fragment = range.extractContents();
      mark.appendChild(fragment);
      range.insertNode(mark);
      selection.removeAllRanges();
      handleInput();
    } catch (err) {
      document.execCommand('hiliteColor', false, colorConfig.bg);
      handleInput();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner">
      {/* macOS Notes Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-300 text-xs shrink-0 select-none backdrop-blur-md">
          {/* Text Style / Formatting Group */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Bold (⌘B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Italic (⌘I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Underline (⌘U)"
            >
              <Underline className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Bulleted List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Quote Callout"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* macOS Multi-Color Highlighter Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-1 pr-1">
              <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Highlight:</span>
            </span>

            {MAC_HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => applyColorHighlight(col)}
                className={`w-5 h-5 rounded-full ${col.dotClass} hover:scale-115 active:scale-90 transition-all cursor-pointer shadow-sm hover:ring-2 hover:ring-white`}
                title={`Highlight selected text with ${col.name}`}
              />
            ))}

            <button
              type="button"
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
          data-placeholder={placeholder}
          className={`min-h-[380px] focus:outline-none text-sm text-slate-100 leading-relaxed font-sans space-y-3 mac-notes-content ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          style={{
            wordBreak: 'break-word',
          }}
        />
      </div>
    </div>
  );
}
