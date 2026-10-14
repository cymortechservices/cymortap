import { PageShell } from '@/components/PageShell';

export const metadata = { title: 'Privacy Policy' };

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2"><h2 className="font-display text-xl font-semibold">{title}</h2>{children}</section>
);

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <div className="space-y-8 text-sm leading-relaxed text-mist-300">
        <p className="text-mist-500">This is the default policy that ships with the CYMOR TAP software. The operator of this deployment should review it with a lawyer and adapt it to their jurisdiction before launch.</p>
        <S title="What we store">
          <p><strong>Links:</strong> the WhatsApp number and message you enter, the optional title and description, the link name, and when it was created or expires. These are needed to open the chat for visitors and are visible to anyone who opens the link.</p>
          <p><strong>Accounts:</strong> your name, email address and a salted password hash. We never store your password.</p>
          <p><strong>Click events (account links only):</strong> time, device type, operating system and browser category, the referring website name, campaign tags in the link address, a bot flag, and a daily-changing anonymous visitor code. We do not store IP addresses or full user-agent strings in click events.</p>
        </S>
        <S title="Guest links">
          <p>Guest links store the number and message and expire after 90 days. They are not connected to any account and click events are not collected for them.</p>
        </S>
        <S title="How the anonymous visitor code works">
          <p>To estimate unique visitors we compute a one-way code from the visitor&apos;s IP address and browser details together with a secret and the current date. The IP address is used only for that calculation and is not saved. Because the date is part of the calculation, the same person gets a different code each day, so we cannot follow someone across days. Unique visitor counts are estimates.</p>
        </S>
        <S title="Retention">
          <p>Click events are deleted automatically after 400 days. Guest links are removed 30 days after they expire. Sessions expire after 14 days. Deleting your account permanently deletes your profile, your links, their click events and reports about them.</p>
        </S>
        <S title="What analytics cannot tell you">
          <p>A click means a browser opened the link. It does not show that anyone sent a WhatsApp message, and it does not identify a person.</p>
        </S>
        <S title="Sharing">
          <p>We do not sell personal data. When someone continues to WhatsApp they leave CYMOR TAP and WhatsApp&apos;s own terms and privacy policy apply. The hosting providers used by the operator process data on our behalf.</p>
        </S>
        <S title="Your choices">
          <p>You can turn off click collection for a link, change or delete links, change your password, and delete your account at any time from the dashboard.</p>
        </S>
        <S title="Abuse prevention">
          <p>To protect the service we apply rate limits that briefly process IP addresses in memory, and we keep reports about links, including a one-way code for the reporter.</p>
        </S>
      </div>
    </PageShell>
  );
}
