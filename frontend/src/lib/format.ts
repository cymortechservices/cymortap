export const formatDate = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—';

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export const formatNumber = (n: number) => new Intl.NumberFormat('en').format(n);

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function rangeForDays(days: number) {
  const to = new Date();
  const from = new Date(Date.now() - (days - 1) * 86_400_000);
  return { from: isoDay(from), to: isoDay(to) };
}

export const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
