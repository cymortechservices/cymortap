'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ClicksChart, DevicesChart } from '@/components/dashboard/Charts';
import { RangePicker, useRange } from '@/components/dashboard/RangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import { LinkForm } from '@/components/LinkForm';
import { Button, ErrorState, Skeleton } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { downloadText } from '@/lib/download';
import { BarChart3, MousePointerClick, Users } from 'lucide-react';

export default function EditLinkPage() {
  const { id } = useParams<{ id: string }>();
  const [range, setRange] = useRange(30);
  const [exporting, setExporting] = useState(false);
  const link = useAsync(() => api.getLink(id), [id]);
  const stats = useAsync(() => api.linkAnalytics(id, range), [id, range.from, range.to]);

  if (link.loading) return <Skeleton className="h-96" />;
  if (link.error || !link.data) return <ErrorState message={link.error?.message ?? 'Link not found.'} onRetry={link.reload} />;
  const l = link.data.link;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/dashboard/links" className="text-sm text-tap-300 hover:underline">← My Links</Link>
        <h1 className="mt-2 font-display text-3xl font-bold">{l.title || `/${l.slug}`}</h1>
        <p className="text-sm text-mist-500">{l.shortUrl}</p>
      </div>

      <section className="glass rounded-3xl p-5 sm:p-8" aria-labelledby="edit-h">
        <h2 id="edit-h" className="mb-5 font-display text-xl font-semibold">Edit link</h2>
        <LinkForm
          mode="edit"
          linkId={l.id}
          initial={{ country: 'KE', phone: `+${l.phone}`, message: l.message, title: l.title ?? '', description: l.description ?? '' }}
          onSaved={() => link.reload()}
        />
      </section>

      <section id="stats" className="space-y-5" aria-labelledby="stats-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="stats-h" className="font-display text-xl font-semibold">Stats for this link</h2>
          <Button variant="ghost" loading={exporting} onClick={async () => {
            setExporting(true);
            try { downloadText(`cymor-tap-${l.slug}.csv`, await api.exportCsv({ ...range, linkId: l.id })); } finally { setExporting(false); }
          }}>Export CSV</Button>
        </div>
        <RangePicker value={range} onChange={setRange} />
        {stats.error ? <ErrorState message={stats.error.message} onRetry={stats.reload} /> : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Eligible clicks" value={stats.data?.totals.eligibleClicks ?? 0} icon={<MousePointerClick />} loading={stats.loading} note="Bots and repeats removed" />
              <StatCard label="Est. unique visitors" value={stats.data?.totals.estimatedUniqueVisitors ?? 0} icon={<Users />} loading={stats.loading} note="An estimate" />
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><BarChart3 className="h-4 w-4 text-tap-400" aria-hidden="true" /> Clicks over time</h3>
              {stats.loading ? <Skeleton className="h-64" /> : <ClicksChart days={stats.data?.days ?? []} />}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass rounded-2xl p-5"><h3 className="mb-3 font-semibold">Devices</h3>{stats.loading ? <Skeleton className="h-64" /> : <DevicesChart devices={stats.data?.devices ?? []} />}</div>
              <div className="glass rounded-2xl p-5">
                <h3 className="mb-3 font-semibold">Where clicks came from</h3>
                {stats.data && stats.data.referrers.length > 0 ? (
                  <ul className="space-y-2 text-sm">{stats.data.referrers.map((r) => <li key={r.source} className="flex justify-between rounded-lg bg-white/5 px-3 py-2"><span>{r.source}</span><span className="font-semibold">{r.clicks}</span></li>)}</ul>
                ) : <p className="text-sm text-mist-500">No referral data yet. “direct” means no referring site was sent.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
