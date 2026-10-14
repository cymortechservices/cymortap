'use client';

import { BarChart3, HelpCircle, LayoutDashboard, Link2, LogOut, Menu, PlusCircle, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Logo } from '../Logo';
import { Skeleton } from '../ui';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/links', label: 'My Links', icon: Link2 },
  { href: '/dashboard/links/new', label: 'Create Link', icon: PlusCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help and Support', icon: HelpCircle },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (loading || !user) {
    return (
      <div className="section grid gap-4 py-10" aria-busy="true" aria-label="Loading your dashboard">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : href === '/dashboard/links' ? pathname === href || /^\/dashboard\/links\/(?!new)/.test(pathname) : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={isActive(href) ? 'page' : undefined}
          className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm transition ${isActive(href) ? 'bg-tap-400/15 text-tap-300' : 'text-mist-300 hover:bg-white/5'}`}>
          <Icon className="h-4 w-4" aria-hidden="true" /> {label}
        </Link>
      ))}
      <button type="button" onClick={async () => { await logout(); router.push('/'); }}
        className="mt-auto flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm text-mist-300 transition hover:bg-white/5">
        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-white/5 bg-ink-900/60 p-4 lg:flex">
        <div className="px-2 pt-2"><Logo href="/dashboard" /></div>
        <div className="min-h-0 flex-1">{nav}</div>
        <p className="truncate px-2 text-xs text-mist-700" title={user.email}>{user.email}</p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-ink-950/85 px-4 backdrop-blur-xl lg:hidden">
          <Logo href="/dashboard" />
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        {open && <div className="border-b border-white/5 bg-ink-900 p-4 lg:hidden">{nav}</div>}
        <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
