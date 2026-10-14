export type DeviceCategory = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

export interface ParsedUa {
  device: DeviceCategory;
  os: string;
  browser: string;
  isBot: boolean;
  /** Link-preview fetchers (social apps, chat apps). Never counted, served a preview page. */
  isPreview: boolean;
}

const PREVIEW =
  /facebookexternalhit|facebot|whatsapp|twitterbot|slackbot|slack-imgproxy|telegrambot|discordbot|linkedinbot|skypeuripreview|pinterest|embedly|redditbot|applebot|vkshare|iframely|viber|snapchat/i;
const BOT =
  /bot|crawl|spider|slurp|curl\/|wget|python-requests|python-urllib|httpclient|headless|phantomjs|lighthouse|pingdom|uptime|monitor|axios|node-fetch|undici|go-http|java\/|libwww|scrapy|postman|insomnia/i;

export function parseUa(ua: string | undefined): ParsedUa {
  const s = (ua ?? '').trim();
  if (!s) return { device: 'bot', os: 'unknown', browser: 'unknown', isBot: true, isPreview: false };
  const isPreview = PREVIEW.test(s);
  const isBot = isPreview || BOT.test(s);

  let os = 'other';
  if (/android/i.test(s)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(s)) os = 'ios';
  else if (/windows/i.test(s)) os = 'windows';
  else if (/mac os x|macintosh/i.test(s)) os = 'macos';
  else if (/cros/i.test(s)) os = 'chromeos';
  else if (/linux/i.test(s)) os = 'linux';

  let browser = 'other';
  if (/edg\//i.test(s)) browser = 'edge';
  else if (/opr\/|opera/i.test(s)) browser = 'opera';
  else if (/firefox|fxios/i.test(s)) browser = 'firefox';
  else if (/chrome|crios/i.test(s)) browser = 'chrome';
  else if (/safari/i.test(s)) browser = 'safari';

  let device: DeviceCategory = 'desktop';
  if (isBot) device = 'bot';
  else if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(s)) device = 'tablet';
  else if (/mobi|iphone|ipod|android/i.test(s)) device = 'mobile';

  return { device, os, browser, isBot, isPreview };
}
