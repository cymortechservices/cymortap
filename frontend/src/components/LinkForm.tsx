'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bold, ChevronDown, Code2, Info, Italic, Strikethrough, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { GUEST_TTL_DAYS, MAX_MESSAGE_LENGTH, SHORT_LINK_BASE } from '@/lib/config';
import { countryOptions, validatePhone } from '@/lib/phone';
import { linkFormSchema, type LinkFormValues } from '@/lib/schemas';
import { TEMPLATE_CATEGORIES } from '@/lib/templates';
import type { CreateLinkResponse, LinkDto } from '@/types/api';
import { ChatPreview } from './ChatPreview';
import { LinkResult } from './LinkResult';
import { Alert, Button, Field } from './ui';

interface Props {
  mode?: 'create' | 'edit';
  initial?: Partial<LinkFormValues>;
  linkId?: string;
  onSaved?: (link: LinkDto) => void;
}

const SAMPLE = { phone: '+254 712 345 678', message: 'Hi there! I want to order Air Force 1 shoes.' };

export function LinkForm({ mode = 'create', initial, linkId, onSaved }: Props) {
  const { user } = useAuth();
  const countries = useMemo(() => countryOptions(), []);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showMore, setShowMore] = useState(Boolean(initial?.title || initial?.description));
  const [category, setCategory] = useState<string>('');
  const [slugState, setSlugState] = useState<{ ok: boolean; text: string } | null>(null);

  const {
    register, handleSubmit, watch, setValue, setError, reset, formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: { country: 'KE', phone: '', message: '', title: '', description: '', slug: '', ...initial },
  });

  const messageReg = register('message');
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function edit(fn: (value: string, start: number, end: number) => { value: string; start: number; end: number }) {
    const ta = taRef.current;
    if (!ta) return;
    const next = fn(ta.value, ta.selectionStart, ta.selectionEnd);
    setValue('message', next.value, { shouldValidate: true, shouldDirty: true });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(next.start, next.end);
    });
  }
  const wrapSelection = (marker: string) =>
    edit((v, a, b) => {
      const sel = v.slice(a, b) || 'text';
      return { value: v.slice(0, a) + marker + sel + marker + v.slice(b), start: a + marker.length, end: a + marker.length + sel.length };
    });
  const insertText = (t: string) => edit((v, a, b) => ({ value: v.slice(0, a) + t + v.slice(b), start: a + t.length, end: a + t.length }));

  const country = watch('country');
  const phone = watch('phone');
  const message = watch('message') ?? '';
  const slug = watch('slug');
  const phoneCheck = useMemo(() => (phone && phone.length > 3 ? validatePhone(phone, country) : null), [phone, country]);
  const dial = countries.find((c) => c.code === country)?.dial;

  // Debounced availability hint. The server still enforces uniqueness on save.
  useEffect(() => {
    if (mode === 'edit' || !slug) {
      setSlugState(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await api.checkSlug(slug);
        setSlugState({ ok: r.available, text: r.available ? 'Available' : r.message ?? 'Not available' });
      } catch {
        setSlugState(null);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [slug, mode]);

  const previewLink = `${SHORT_LINK_BASE}/${slug || 'your-link'}`;

  async function onSubmit(values: LinkFormValues) {
    setFormError(null);
    setSaved(false);
    try {
      const payload = {
        country: values.country,
        phone: values.phone,
        message: values.message,
        title: values.title || undefined,
        description: values.description || undefined,
      };
      if (mode === 'edit' && linkId) {
        const { link } = await api.updateLink(linkId, { ...payload, title: values.title ?? '', description: values.description ?? '' });
        setSaved(true);
        onSaved?.(link);
      } else {
        setResult(await api.createLink({ ...payload, slug: values.slug || undefined }));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        let mapped = false;
        for (const [field, msg] of Object.entries(err.fields ?? {})) {
          if (['phone', 'message', 'slug', 'title', 'description', 'country'].includes(field)) {
            setError(field as keyof LinkFormValues, { message: msg });
            mapped = true;
          }
        }
        if (!mapped) setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  if (result) {
    return <LinkResult result={result} onReset={() => { setResult(null); reset(); }} />;
  }

  const templates = TEMPLATE_CATEGORIES.find((c) => c.id === category)?.messages ?? [];
  const hasInput = Boolean(phone || message);
  const phoneLabel = phoneCheck?.international ?? (phone ? phone : SAMPLE.phone);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 md:grid-cols-[1fr_300px]" aria-label={mode === 'edit' ? 'Edit link' : 'Create a WhatsApp link'}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <Field label="Country" htmlFor="country" error={errors.country?.message}>
            <select id="country" className="field" {...register('country')}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} (+{c.dial})</option>
              ))}
            </select>
          </Field>
          <Field
            label="WhatsApp number"
            htmlFor="phone"
            error={errors.phone?.message}
            hint={phoneCheck ? (phoneCheck.valid ? `Looks valid: ${phoneCheck.international}. We cannot check that it is on WhatsApp.` : 'This does not look like a valid number for the chosen country.') : dial ? `Enter the number with or without +${dial}.` : undefined}
          >
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" className={`field ${errors.phone ? 'field-error' : ''}`} aria-invalid={Boolean(errors.phone)} {...register('phone')} />
          </Field>
        </div>

        <div className="space-y-2">
          <Field label="Pre-filled message" htmlFor="message" error={errors.message?.message}>
            <div className={`overflow-hidden rounded-xl border bg-ink-900/80 transition focus-within:border-tap-400/70 focus-within:ring-2 focus-within:ring-tap-400/30 ${errors.message ? 'border-red-400/60' : 'border-white/10'}`}>
              <div className="flex flex-wrap items-center gap-1 border-b border-white/5 px-2 py-1.5" role="toolbar" aria-label="Message formatting">
                {[
                  { label: 'Bold', icon: Bold, marker: '*' },
                  { label: 'Italic', icon: Italic, marker: '_' },
                  { label: 'Strikethrough', icon: Strikethrough, marker: '~' },
                  { label: 'Monospace', icon: Code2, marker: '```' },
                ].map(({ label, icon: Icon, marker }) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={() => wrapSelection(marker)} className="grid h-9 w-9 place-items-center rounded-lg text-mist-300 transition hover:bg-white/10 hover:text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
                {['👋', '🙌', '😊', '🔥', '🛍️', '📅', '✅', '🙏'].map((e) => (
                  <button key={e} type="button" aria-label={`Insert ${e}`} onClick={() => insertText(e)} className="grid h-9 w-9 place-items-center rounded-lg text-base transition hover:bg-white/10">{e}</button>
                ))}
              </div>
              <textarea
                id="message"
                rows={5}
                placeholder="Hi there! I want to order Air Force 1 shoes."
                className="w-full resize-y bg-transparent px-3.5 py-3 text-base leading-relaxed text-mist-100 placeholder:text-mist-700 focus:outline-none"
                aria-invalid={Boolean(errors.message)}
                {...messageReg}
                ref={(el) => {
                  messageReg.ref(el);
                  taRef.current = el;
                }}
              />
            </div>
          </Field>
          <div className="flex items-center justify-between text-xs text-mist-500">
            <span>Emojis, line breaks and *bold* / _italic_ / ~strike~ are kept.</span>
            <span className={message.length > MAX_MESSAGE_LENGTH ? 'text-red-300' : ''} aria-live="polite">{message.length}/{MAX_MESSAGE_LENGTH}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-mist-300"><Wand2 className="h-4 w-4 text-tap-400" aria-hidden="true" /> Start from a template</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Template categories">
            {TEMPLATE_CATEGORIES.map((c) => (
              <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
                className={`min-h-[36px] rounded-full border px-3 text-xs font-medium transition ${category === c.id ? 'border-tap-400 bg-tap-400/15 text-tap-300' : 'border-white/10 bg-white/5 text-mist-300 hover:bg-white/10'}`}>
                {c.label}
              </button>
            ))}
          </div>
          {templates.length > 0 && (
            <div className="grid gap-2">
              {templates.map((t) => (
                <button key={t} type="button" onClick={() => setValue('message', t, { shouldValidate: true, shouldDirty: true })}
                  className="rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2.5 text-left text-sm text-mist-300 transition hover:border-tap-400/40">
                  {t}
                </button>
              ))}
              <p className="text-xs text-mist-700">Tap a template to fill the message. You can edit it afterwards.</p>
            </div>
          )}
        </div>

        <div>
          <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore} className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-tap-300">
            <ChevronDown className={`h-4 w-4 transition ${showMore ? 'rotate-180' : ''}`} aria-hidden="true" /> {mode === 'edit' ? 'Title and description' : 'Customize link name, title and description'}
          </button>
          {showMore && (
            <div className="mt-3 space-y-4">
              {mode === 'create' && (
                <Field label="Custom link name (optional)" htmlFor="slug" error={errors.slug?.message} hint={`Your link will look like ${previewLink}`}>
                  <input id="slug" autoComplete="off" autoCapitalize="none" placeholder="airforce-order" className={`field ${errors.slug ? 'field-error' : ''}`} {...register('slug')} />
                  {slugState && <p className={`mt-1 text-xs ${slugState.ok ? 'text-emerald-300' : 'text-red-300'}`} aria-live="polite">{slugState.text}</p>}
                </Field>
              )}
              <Field label="Link title (optional)" htmlFor="title" error={errors.title?.message}>
                <input id="title" className="field" placeholder="Order shoes from Amina" {...register('title')} />
              </Field>
              <Field label="Short description (optional)" htmlFor="description" error={errors.description?.message}>
                <input id="description" className="field" placeholder="Fast replies, 9am to 6pm" {...register('description')} />
              </Field>
            </div>
          )}
        </div>

        {mode === 'edit' && <Alert tone="info">Changing the number or message changes where your existing link sends people from now on. The link address stays the same.</Alert>}
        {mode === 'create' && (
          <p className="flex items-start gap-2 text-xs text-mist-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-tap-400" aria-hidden="true" />
            {user
              ? 'This link is saved to your account, does not expire, and you can edit it and see click stats.'
              : `No account needed. Guest links work for ${GUEST_TTL_DAYS} days, are not saved to a dashboard, and cannot be edited or tracked. Sign in first if you want that.`}
          </p>
        )}
        {formError && <Alert>{formError}</Alert>}
        {saved && <Alert tone="success">Changes saved.</Alert>}

        <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
          {mode === 'edit' ? 'Save changes' : 'Create My WhatsApp Link'}
        </Button>
      </div>

      <div className="md:pt-7">
        <ChatPreview phoneLabel={phoneLabel} message={hasInput ? message : SAMPLE.message} link={previewLink} sample={!hasInput} />
      </div>
    </form>
  );
}
