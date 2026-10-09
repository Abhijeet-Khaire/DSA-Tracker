import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Maps highlight color identifiers to dark-mode styling
const COLOR_MAP = {
  amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10',
  yellow: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10',
  cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10',
  blue: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10',
  emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10',
  green: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10',
  purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10',
  violet: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10',
  rose: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10',
  pink: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10',
  red: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10',
};

// Renders an inline text string with ==color:text== or ==text== highlights, `code`, and **bold**
export function renderInlineHighlightedText(text) {
  if (!text) return null;

  // Regex to match ==color:text== or ==text==, `code`, and **bold**
  const regex = /(==(?:([a-zA-Z]+):)?([\s\S]+?)==|`([^`]+)`|\*\*([^*]+)\*\*)/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    if (match[0].startsWith('==')) {
      const colorKey = (match[2] || 'amber').toLowerCase();
      const content = match[3];
      const styling = COLOR_MAP[colorKey] || COLOR_MAP.amber;

      elements.push(
        <mark
          key={`hl-${match.index}`}
          className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-medium text-[11px] leading-snug not-italic align-baseline transition-all ${styling}`}
        >
          {content}
        </mark>
      );
    } else if (match[0].startsWith('`')) {
      elements.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700/60"
        >
          {match[4]}
        </code>
      );
    } else if (match[0].startsWith('**')) {
      elements.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-100">
          {match[5]}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="uppercase tracking-wider font-semibold text-cyan-400">{lang || 'Code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function HighlightedMarkdown({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Triple backticks code block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <CodeBlock
            key={`cb-${i}`}
            code={codeBuffer.join('\n')}
            lang={codeLang}
          />
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-100 mt-3 mb-1.5 flex items-center gap-2">
          {renderInlineHighlightedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-base font-bold text-slate-100 mt-4 mb-2">
          {renderInlineHighlightedText(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2.5 pl-3.5 py-1 border-l-2 border-cyan-500 bg-cyan-950/20 rounded-r-xl text-xs text-slate-300 italic"
        >
          {renderInlineHighlightedText(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletText = line.trim().replace(/^[\*\-]\s+/, '');
      renderedElements.push(
        <li key={`li-${i}`} className="text-xs text-slate-300 leading-relaxed ml-4 list-disc marker:text-cyan-400">
          {renderInlineHighlightedText(bulletText)}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="text-xs text-slate-300 leading-relaxed ml-3 flex items-start gap-1.5 my-0.5">
          <span className="font-bold text-cyan-400 shrink-0 font-mono text-[11px]">{numMatch[1]}.</span>
          <span className="flex-1">{renderInlineHighlightedText(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line spacer
    if (!line.trim()) {
      renderedElements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    // Regular paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed my-1">
        {renderInlineHighlightedText(line)}
      </p>
    );
  }

  // Close lingering code block if any
  if (inCodeBlock && codeBuffer.length > 0) {
    renderedElements.push(
      <CodeBlock
        key="cb-tail"
        code={codeBuffer.join('\n')}
        lang={codeLang}
      />
    );
  }

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
}
