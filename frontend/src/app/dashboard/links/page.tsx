'use client';

import { Link2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LinkRow } from '@/components/dashboard/LinkRow';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';

export default function MyLinksPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error, loading, reload } = useAsync(() => api.listLinks({ search: debounced, status, sort, page, limit: 8 }), [debounced, status, sort, page]);
  const filtered = Boolean(debounced || status !== 'all');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">My Links</h1>
        <Link href="/dashboard/links/new" className="btn-primary">Create a link</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search links</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, title or message" className="field !pl-9" />
        </label>
        <label><span className="sr-only">Filter by status</span>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="field">
            <option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Turned off</option>
          </select>
        </label>
        <label><span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="field">
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option>
          </select>
        </label>
      </div>

      {loading && !data ? (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : data && data.items.length === 0 ? (
        <EmptyState icon={<Link2 className="h-6 w-6" />} title={filtered ? 'No links match' : 'No links yet'} body={filtered ? 'Try a different search or filter.' : 'Create a link and it will be saved here, with its QR code and stats.'} action={!filtered ? <Link href="/dashboard/links/new" className="btn-primary mt-2">Create a link</Link> : undefined} />
      ) : (
        <>
          <ul className="space-y-3">{data?.items.map((l) => <LinkRow key={l.id} link={l} onChanged={reload} />)}</ul>
          {data && data.pages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-mist-500">Page {data.page} of {data.pages} · {data.total} links</span>
              <Button variant="ghost" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
