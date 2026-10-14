'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Button, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { registerSchema } from '@/lib/schemas';

type Values = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(v: Values) {
    setError(null);
    try {
      const { user } = await api.register(v);
      setUser(user);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not create your account. Please try again.');
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Save links, edit them later and see how many people open them. Free." footer={<>Already have an account? <Link className="text-tap-300 underline" href="/login">Sign in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Your name" htmlFor="name" error={errors.displayName?.message}>
          <input id="name" autoComplete="name" className="field" {...register('displayName')} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className="field" {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 10 characters. A few random words works well.">
          <input id="password" type="password" autoComplete="new-password" className="field" {...register('password')} />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
        <p className="text-center text-xs text-mist-500">By creating an account you agree to the <Link className="underline" href="/terms">Terms</Link> and <Link className="underline" href="/privacy">Privacy Policy</Link>.</p>
      </form>
    </AuthCard>
  );
}
