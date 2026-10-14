import Link from 'next/link';
import { PageShell } from '@/components/PageShell';

export default function NotFound() {
  return (
    <PageShell title="Page not found">
      <p className="text-mist-500">That page does not exist. Check the address, or go back to the start.</p>
      <Link href="/" className="btn-primary mt-6">Back to CYMOR TAP</Link>
    </PageShell>
  );
}
