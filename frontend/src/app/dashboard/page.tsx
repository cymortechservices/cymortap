'use client';

import { BarChart3, Link2, MousePointerClick, Users } from 'lucide-react';
import Link from 'next/link';
import { ChartEmpty, ClicksChart } from '@/components/dashboard/Charts';
import { RangePicker, useRange } from '@/components/dashboard/RangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';

export default function OverviewPage() {
  const { user } = useAuth();
  const [range, setRange] = useRange(30);
  const ov = useAsync(() => api.overview(range), [range.from, range.to]);
  const tl = useAsync(() => api.timeline(range), [range.from, range.to]);

  const data = ov.data;
  const noLinks = data && data.totals.links === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Hi {user?.displayName.split(' ')[0]}</h1>
          <p className="text-sm text-mist-500">Here is how your links are doing.</p>
        </div>
        <Link href="/dashboard/links/new" className="btn-primary">Create a link</Link>
      </div>

      {ov.error ? <ErrorState message={ov.error.message} onRetry={ov.reload} /> : noLinks ? (
        <EmptyState icon={<Link2 className="h-6 w-6" />} title="Create your first link" body="Your saved links and their stats will show up here. It takes about ten seconds." action={<Link href="/dashboard/links/new" className="btn-primary mt-2">Create a link</Link>} />
      ) : (
        <>
          <RangePicker value={range} onChange={setRange} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Saved links" value={data?.totals.links ?? 0} icon={<Link2 />} loading={ov.loading} />
            <StatCard label="Active links" value={data?.totals.activeLinks ?? 0} icon={<BarChart3 />} loading={ov.loading} />
            <StatCard label="Eligible clicks" value={data?.totals.eligibleClicks ?? 0} icon={<MousePointerClick />} loading={ov.loading} note="Bots and repeats removed" />
            <StatCard label="Est. unique visitors" value={data?.totals.estimatedUniqueVisitors ?? 0} icon={<Users />} loading={ov.loading} note="An estimate, not a headcount" />
          </div>

          <section className="glass rounded-2xl p-5" aria-labelledby="clicks-h">
            <h2 id="clicks-h" className="mb-4 font-display text-lg font-semibold">Clicks over time</h2>
            {tl.loading ? <Skeleton className="h-64" /> : tl.error ? <ErrorState message={tl.error.message} onRetry={tl.reload} /> : <ClicksChart days={tl.data?.days ?? []} />}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-2xl p-5" aria-labelledby="top-h">
              <h2 id="top-h" className="mb-4 font-display text-lg font-semibold">Top-performing links</h2>
              {ov.loading ? <Skeleton className="h-32" /> : data && data.topLinks.length > 0 ? (
                <ol className="space-y-2">
                  {data.topLinks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                      <Link href={`/dashboard/links/${t.id}`} className="min-w-0 truncate text-tap-300 hover:underline">{t.title || `/${t.slug}`}</Link>
                      <span className="shrink-0 font-semibold">{t.clicks}</span>
                    </li>
                  ))}
                </ol>
              ) : <ChartEmpty text="No clicks yet. Share a link to see it here." />}
            </section>
            <section className="glass rounded-2xl p-5" aria-labelledby="recent-h">
              <h2 id="recent-h" className="mb-4 font-display text-lg font-semibold">Recent activity</h2>
              {ov.loading ? <Skeleton className="h-32" /> : data && data.recent.length > 0 ? (
                <ul className="space-y-2">
                  {data.recent.map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate"><span className="text-tap-300">/{r.slug}</span> <span className="text-mist-500">· {r.device} · {r.referrer}</span></span>
                      <span className="shrink-0 text-xs text-mist-700">{formatDateTime(r.at)}</span>
                    </li>
                  ))}
                </ul>
              ) : <ChartEmpty text="Nothing yet." />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
