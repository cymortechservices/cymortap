import type { ReactNode } from 'react';
import { Background } from './Background';
import { Logo } from './Logo';

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main id="main" className="relative grid min-h-screen place-items-center px-4 py-10">
      <Background />
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center"><Logo /></div>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-mist-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="text-center text-sm text-mist-500">{footer}</div>}
      </div>
    </main>
  );
}
