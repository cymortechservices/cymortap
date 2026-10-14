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
import { loginSchema } from '@/lib/schemas';

type Values = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(v: Values) {
    setError(null);
    try {
      const { user } = await api.login(v);
      setUser(user);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not sign in. Please try again.');
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your links and see your stats." footer={<>New here? <Link className="text-tap-300 underline" href="/register">Create an account</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className="field" {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <input id="password" type="password" autoComplete="current-password" className="field" {...register('password')} />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
        <p className="text-center text-sm"><Link className="text-tap-300 underline" href="/forgot-password">Forgot your password?</Link></p>
      </form>
    </AuthCard>
  );
}
