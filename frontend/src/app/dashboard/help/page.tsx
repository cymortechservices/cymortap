import Link from 'next/link';

export default function HelpPage() {
  const items = [
    ['A link does not open WhatsApp', 'Open the link with ?preview=1 on the end. If the preview page loads, the link works, so check that WhatsApp is installed (or use WhatsApp Web on a computer). If the page says the link is off or expired, turn it on in My Links or create a new one.'],
    ['I changed the number but people still see the old chat', 'The link address does not change when you edit it, so the new number applies the next time someone opens it. Some apps cache link previews for a while.'],
    ['Why do my clicks look lower than expected?', 'We count eligible clicks only. Bots, link-preview fetches (when a link is pasted in a chat) and repeat clicks within 30 seconds are left out.'],
    ['A link was turned off by CYMOR TAP', 'Links reported by several people are turned off automatically. They cannot be turned on again by the owner. Contact support if you think it was a mistake.'],
    ['Does a click mean someone messaged me?', 'No. A click means the link was opened. Only WhatsApp knows whether a message was sent.'],
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Help and Support</h1>
      <div className="space-y-3">
        {items.map(([q, a]) => (
          <details key={q} className="glass rounded-2xl p-5"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-3 text-sm text-mist-500">{a}</p></details>
        ))}
      </div>
      <p className="text-sm text-mist-500">More help: <Link className="text-tap-300 underline" href="/contact">Contact and support</Link> · <Link className="text-tap-300 underline" href="/report">Report a link</Link> · <Link className="text-tap-300 underline" href="/privacy">Privacy Policy</Link></p>
    </div>
  );
}
