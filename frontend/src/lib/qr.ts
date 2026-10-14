import { toDataURL } from 'qrcode';

/** QR codes always encode the branded CYMOR TAP link, never the WhatsApp URL. */
export const qrDataUrl = (url: string, width = 1024) =>
  toDataURL(url, { width, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#04101f', light: '#ffffff' } });

export async function downloadQr(url: string, slug: string) {
  const dataUrl = await qrDataUrl(url, 1200);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `cymor-tap-${slug}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
