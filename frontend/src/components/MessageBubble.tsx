import clsx from 'clsx';
import { renderWhatsAppText } from '@/lib/waFormat';

/** A chat bubble with a tail. Used for every place a pre-filled message is displayed. */
export function MessageBubble({ text, meta, className }: { text: string; meta?: string; className?: string }) {
  return (
    <div className={clsx('relative ml-auto w-fit max-w-[92%]', className)}>
      <div className="relative whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-gradient-to-br from-tap-600 to-[#2563eb] px-4 py-3 text-[15px] leading-relaxed text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,.6)]">
        {renderWhatsAppText(text)}
        {meta && <span className="mt-1.5 block text-right text-[10.5px] font-medium tracking-wide text-white/70">{meta}</span>}
      </div>
      {/* tail */}
      <span aria-hidden="true" className="absolute -bottom-px -right-1.5 h-3 w-3 bg-[#2563eb] [clip-path:polygon(0_0,100%_100%,0_100%)]" />
    </div>
  );
}
