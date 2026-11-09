import React from 'react';

/**
 * Minimal, safe formatter for AI answers: paragraphs, "- " / "1. " lists and **bold**.
 * Renders text nodes only (no HTML injection).
 */
function inline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>
    )
  );
}

export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <div className={`space-y-2.5 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        const isList = lines.length > 0 && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} className="space-y-1 pl-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="text-primary flex-shrink-0">
                    {/^\s*\d/.test(l) ? l.trim().match(/^\d+/)?.[0] + '.' : '•'}
                  </span>
                  <span>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {inline(block.replace(/^#{1,4}\s+/gm, ''), String(bi))}
          </p>
        );
      })}
    </div>
  );
}
