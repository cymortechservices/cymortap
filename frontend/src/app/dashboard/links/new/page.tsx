'use client';

import { LinkForm } from '@/components/LinkForm';

export default function NewLinkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Create a link</h1>
        <p className="text-sm text-mist-500">Saved to your account. It does not expire and you can see its click stats.</p>
      </div>
      <div className="glass rounded-3xl p-5 sm:p-8"><LinkForm /></div>
    </div>
  );
}
