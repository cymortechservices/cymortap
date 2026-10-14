'use client';

import { BarChart3, Check, Copy, Download, Pencil, Power, QrCode as QrIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
import { formatDate } from '@/lib/format';
import { downloadQr } from '@/lib/qr';
import type { LinkDto } from '@/types/api';
import { MessageBubble } from '../MessageBubble';
import { QrCode } from '../QrCode';
import { Alert, Badge, Button } from '../ui';

const tone = { active: 'good', disabled: 'warn', expired: 'bad', deleted: 'bad' } as const;

export function LinkRow({ link, onChanged }: { link: LinkDto; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const locked = link.status === 'disabled' && link.disabledReason === 'moderation';

  return (
    <li className="glass rounded-2xl p-4 sm:p-5" data-testid="link-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{link.title || `/${link.slug}`}</h3>
            <Badge tone={tone[link.status]}>{link.status}</Badge>
          </div>
          <a href={`${link.shortUrl}?preview=1`} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-sm text-tap-300 hover:underline">{link.shortUrl}</a>
          <div className="mt-3 max-h-40 overflow-hidden"><MessageBubble text={link.message} className="!ml-0 !mr-auto" /></div>
          <p className="mt-2 text-xs text-mist-700">+{link.phone} · Created {formatDate(link.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" className="!min-h-[40px] !px-3" onClick={async () => { setCopied(await copyText(link.shortUrl)); setTimeout(() => setCopied(false), 2000); }}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="ghost" className="!min-h-[40px] !px-3" onClick={() => setShowQr((v) => !v)} aria-expanded={showQr}><QrIcon className="h-4 w-4" /> QR</Button>
        <Link href={`/dashboard/links/${link.id}`} className="btn-ghost !min-h-[40px] !px-3"><Pencil className="h-4 w-4" /> Edit</Link>
        <Link href={`/dashboard/links/${link.id}#stats`} className="btn-ghost !min-h-[40px] !px-3"><BarChart3 className="h-4 w-4" /> Stats</Link>
        <Button variant="ghost" className="!min-h-[40px] !px-3" disabled={locked} loading={busy}
          onClick={() => run(() => api.setStatus(link.id, link.status === 'active' ? 'disabled' : 'active'))}>
          <Power className="h-4 w-4" /> {link.status === 'active' ? 'Turn off' : 'Turn on'}
        </Button>
        <Button variant="danger" className="!min-h-[40px] !px-3" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
      </div>

      {locked && <p className="mt-3 text-xs text-amber-300">This link was turned off after reports and cannot be turned on again. Contact support if you think this is a mistake.</p>}
      {error && <div className="mt-3"><Alert>{error}</Alert></div>}

      {showQr && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <QrCode url={link.shortUrl} size={160} />
          <Button variant="ghost" onClick={() => downloadQr(link.shortUrl, link.slug).catch(() => setError('QR download failed.'))}><Download className="h-4 w-4" /> Download PNG</Button>
        </div>
      )}

      {confirmDelete && (
        <div role="alertdialog" aria-label="Confirm delete" className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-100">Delete this link? Anyone who opens <strong>{link.shortUrl}</strong> will see that it was removed, and its QR code will stop working. This cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" loading={busy} onClick={() => run(() => api.deleteLink(link.id))}>Yes, delete</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep it</Button>
          </div>
        </div>
      )}
    </li>
  );
}
