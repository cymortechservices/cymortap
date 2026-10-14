import type { ReactNode } from 'react';

/**
 * Renders the text formatting WhatsApp understands, as React elements (no raw HTML):
 * *bold*, _italic_, ~strikethrough~ and ```monospace```.
 * The stored message is never changed; this only affects how the preview looks.
 */
const PATTERN = /(```[\s\S]+?```)|(\*[^\s*](?:[^*\n]*[^\s*])?\*)|(_[^\s_](?:[^_\n]*[^\s_])?_)|(~[^\s~](?:[^~\n]*[^\s~])?~)/g;

export function renderWhatsAppText(text: string, keyPrefix = 'w'): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(PATTERN)) {
    const idx = m.index ?? 0;
    // Like WhatsApp, markers inside a word (snake_case_name, 2*3*4) are not formatting.
    if (!m[1]) {
      const prev = text[idx - 1];
      const next = text[idx + m[0].length];
      if ((prev && /\w/.test(prev)) || (next && /\w/.test(next))) continue;
    }
    if (idx > last) out.push(text.slice(last, idx));
    const key = `${keyPrefix}-${i++}`;
    if (m[1]) out.push(<code key={key} className="rounded bg-black/25 px-1 py-0.5 font-mono text-[0.92em]">{m[1].slice(3, -3)}</code>);
    else if (m[2]) out.push(<strong key={key} className="font-bold">{renderWhatsAppText(m[2].slice(1, -1), key)}</strong>);
    else if (m[3]) out.push(<em key={key}>{renderWhatsAppText(m[3].slice(1, -1), key)}</em>);
    else if (m[4]) out.push(<s key={key} className="opacity-80">{renderWhatsAppText(m[4].slice(1, -1), key)}</s>);
    last = idx + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
