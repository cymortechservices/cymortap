'use client';

import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { formatNumber } from '@/lib/format';
import { Skeleton } from '../ui';

export function StatCard({ label, value, icon, note, loading }: { label: string; value: number; icon: ReactNode; note?: string; loading?: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduce) return setShown(value);
    const controls = animate(0, value, { duration: 0.8, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between text-sm text-mist-500">
        <span>{label}</span>
        <span className="text-tap-400 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{icon}</span>
      </div>
      {loading ? <Skeleton className="mt-3 h-9 w-24" /> : <p className="mt-2 font-display text-3xl font-bold" aria-label={`${label}: ${formatNumber(value)}`}>{formatNumber(shown)}</p>}
      {note && <p className="mt-1 text-xs text-mist-700">{note}</p>}
    </div>
  );
}
