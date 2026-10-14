'use client';

import { useEffect, useState } from 'react';
import { qrDataUrl } from '@/lib/qr';
import { Skeleton } from './ui';

export function QrCode({ url, size = 176, label }: { url: string; size?: number; label?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setSrc(null);
    setFailed(false);
    qrDataUrl(url, 512)
      .then((d) => alive && setSrc(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [url]);

  if (failed) return <p className="text-sm text-red-300">Could not draw the QR code. Copy the link instead.</p>;
  if (!src) return <Skeleton className="rounded-2xl" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt={label ?? `QR code for ${url}`} className="rounded-2xl bg-white p-2" style={{ width: size, height: size }} />;
}
