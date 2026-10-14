import { PageShell } from '@/components/PageShell';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <div className="space-y-6 text-sm leading-relaxed text-mist-300">
        <p className="text-mist-500">This is the default terms text that ships with the CYMOR TAP software. The operator should review it with a lawyer before launch.</p>
        <p><strong>What CYMOR TAP is.</strong> A tool that creates short links which open a WhatsApp chat with a message already typed in. CYMOR TAP is independent and is not affiliated with WhatsApp or Meta.</p>
        <p><strong>Acceptable use.</strong> Do not use links for spam, scams, phishing, harassment, impersonation, illegal content, or to contact people who have not agreed to hear from you. Do not use CYMOR TAP for bulk or automated messaging. Only use numbers you are allowed to share.</p>
        <p><strong>Enforcement.</strong> We may disable links, restrict creation or suspend accounts that break these terms or that people report as abusive. Links turned off after a report cannot be re-enabled by their owner.</p>
        <p><strong>Your content.</strong> You are responsible for the numbers and messages you publish. Anyone who opens a link can see the number and the message.</p>
        <p><strong>Guest links.</strong> Guest links expire after 90 days, cannot be edited or tracked, and may be removed after they expire.</p>
        <p><strong>No guarantees.</strong> The service is provided as is. We do not promise uninterrupted availability, that a number is on WhatsApp, or that anyone will send a message after opening a link.</p>
        <p><strong>Accounts.</strong> Keep your password private. You can delete your account at any time; this permanently deletes your links and their analytics.</p>
      </div>
    </PageShell>
  );
}
