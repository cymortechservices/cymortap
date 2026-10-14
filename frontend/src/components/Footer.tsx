import Link from 'next/link';
import { Logo } from './Logo';

const COLS = [
  { title: 'Product', links: [{ href: '/#create', label: 'Create a link' }, { href: '/#features', label: 'Features' }, { href: '/#faq', label: 'FAQ' }] },
  { title: 'Account', links: [{ href: '/login', label: 'Sign in' }, { href: '/register', label: 'Create account' }, { href: '/dashboard', label: 'Dashboard' }] },
  { title: 'Company', links: [{ href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms of Service' }, { href: '/contact', label: 'Contact and support' }, { href: '/report', label: 'Report a link' }] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-950">
      <div className="section grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-mist-500">One tap. One conversation.</p>
          <p className="max-w-xs text-xs text-mist-700">CYMOR TAP is an independent service. It is not affiliated with, endorsed by or sponsored by WhatsApp or Meta.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-3 text-sm font-semibold text-mist-100">{c.title}</h2>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm text-mist-500 transition hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="section border-t border-white/5 py-6 text-xs text-mist-700">© {new Date().getFullYear()} CYMOR Tech Services. All rights reserved.</div>
    </footer>
  );
}
