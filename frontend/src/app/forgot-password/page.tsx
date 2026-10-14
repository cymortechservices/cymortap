'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Button, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { forgotSchema } from '@/lib/schemas';

type Values = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [result, setResult] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(v: Values) {
    setResult(null);
    try {
      const r = await api.forgotPassword(v.email);
      // The server states plainly whether reset email can be sent at all.
      setResult({ tone: r.emailDelivery === 'enabled' ? 'info' : 'error', text: r.message });
    } catch (e) {
      setResult({ tone: 'error', text: e instanceof ApiError ? e.message : 'Something went wrong. Please try again.' });
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="Enter your email and we will send a reset link if the service can send email." footer={<Link className="text-tap-300 underline" href="/login">Back to sign in</Link>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className="field" {...register('email')} />
        </Field>
        {result && <Alert tone={result.tone}>{result.text}</Alert>}
        <Button type="submit" loading={isSubmitting} className="w-full">Send reset link</Button>
      </form>
    </AuthCard>
  );
}
