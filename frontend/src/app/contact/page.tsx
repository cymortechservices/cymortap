import { PageShell } from '@/components/PageShell';
import Link from 'next/link';

export const metadata = { title: 'Contact and support' };

export default function ContactPage() {
  return (
    <PageShell title="Contact and support">
      <div className="space-y-6 text-mist-300">
        <p>Need help with a link, your account or your data? Start with the answers below, then get in touch.</p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Quick answers are in the <Link className="text-tap-300 underline" href="/#faq">FAQ</Link>.</li>
          <li>To report a scam, spam or impersonation, use <Link className="text-tap-300 underline" href="/report">Report a link</Link>.</li>
          <li>If a link does not open WhatsApp, add <code className="rounded bg-white/10 px-1">?preview=1</code> to its address and use the Continue button.</li>
          <li>Account owners can delete their account and all link data from Settings in the dashboard.</li>
        </ul>
        <p className="text-sm text-mist-500">
          For anything else, email the CYMOR Tech Services support address configured for this deployment. The operator of this site sets that address; it is not hard-coded in the software.
        </p>
      </div>
    </PageShell>
  );
}
