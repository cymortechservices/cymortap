'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Button, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { resetSchema } from '@/lib/schemas';

type Values = z.infer<typeof resetSchema>;

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(resetSchema) });

  if (!token) return <Alert>This page needs a reset link from your email. <Link className="underline" href="/forgot-password">Request a new one</Link>.</Alert>;

  async function onSubmit(v: Values) {
    setError(null);
    try {
      await api.resetPassword(token, v.password);
      setDone(true);
      setTimeout(() => router.push('/login'), 1800);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reset your password.');
    }
  }

  if (done) return <Alert tone="success">Password changed. Taking you to sign in.</Alert>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field label="New password" htmlFor="password" error={errors.password?.message} hint="At least 10 characters.">
        <input id="password" type="password" autoComplete="new-password" className="field" {...register('password')} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={isSubmitting} className="w-full">Set new password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" footer={<Link className="text-tap-300 underline" href="/login">Back to sign in</Link>}>
      <Suspense fallback={<p className="text-sm text-mist-500">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthCard>
  );
}
