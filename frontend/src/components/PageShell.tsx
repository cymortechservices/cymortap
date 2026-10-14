import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PageShell({ title, children, narrow = true }: { title?: string; children: ReactNode; narrow?: boolean }) {
  return (
    <>
      <Navbar />
      <main id="main" className={`section py-14 ${narrow ? 'max-w-3xl' : ''}`}>
        {title && <h1 className="mb-8 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>}
        {children}
      </main>
      <Footer />
    </>
  );
}
