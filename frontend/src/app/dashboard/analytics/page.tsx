'use client';

import { MousePointerClick, Users } from 'lucide-react';
import { useState } from 'react';
import { ClicksChart, DevicesChart } from '@/components/dashboard/Charts';
import { RangePicker, useRange } from '@/components/dashboard/RangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import { Alert, Button, ErrorState, Skeleton } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { api, ApiError } from '@/lib/api';
import { downloadText } from '@/lib/download';

export default function AnalyticsPage() {
  const [range, setRange] = useRange(30);
  const [linkId, setLinkId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const links = useAsync(() => api.listLinks({ limit: 50, sort: 'title' }), []);
  const tl = useAsync(() => api.timeline({ ...range, linkId: linkId || undefined }), [range.from, range.to, linkId]);
  const ov = useAsync(() => api.overview(range), [range.from, range.to]);

  async function onExport() {
    setExporting(true);
    setExportError(null);
    try {
      downloadText('cymor-tap-clicks.csv', await api.exportCsv({ ...range, linkId: linkId || undefined }));
    } catch (e) {
      setExportError(e instanceof ApiError ? e.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-mist-500">Counts show eligible clicks: bots, link previews and repeat clicks within 30 seconds are removed. A click is not proof that a message was sent.</p>
        </div>
        <Button variant="ghost" loading={exporting} onClick={onExport}>Export CSV</Button>
      </div>
      {exportError && <Alert>{exportError}</Alert>}

      <div className="flex flex-wrap items-end gap-4">
        <RangePicker value={range} onChange={setRange} />
        <label className="text-xs text-mist-500">Link
          <select value={linkId} onChange={(e) => setLinkId(e.target.value)} className="field mt-1 !py-2 text-sm">
            <option value="">All links</option>
            {links.data?.items.map((l) => <option key={l.id} value={l.id}>{l.title || `/${l.slug}`}</option>)}
          </select>
        </label>
      </div>

      {tl.error ? <ErrorState message={tl.error.message} onRetry={tl.reload} /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Eligible clicks" value={tl.data?.totals.eligibleClicks ?? 0} icon={<MousePointerClick />} loading={tl.loading} />
            <StatCard label="Est. unique visitors" value={tl.data?.totals.estimatedUniqueVisitors ?? 0} icon={<Users />} loading={tl.loading} note="Estimate. Visitors are counted per day." />
          </div>
          <section className="glass rounded-2xl p-5"><h2 className="mb-3 font-display text-lg font-semibold">Clicks over time</h2>{tl.loading ? <Skeleton className="h-64" /> : <ClicksChart days={tl.data?.days ?? []} />}</section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-2xl p-5"><h2 className="mb-3 font-display text-lg font-semibold">Devices</h2>{tl.loading ? <Skeleton className="h-64" /> : <DevicesChart devices={tl.data?.devices ?? []} />}</section>
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-3 font-display text-lg font-semibold">Referral sources</h2>
              {tl.data && tl.data.referrers.length > 0 ? (
                <ul className="space-y-2 text-sm">{tl.data.referrers.map((r) => <li key={r.source} className="flex justify-between rounded-lg bg-white/5 px-3 py-2"><span>{r.source}</span><span className="font-semibold">{r.clicks}</span></li>)}</ul>
              ) : <p className="text-sm text-mist-500">No referral data in this period.</p>}
            </section>
          </div>
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">Top links</h2>
            {ov.data && ov.data.topLinks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="text-xs text-mist-500"><tr><th className="pb-2 font-medium">Link</th><th className="pb-2 text-right font-medium">Clicks</th></tr></thead>
                  <tbody>{ov.data.topLinks.map((t) => <tr key={t.id} className="border-t border-white/5"><td className="py-2.5">{t.title || `/${t.slug}`}</td><td className="py-2.5 text-right font-semibold">{t.clicks}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="text-sm text-mist-500">No clicks in this period.</p>}
          </section>
        </>
      )}
    </div>
  );
}
