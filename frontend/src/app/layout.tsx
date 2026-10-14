import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CYMOR TAP — One tap. One conversation.', template: '%s · CYMOR TAP' },
  description: 'Create a branded link that opens a WhatsApp chat with the message you choose. Free, no account needed. Track clicks and make QR codes with an account.',
  applicationName: 'CYMOR TAP',
};

export const viewport: Viewport = { themeColor: '#04070f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-tap-500 focus:px-3 focus:py-2 focus:text-ink-950">
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
