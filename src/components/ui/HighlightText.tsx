/**
 * HighlightText
 *
 * Highlights matched substrings within text using `<mark>` tags.
 * Renders plain text when no highlight ranges are provided.
 */

interface HighlightTextProps {
  text: string;
  ranges?: [number, number][];
  className?: string;
}

export default function HighlightText({ text, ranges, className }: HighlightTextProps) {
  if (!ranges || ranges.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Sort and merge overlapping ranges
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const [start, end] of merged) {
    if (cursor < start) {
      parts.push(<span key={`t${cursor}`}>{text.slice(cursor, start)}</span>);
    }
    parts.push(
      <mark key={`m${start}`} className="bg-warning-100 text-surface-900 rounded-sm px-0.5">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push(<span key={`t${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <span className={className}>{parts}</span>;
}
