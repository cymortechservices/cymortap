'use client';

import { useReducedMotion } from 'framer-motion';
import { Cell, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Timeline } from '@/types/api';

const COLORS = ['#22d3ee', '#3b82f6', '#a78bfa', '#f59e0b', '#64748b'];
const tooltipStyle = { background: '#0a1224', border: '1px solid rgba(56,189,248,.3)', borderRadius: 12, color: '#e8f1ff', fontSize: 12 };

export function ClicksChart({ days }: { days: Timeline['days'] }) {
  const reduce = useReducedMotion();
  const total = days.reduce((n, d) => n + d.clicks, 0);
  if (total === 0) return <ChartEmpty text="No eligible clicks in this period yet." />;
  return (
    <div className="h-64 w-full" role="img" aria-label={`Line chart of daily clicks, ${total} eligible clicks in total`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={days} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#8aa0c2', fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} stroke="rgba(255,255,255,.1)" />
          <YAxis allowDecimals={false} tick={{ fill: '#8aa0c2', fontSize: 11 }} stroke="rgba(255,255,255,.1)" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="clicks" name="Eligible clicks" stroke="#22d3ee" strokeWidth={2.5} dot={false} isAnimationActive={!reduce} />
          <Line type="monotone" dataKey="uniqueVisitors" name="Est. unique visitors" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={!reduce} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#b4c7e4' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DevicesChart({ devices }: { devices: Timeline['devices'] }) {
  const reduce = useReducedMotion();
  const data = devices.filter((d) => d.device !== 'bot');
  if (data.length === 0) return <ChartEmpty text="No device data yet." />;
  return (
    <div className="h-64 w-full" role="img" aria-label={`Device breakdown: ${data.map((d) => `${d.device} ${d.clicks}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="clicks" nameKey="device" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none" isAnimationActive={!reduce}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#b4c7e4' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartEmpty({ text }: { text: string }) {
  return <div className="grid h-40 place-items-center rounded-xl border border-dashed border-white/10 px-4 text-center text-sm text-mist-500">{text}</div>;
}
