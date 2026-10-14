'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { PageShell } from '@/components/PageShell';
import { Alert, Button, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';

function ReportForm() {
  const initial = useSearchParams().get('slug') ?? '';
  const [slug, setSlug] = useState(initial.split('/').pop() ?? '');
  const [reason, setReason] = useState('scam');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setState(null);
    try {
      const r = await api.reportLink(slug.trim().replace(/^.*\//, ''), { reason, details: details || undefined });
      setState({ tone: 'success', text: r.alreadyReported ? 'You already reported this link. Thank you.' : 'Thank you. We review reports and turn off links that break the rules.' });
    } catch (err) {
      setState({ tone: 'error', text: err instanceof ApiError ? err.message : 'Could not send the report.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6">
      <Field label="Link name or address" htmlFor="slug" hint="The part after the last slash, for example airforce-order.">
        <input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className="field" />
      </Field>
      <Field label="What is wrong?" htmlFor="reason">
        <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="field">
          <option value="scam">Scam or fraud</option>
          <option value="spam">Spam</option>
          <option value="impersonation">Pretends to be someone else</option>
          <option value="harassment">Harassment or abuse</option>
          <option value="other">Something else</option>
        </select>
      </Field>
      <Field label="Details (optional)" htmlFor="details">
        <textarea id="details" rows={4} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} className="field" />
      </Field>
      {state && <Alert tone={state.tone}>{state.text}</Alert>}
      <Button type="submit" loading={busy}>Send report</Button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <PageShell title="Report a link">
      <p className="mb-6 text-mist-500">CYMOR TAP is not for spam, scams or impersonation. Tell us about a link that breaks these rules and we will review it.</p>
      <Suspense fallback={null}>
        <ReportForm />
      </Suspense>
    </PageShell>
  );
}
