'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Link2, SendHorizontal, Smile } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { renderWhatsAppText } from '@/lib/waFormat';

/**
 * Shows what the person who taps your link will see: a chat with your message already typed into
 * the message box, waiting for them to press send. Nothing is sent from here and it is not
 * WhatsApp's own interface.
 */
export function ChatPreview({ phoneLabel, message, link, sample }: { phoneLabel: string; message: string; link: string; sample: boolean }) {
  const reduce = useReducedMotion();
  const initials = phoneLabel.replace(/\D/g, '').slice(-2) || '··';
  return (
    <div className="relative mx-auto w-full max-w-[330px]" aria-label="Preview of the conversation your link opens">
      <motion.div
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-ink-900 shadow-[0_30px_80px_-30px_rgba(34,211,238,.35)]"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-ink-800/90 px-4 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-tap-500 to-tap-600 font-display text-sm font-bold text-ink-950">{initials}</div>
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-semibold leading-tight">{phoneLabel}</p>
            <p className="text-[11px] text-mist-500">Chat opens in WhatsApp</p>
          </div>
        </div>

        {/* conversation area */}
        <div
          className="relative min-h-[210px] px-4 pb-5 pt-4"
          style={{
            backgroundColor: '#081023',
            backgroundImage: 'radial-gradient(rgba(125,211,252,.07) 1px, transparent 1.2px), radial-gradient(rgba(125,211,252,.05) 1px, transparent 1.2px)',
            backgroundSize: '22px 22px, 22px 22px',
            backgroundPosition: '0 0, 11px 11px',
          }}
        >
          <p className="mx-auto mb-4 w-fit rounded-full bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-mist-500">Draft · not sent yet</p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }}>
            <MessageBubble text={message || 'Your message appears here'} meta="Ready to send" />
          </motion.div>
        </div>

        {/* composer: this is what the visitor really sees, the text waiting in the box */}
        <div className="flex items-center gap-2 border-t border-white/5 bg-ink-800/90 px-3 py-2.5">
          <Smile className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate rounded-full bg-ink-900 px-3.5 py-2 text-[13px] text-mist-300">{renderWhatsAppText((message || 'Message').split('\n')[0])}</p>
          <motion.span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-tap-500 to-tap-600 text-ink-950"
            animate={reduce ? undefined : { scale: [1, 1.12, 1], boxShadow: ['0 0 0 0 rgba(34,211,238,.5)', '0 0 0 12px rgba(34,211,238,0)', '0 0 0 0 rgba(34,211,238,0)'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <SendHorizontal className="h-[18px] w-[18px]" />
          </motion.span>
        </div>
      </motion.div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-tap-400/20 bg-ink-900/80 px-3 py-2.5">
        <Link2 className="h-4 w-4 shrink-0 text-tap-400" aria-hidden="true" />
        <span className="truncate text-xs font-medium text-tap-300" title={link}>{link}</span>
      </div>
      {sample && <p className="mt-3 text-center text-xs text-mist-700">Sample preview. Fill in the form to see yours.</p>}
    </div>
  );
}
