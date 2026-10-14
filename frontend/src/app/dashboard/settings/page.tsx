'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.displayName ?? '');
  const [analyticsDefault, setAnalyticsDefault] = useState(user?.preferences.defaultAnalyticsEnabled ?? true);
  const [profileState, setProfileState] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwState, setPwState] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [delPw, setDelPw] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [busy, setBusy] = useState('');

  if (!user) return null;

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy('profile');
    setProfileState(null);
    try {
      const r = await api.updateProfile({ displayName: name, preferences: { defaultAnalyticsEnabled: analyticsDefault } });
      setUser(r.user);
      setProfileState({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setProfileState({ tone: 'error', text: msg(err) });
    } finally {
      setBusy('');
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setBusy('pw');
    setPwState(null);
    try {
      await api.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      setPwState({ tone: 'success', text: 'Password changed. Your other devices were signed out.' });
    } catch (err) {
      setPwState({ tone: 'error', text: msg(err) });
    } finally {
      setBusy('');
    }
  }

  async function deleteAccount() {
    setBusy('delete');
    setDelError(null);
    try {
      await api.deleteAccount(delPw);
      setUser(null);
      router.push('/');
    } catch (err) {
      setDelError(msg(err));
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Account Settings</h1>

      <form onSubmit={saveProfile} className="glass space-y-4 rounded-2xl p-5 sm:p-6" aria-labelledby="profile-h">
        <h2 id="profile-h" className="font-display text-lg font-semibold">Profile and privacy</h2>
        <Field label="Name" htmlFor="name"><input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={80} /></Field>
        <Field label="Email" htmlFor="email" hint="Email cannot be changed yet."><input id="email" value={user.email} readOnly className="field opacity-70" /></Field>
        <label className="flex min-h-[44px] items-start gap-3 text-sm">
          <input type="checkbox" checked={analyticsDefault} onChange={(e) => setAnalyticsDefault(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
          <span><span className="font-medium">Collect click analytics on new links</span><br /><span className="text-mist-500">You can still change this for each link. Existing links keep their setting.</span></span>
        </label>
        {profileState && <Alert tone={profileState.tone}>{profileState.text}</Alert>}
        <Button type="submit" loading={busy === 'profile'}>Save profile</Button>
      </form>

      <form onSubmit={changePassword} className="glass space-y-4 rounded-2xl p-5 sm:p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" className="font-display text-lg font-semibold">Change password</h2>
        <Field label="Current password" htmlFor="cur"><input id="cur" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className="field" /></Field>
        <Field label="New password" htmlFor="new" hint="At least 10 characters."><input id="new" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className="field" /></Field>
        {pwState && <Alert tone={pwState.tone}>{pwState.text}</Alert>}
        <Button type="submit" loading={busy === 'pw'}>Change password</Button>
      </form>

      <section className="glass space-y-3 rounded-2xl p-5 sm:p-6" aria-labelledby="sec-h">
        <h2 id="sec-h" className="font-display text-lg font-semibold">Security and data</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-mist-300">
          <li>Signed in on this device. Sessions last 14 days and end when you log out or change your password.</li>
          <li>Account created {formatDate(user.createdAt)}.</li>
          <li>Click events are deleted automatically after 400 days. We do not store IP addresses with them.</li>
          <li>Deleting your account permanently deletes your links, their stats and your profile.</li>
        </ul>
        <Button variant="ghost" onClick={async () => { await logout(); router.push('/'); }}>Log out</Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-red-400/20 bg-red-500/5 p-5 sm:p-6" aria-labelledby="del-h">
        <h2 id="del-h" className="font-display text-lg font-semibold text-red-100">Delete account</h2>
        <p className="text-sm text-red-100/80">This permanently deletes your account, every link you created and all their analytics. Your short links and QR codes stop working immediately. This cannot be undone.</p>
        {!confirmDel ? (
          <Button variant="danger" onClick={() => setConfirmDel(true)}>Delete my account</Button>
        ) : (
          <div className="space-y-3">
            <Field label="Enter your password to confirm" htmlFor="delpw"><input id="delpw" type="password" autoComplete="current-password" value={delPw} onChange={(e) => setDelPw(e.target.value)} className="field" /></Field>
            {delError && <Alert>{delError}</Alert>}
            <div className="flex gap-2">
              <Button variant="danger" loading={busy === 'delete'} disabled={!delPw} onClick={deleteAccount}>Permanently delete</Button>
              <Button variant="ghost" onClick={() => { setConfirmDel(false); setDelPw(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
