export interface User {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  preferences: { defaultAnalyticsEnabled: boolean };
  createdAt: string;
}

export type LinkStatus = 'active' | 'disabled' | 'deleted' | 'expired';

export interface LinkDto {
  id: string;
  slug: string;
  shortUrl: string;
  whatsappUrl: string;
  phone: string;
  message: string;
  title: string | null;
  description: string | null;
  theme: string;
  ownerType: 'guest' | 'user';
  status: LinkStatus;
  disabledReason: 'owner' | 'moderation' | null;
  expiresAt: string | null;
  analyticsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkResponse {
  link: LinkDto;
  policy: { guest: boolean; expiresAt?: string | null; analytics?: boolean; manageable?: boolean };
}

export interface LinkList {
  items: LinkDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Overview {
  range: { from: string; to: string };
  totals: { links: number; activeLinks: number; eligibleClicks: number; estimatedUniqueVisitors: number };
  topLinks: { id: string; slug: string | null; title: string | null; clicks: number }[];
  recent: { at: string; linkId: string; slug: string | null; device: string; referrer: string }[];
}

export interface Timeline {
  range: { from: string; to: string };
  totals: { eligibleClicks: number; estimatedUniqueVisitors: number };
  days: { date: string; clicks: number; uniqueVisitors: number }[];
  devices: { device: string; clicks: number }[];
  referrers: { source: string; clicks: number }[];
}

export interface SlugCheck {
  available: boolean;
  slug?: string;
  reason?: string;
  message?: string;
}
