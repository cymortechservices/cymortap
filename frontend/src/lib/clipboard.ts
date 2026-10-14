/** Copies text. Returns true only when the browser confirms success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Opens the native share sheet. Returns 'shared', 'cancelled', or 'unsupported'. */
export async function nativeShare(data: { title: string; text: string; url: string }): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.share) return 'unsupported';
  try {
    await navigator.share(data);
    return 'shared';
  } catch (err) {
    return (err as DOMException).name === 'AbortError' ? 'cancelled' : 'unsupported';
  }
}
