'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Compass } from 'lucide-react';
import Link from 'next/link';
import { Background } from './Background';
import { LinkForm } from './LinkForm';

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: 'easeOut' as const } });
  return (
    <section id="top" className="relative">
      <Background />
      <div className="section pb-10 pt-14 text-center sm:pt-20">
        <motion.p {...fade(0)} className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-tap-400/25 bg-tap-400/10 px-3.5 py-1.5 text-xs font-medium text-tap-300">
          Free · No account needed to start
        </motion.p>
        <motion.h1 {...fade(0.08)} className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Your WhatsApp. One tap away.
        </motion.h1>
        <motion.p {...fade(0.16)} className="mx-auto mt-5 max-w-xl text-base text-mist-300 sm:text-lg">
          Create a personalized WhatsApp link, share it anywhere and let people start conversations with the message you choose.
        </motion.p>
        <motion.div {...fade(0.24)} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#create" className="btn-primary w-full sm:w-auto"><ArrowDown className="h-4 w-4" aria-hidden="true" /> Create My WhatsApp Link</a>
          <Link href="/#features" className="btn-ghost w-full sm:w-auto"><Compass className="h-4 w-4" aria-hidden="true" /> Explore Features</Link>
        </motion.div>
      </div>

      <div id="create" className="section pb-4">
        <motion.div {...fade(0.32)} className="glass rounded-3xl p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">Make your link</h2>
            <p className="mt-1 text-sm text-mist-500">This is the real generator. The link you get works and is saved on our servers.</p>
          </div>
          <LinkForm />
        </motion.div>
      </div>
    </section>
  );
}
