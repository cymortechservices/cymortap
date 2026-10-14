import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  variant = 'primary', loading, children, className, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={clsx(variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-danger', className)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-mist-300">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-mist-500">{hint}</p>}
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const tones = {
    error: 'border-red-400/30 bg-red-500/10 text-red-200',
    info: 'border-tap-400/30 bg-tap-400/10 text-tap-300',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  } as const;
  return <div role={tone === 'error' ? 'alert' : 'status'} className={clsx('rounded-xl border px-3.5 py-3 text-sm', tones[tone])}>{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={clsx('relative overflow-hidden rounded-xl bg-white/5', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warn' | 'bad'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-white/10 text-mist-300',
    good: 'bg-emerald-400/15 text-emerald-300',
    warn: 'bg-amber-400/15 text-amber-300',
    bad: 'bg-red-400/15 text-red-300',
  } as const;
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tap-400/10 text-tap-400">{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-mist-500">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <p className="text-sm text-red-200">{message}</p>
      {onRetry && <Button variant="ghost" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
