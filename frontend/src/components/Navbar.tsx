'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Logo } from './Logo';

const LINKS = [
  { href: '/#top', label: 'Home' },
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#use-cases', label: 'Use cases' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/75 backdrop-blur-xl">
      <div className="section flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-mist-300 transition hover:text-white">{l.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {!loading && user ? (
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Sign in</Link>
              <Link href="/register" className="btn-ghost">Create account</Link>
            </>
          )}
          <Link href="/#create" className="btn-primary">Create Your Link</Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-white/5 bg-ink-950 lg:hidden">
          <nav aria-label="Mobile" className="section flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className="rounded-lg px-3 py-3 text-mist-300 hover:bg-white/5">{l.label}</Link>
            ))}
            <div className="mt-3 grid gap-2">
              <Link href="/#create" onClick={close} className="btn-primary">Create Your Link</Link>
              {!loading && user ? (
                <Link href="/dashboard" onClick={close} className="btn-ghost">Dashboard</Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={close} className="btn-ghost">Sign in</Link>
                  <Link href="/register" onClick={close} className="btn-ghost">Create account</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
