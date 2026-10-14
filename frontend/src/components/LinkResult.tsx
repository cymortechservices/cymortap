'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Check, Copy, Download, ExternalLink, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { copyText, nativeShare } from '@/lib/clipboard';
import { daysUntil, formatDate } from '@/lib/format';
import { downloadQr } from '@/lib/qr';
import type { CreateLinkResponse } from '@/types/api';
import { QrCode } from './QrCode';
import { Alert, Button } from './ui';

export function LinkResult({ result, onReset }: { result: CreateLinkResponse; onReset: () => void }) {
  const { link, policy } = result;
  const reduce = useReducedMotion();
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [share, setShare] = useState<'idle' | 'shared' | 'unsupported'>('idle');
  const [canShare, setCanShare] = useState(false);
  const [qrError, setQrError] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'), []);

  async function onCopy() {
    setCopy((await copyText(link.shortUrl)) ? 'copied' : 'failed');
    setTimeout(() => setCopy('idle'), 2500);
  }
  async function onShare() {
    const r = await nativeShare({ title: link.title ?? 'Message me on WhatsApp', text: 'Tap to start a WhatsApp conversation with me.', url: link.shortUrl });
    if (r === 'shared') setShare('shared');
    if (r === 'unsupported') {
      setShare('unsupported');
      await onCopy();
    }
  }
  async function onQr() {
    setQrError(false);
    try {
      await downloadQr(link.shortUrl, link.slug);
    } catch {
      setQrError(true);
    }
  }

  return (
    <motion.div initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5" data-testid="link-result">
      <div className="flex items-center gap-3">
        <motion.span
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
        </motion.span>
        <div>
          <h3 className="font-display text-xl font-semibold">Your link is ready</h3>
          <p className="text-sm text-mist-500">Share it anywhere. People tap it to open a WhatsApp chat with your message ready.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-tap-400/30 bg-ink-900 p-2 pl-3.5">
        <a data-testid="short-url" href={`${link.shortUrl}?preview=1`} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-medium text-tap-300" title={link.shortUrl}>
          {link.shortUrl}
        </a>
        <Button onClick={onCopy} className="shrink-0 !px-3.5" aria-label="Copy link">
          {copy === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copy === 'copied' ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {copy === 'failed' && <Alert>Your browser blocked copying. Select the link above and copy it manually.</Alert>}
      {share === 'shared' && <Alert tone="success">Shared.</Alert>}

      <div className="grid gap-5 sm:grid-cols-[176px_1fr]">
        <div className="mx-auto sm:mx-0"><QrCode url={link.shortUrl} label={`QR code for ${link.shortUrl}`} /></div>
        <div className="grid content-start gap-2">
          {canShare && (
            <Button variant="ghost" onClick={onShare}><Share2 className="h-4 w-4" /> Share</Button>
          )}
          <Button variant="ghost" onClick={onQr}><Download className="h-4 w-4" /> Download QR code</Button>
          <a href={`${link.shortUrl}?preview=1`} target="_blank" rel="noopener noreferrer" className="btn-ghost"><ExternalLink className="h-4 w-4" /> Preview destination</a>
          <Button variant="ghost" onClick={onReset}><Plus className="h-4 w-4" /> Create another link</Button>
          {qrError && <p className="text-xs text-red-300">QR download failed. Try again.</p>}
        </div>
      </div>

      {policy.guest ? (
        <Alert tone="info">
          <p className="font-medium">This is a guest link.</p>
          <p className="mt-1 text-tap-300/90">
            It works until {formatDate(link.expiresAt)} ({link.expiresAt ? daysUntil(link.expiresAt) : 0} days). It is not saved to any account, so it cannot be edited, turned off or tracked later.
          </p>
          <Link href="/register" className="mt-2 inline-block font-semibold underline">Create an account for links you can manage and track</Link>
        </Alert>
      ) : (
        <Alert tone="success">
          <p>Saved to your account. It does not expire.</p>
          <Link href="/dashboard/links" className="mt-1 inline-flex items-center gap-1 font-semibold underline"><BarChart3 className="h-4 w-4" /> Manage in My Links</Link>
        </Alert>
      )}
    </motion.div>
  );
}
