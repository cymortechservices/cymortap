export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Renders WhatsApp-style formatting (*bold*, _italic_, ~strike~, ```mono```) for the preview page.
 * The text is HTML-escaped first, so only the tags added here can ever appear in the output.
 */
export function formatMessageHtml(raw: string): string {
  return escapeHtml(raw)
    .split(/(```[\s\S]+?```)/g)
    .map((part, i) =>
      i % 2 === 1
        ? `<code>${part.slice(3, -3)}</code>`
        : part
            .replace(/(?<!\w)\*([^\s*](?:[^*\n]*[^\s*])?)\*(?!\w)/g, '<strong>$1</strong>')
            .replace(/(?<!\w)_([^\s_](?:[^_\n]*[^\s_])?)_(?!\w)/g, '<em>$1</em>')
            .replace(/(?<!\w)~([^\s~](?:[^~\n]*[^\s~])?)~(?!\w)/g, '<s>$1</s>'),
    )
    .join('');
}

const STYLE = `
:root{color-scheme:dark}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;color:#e8f1ff;
font-family:ui-rounded,"SF Pro Rounded","Segoe UI Variable Display","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;
background:radial-gradient(900px 500px at 15% -10%,rgba(34,211,238,.18),transparent 60%),radial-gradient(800px 500px at 100% 0,rgba(59,130,246,.2),transparent 55%),#04070f}
main{width:100%;max-width:420px;border-radius:28px;overflow:hidden;background:#0a1224;border:1px solid rgba(125,211,252,.18);box-shadow:0 30px 80px -30px rgba(34,211,238,.35)}
.top{display:flex;align-items:center;gap:12px;padding:16px 20px;background:#0e1830;border-bottom:1px solid rgba(255,255,255,.06)}
.av{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#04101f;background:linear-gradient(135deg,#22d3ee,#3b82f6);flex:none}
.top b{display:block;font-size:1rem;letter-spacing:-.01em}.top span{font-size:.75rem;color:#8aa0c2}
.chat{padding:22px 20px 26px;background-color:#081023;background-image:radial-gradient(rgba(125,211,252,.07) 1px,transparent 1.2px);background-size:22px 22px}
.chip{width:max-content;margin:0 auto 18px;padding:4px 12px;border-radius:99px;background:rgba(255,255,255,.06);color:#8aa0c2;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.bubble{position:relative;width:fit-content;max-width:94%;margin-left:auto;padding:13px 16px;border-radius:20px 20px 4px 20px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:1.02rem;line-height:1.55;color:#fff;background:linear-gradient(135deg,#3b82f6,#2563eb);box-shadow:0 10px 28px -10px rgba(37,99,235,.7)}
.bubble::after{content:"";position:absolute;right:-6px;bottom:0;width:12px;height:12px;background:#2563eb;clip-path:polygon(0 0,100% 100%,0 100%)}
.bubble code{padding:1px 5px;border-radius:5px;background:rgba(0,0,0,.28);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em}
.bubble s{opacity:.8}.meta{display:block;margin-top:6px;text-align:right;font-size:.66rem;letter-spacing:.04em;color:rgba(255,255,255,.7)}
.body{padding:20px}h1{font-size:1.2rem;letter-spacing:-.02em;margin:0 0 6px}p{color:#9db4d3;line-height:1.55;margin:0 0 16px;font-size:.93rem}
a.btn{display:block;text-align:center;text-decoration:none;font-weight:700;padding:15px 16px;border-radius:14px;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#04101f;box-shadow:0 10px 30px -10px rgba(34,211,238,.6)}
small{display:block;margin-top:16px;color:#6f86a8;line-height:1.5;font-size:.76rem}small a{color:#7dd3fc}
.state{padding:28px 24px}
`;

export function pageShell(title: string, body: string, headExtra = ''): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title>${headExtra}<style>${STYLE}</style></head><body><main>${body}</main></body></html>`;
}

export type StateKind = 'notfound' | 'disabled' | 'expired' | 'gone';

export function statePage(kind: StateKind, homeUrl: string): string {
  const copy = {
    notfound: ['This link does not exist', 'Check the address for typos, or ask the sender for a new link.'],
    disabled: ['This link is turned off', 'The owner or CYMOR TAP has disabled it, so it cannot open a conversation.'],
    expired: ['This link has expired', 'Guest links stop working after a set time. Ask the sender for a new link.'],
    gone: ['This link was removed', 'The owner deleted it, so it no longer opens a conversation.'],
  }[kind];
  return pageShell(
    copy[0],
    `<div class="state"><h1>${escapeHtml(copy[0])}</h1><p>${escapeHtml(copy[1])}</p><a class="btn" href="${escapeHtml(homeUrl)}">Make your own CYMOR TAP link</a></div>`,
  );
}

export function handoffPage(opts: { title: string; message: string; whatsappUrl: string; auto: boolean; reportUrl: string }): string {
  const refresh = opts.auto ? `<meta http-equiv="refresh" content="0;url=${escapeHtml(opts.whatsappUrl)}">` : '';
  const name = opts.title || 'Continue to WhatsApp';
  const initial = escapeHtml((name.trim()[0] ?? 'C').toUpperCase());
  const body = `
<div class="top"><div class="av">${initial}</div><div><b>${escapeHtml(name)}</b><span>Chat opens in WhatsApp</span></div></div>
<div class="chat">
<div class="chip">Draft · not sent yet</div>
${opts.message ? `<div class="bubble">${formatMessageHtml(opts.message)}<span class="meta">Ready to send</span></div>` : ''}
</div>
<div class="body">
<p>${opts.auto ? 'Opening WhatsApp. If nothing happens, use the button below.' : 'This message will be waiting in your message box. Nothing is sent until you press send in WhatsApp.'}</p>
<a class="btn" href="${escapeHtml(opts.whatsappUrl)}" rel="noopener noreferrer">Continue to WhatsApp</a>
<small>CYMOR TAP is an independent service and is not affiliated with WhatsApp. Only continue if you trust the person who shared this link. <a href="${escapeHtml(opts.reportUrl)}">Report this link</a></small>
</div>`;
  return pageShell(name, body, refresh);
}
