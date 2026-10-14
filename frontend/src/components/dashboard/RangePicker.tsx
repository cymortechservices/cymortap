'use client';

import { useState } from 'react';
import { rangeForDays } from '@/lib/format';

export interface Range { from: string; to: string }

export function useRange(days = 30) {
  return useState<Range>(rangeForDays(days));
}

const PRESETS = [7, 30, 90];

export function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex gap-2" role="group" aria-label="Date range presets">
        {PRESETS.map((d) => {
          const r = rangeForDays(d);
          const active = value.from === r.from && value.to === r.to;
          return (
            <button key={d} type="button" aria-pressed={active} onClick={() => onChange(r)}
              className={`min-h-[40px] rounded-xl border px-3.5 text-sm transition ${active ? 'border-tap-400 bg-tap-400/15 text-tap-300' : 'border-white/10 bg-white/5 text-mist-300 hover:bg-white/10'}`}>
              {d} days
            </button>
          );
        })}
      </div>
      <label className="text-xs text-mist-500">From
        <input type="date" value={value.from} max={value.to} onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })} className="field mt-1 !py-2 text-sm" />
      </label>
      <label className="text-xs text-mist-500">To
        <input type="date" value={value.to} min={value.from} onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })} className="field mt-1 !py-2 text-sm" />
      </label>
    </div>
  );
}
