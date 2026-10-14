import Link from 'next/link';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="cymor-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M32 5C17.1 5 5 16.2 5 30c0 6.3 2.5 12 6.6 16.4L9 58l12.6-4.6c3 1 6.2 1.6 9.4 1.6 14.9 0 27-11.2 27-25S46.9 5 32 5z" fill="url(#cymor-g)" />
      <path d="M25 36l-3.2 3.2a5.2 5.2 0 0 0 7.4 7.4l4.5-4.5a5.2 5.2 0 0 0 0-7.4M39 28l3.2-3.2a5.2 5.2 0 0 0-7.4-7.4l-4.5 4.5a5.2 5.2 0 0 0 0 7.4" fill="none" stroke="#04101f" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="CYMOR TAP home">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">
        CYMOR <span className="text-tap-400">TAP</span>
      </span>
    </Link>
  );
}
