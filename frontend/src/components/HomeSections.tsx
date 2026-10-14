import {
  BarChart3, CalendarCheck, GraduationCap, HeartHandshake, LayoutDashboard, Link2, MessageSquareText, PartyPopper,
  QrCode, ShieldCheck, ShoppingBag, Sparkles, Share2, Star, Briefcase, LifeBuoy, Mic,
} from 'lucide-react';
import type { ReactNode } from 'react';

function Heading({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2 id={id} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-mist-500">{sub}</p>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: <MessageSquareText />, title: 'Enter a number and message', body: 'Pick a country, add the WhatsApp number and write what people should start the chat with.' },
    { icon: <Link2 />, title: 'Generate a branded link', body: 'We save it and give you a short CYMOR TAP link, plus a QR code that points to the same link.' },
    { icon: <Share2 />, title: 'Share it and let people start a conversation', body: 'Put it in a bio, a poster or a chat. One tap opens WhatsApp with your message ready.' },
  ];
  return (
    <section id="how" aria-labelledby="how-h" className="section pt-24">
      <Heading id="how-h" title="How it works" sub="Three steps. No account for the basics." />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-tap-400/10 text-tap-400 [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">{s.icon}</span>
              <span className="text-sm font-medium text-mist-500">Step {i + 1}</span>
            </div>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-mist-500">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Features() {
  const items: { icon: ReactNode; title: string; body: string }[] = [
    { icon: <Sparkles />, title: 'Create a WhatsApp link in seconds', body: 'Number, message, done. Numbers are checked for the right country format before anything is saved.' },
    { icon: <MessageSquareText />, title: 'Personalize the message', body: 'Use templates for orders, bookings, support and more, then change every word. Emojis and line breaks work.' },
    { icon: <Share2 />, title: 'Share your link anywhere', body: 'Bios, posts, email signatures, flyers and chats. On phones you get the native share sheet.' },
    { icon: <BarChart3 />, title: 'Track clicks with an account', body: 'See how many people opened your link, when, and on what kind of device. Estimates and filters are labelled honestly.' },
    { icon: <QrCode />, title: 'Generate QR codes', body: 'Download a print-ready QR code for every link. It points to your CYMOR TAP link, so you can change the destination later.' },
    { icon: <LayoutDashboard />, title: 'Manage all links in one dashboard', body: 'Search, edit, turn off or delete links. Only you can see or change the links in your account.' },
    { icon: <HeartHandshake />, title: 'Links for different purposes', body: 'Keep one link for sales, one for support and one for your study group, each with its own message and stats.' },
  ];
  return (
    <section id="features" aria-labelledby="features-h" className="section pt-24">
      <Heading id="features-h" title="Everything you need to start the conversation" sub="Free to create. Sign in only when you want to save, edit and track." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <li key={f.title} className="glass rounded-2xl p-6">
            <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-tap-400/10 text-tap-400 [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">{f.icon}</span>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-mist-500">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UseCases() {
  const cases = [
    { icon: <ShoppingBag />, title: 'Orders and shopping', msg: 'Hi there! I want to order Air Force 1 shoes.' },
    { icon: <LifeBuoy />, title: 'Customer enquiries', msg: 'Hello, I would like to enquire about your services.' },
    { icon: <Mic />, title: 'Personal greetings', msg: 'Hey! Great to meet you. Here is my number.' },
    { icon: <Briefcase />, title: 'Freelance services', msg: 'Hey! I saw your page and would love to collaborate.' },
    { icon: <GraduationCap />, title: 'Student groups', msg: 'Hi, I am interested in joining your study group.' },
    { icon: <PartyPopper />, title: 'Events and invitations', msg: 'Hi! I would love to RSVP for the event on Saturday.' },
    { icon: <Star />, title: 'Feedback and support', msg: 'Hello! I would like to share some feedback.' },
    { icon: <Sparkles />, title: 'Content creators', msg: 'Hi! I loved your latest video. Can we chat about a partnership?' },
    { icon: <CalendarCheck />, title: 'Appointments and bookings', msg: 'Hello! Can you help me with my booking?' },
  ];
  return (
    <section id="use-cases" aria-labelledby="uc-h" className="section pt-24">
      <Heading id="uc-h" title="Made for anyone who wants a DM" sub="Not just businesses. If someone should be able to message you with one tap, this is for you." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <li key={c.title} className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-tap-400/10 text-tap-400 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{c.icon}</span>
              <h3 className="font-semibold">{c.title}</h3>
            </div>
            <p className="rounded-xl rounded-tr-sm bg-tap-600/20 px-3 py-2.5 text-sm text-mist-300">“{c.msg}”</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Trust() {
  const points = [
    ['A click is not a sent message', 'Our counts show how many people opened your link. They cannot tell whether anyone pressed send in WhatsApp.'],
    ['Guest and account links differ', 'Guest links work for 90 days and cannot be edited, turned off or tracked. Account links can be managed and tracked, and do not expire.'],
    ['Analytics belong to the owner', 'Only the signed-in owner of a saved link can see its statistics. Visitors cannot look them up.'],
    ['Visitor data stays minimal', 'We do not store IP addresses with click events. Read the Privacy Policy for exactly what is kept and for how long.'],
  ];
  return (
    <section aria-labelledby="trust-h" className="section pt-24">
      <div className="glass rounded-3xl p-6 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-tap-400" aria-hidden="true" />
          <h2 id="trust-h" className="font-display text-2xl font-bold sm:text-3xl">Straight answers about trust and privacy</h2>
        </div>
        <dl className="grid gap-6 md:grid-cols-2">
          {points.map(([t, b]) => (
            <div key={t}>
              <dt className="font-semibold">{t}</dt>
              <dd className="mt-1 text-sm text-mist-500">{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const FAQS = [
  ['Can I create a link without an account?', 'Yes. Guest links need no sign-up. They work for 90 days and cannot be edited, turned off or tracked. Create an account for saved links.'],
  ['Which phone numbers work?', 'Any valid international number. Choose the country, or start the number with + and the country code, for example +254 for Kenya. We check the format, but we cannot tell whether the number is registered on WhatsApp.'],
  ['Can I write my own message?', 'Yes. Templates are only a starting point. You can use emojis and line breaks, up to 1000 characters.'],
  ['Can I choose my own link name?', 'Yes, under customize. Use 3–40 letters, numbers or hyphens. Names that are already taken or reserved are refused.'],
  ['Do links expire?', 'Guest links expire after 90 days. Links in an account do not expire, but you can turn them off or delete them whenever you like.'],
  ['What do click analytics show?', 'With an account you see clicks over time, device types and referral sources. Bots, link previews and rapid repeats are filtered out, and unique visitors are estimates. A click does not prove a message was sent.'],
  ['How do QR codes work?', 'Each link has a QR code that points to your CYMOR TAP link. Download it as a high-resolution image for print or screens.'],
  ['Can I change where a link goes?', 'Account owners can edit the number and message while keeping the same link and QR code. Guest links cannot be changed.'],
  ['What about privacy?', 'We keep the minimum needed to run the service and do not store IP addresses with click events. See the Privacy Policy for details and retention periods.'],
  ['A link does not open WhatsApp. What can I try?', 'Add ?preview=1 to the end of the link to see the destination and use the Continue button. Check that WhatsApp is installed on mobile, or use WhatsApp Web on a computer. If the page says the link is off or expired, ask the owner for a new one.'],
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="section pt-24">
      <Heading id="faq-h" title="Frequently asked questions" sub="Short, honest answers." />
      <div className="space-y-3">
        {FAQS.map(([q, a]) => (
          <details key={q} className="glass group rounded-2xl p-5 open:border-tap-400/30">
            <summary className="flex min-h-[28px] cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {q}
              <span aria-hidden="true" className="text-tap-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-mist-500">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
