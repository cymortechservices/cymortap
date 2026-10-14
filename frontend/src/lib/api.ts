import { API_BASE } from './config';
import type {
  CreateLinkResponse, LinkDto, LinkList, Overview, SlugCheck, Timeline, User,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'cymor-tap',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach CYMOR TAP. Check your connection and try again.');
  }
  if (res.headers.get('content-type')?.includes('text/csv')) return (await res.text()) as T;
  let body: { data?: T; error?: { code: string; message: string; fields?: Record<string, string> } } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON error */
  }
  if (!res.ok) {
    throw new ApiError(res.status, body.error?.code ?? 'ERROR', body.error?.message ?? 'Something went wrong. Please try again.', body.error?.fields);
  }
  return body.data as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export interface LinkInput {
  country?: string;
  phone: string;
  message: string;
  title?: string;
  description?: string;
  slug?: string;
  theme?: string;
  analyticsEnabled?: boolean;
}

export const api = {
  // auth
  register: (b: { email: string; password: string; displayName: string }) => request<{ user: User }>('/auth/register', { method: 'POST', json: b }),
  login: (b: { email: string; password: string }) => request<{ user: User }>('/auth/login', { method: 'POST', json: b }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST', json: {} }),
  me: () => request<{ user: User; emailDeliveryAvailable: boolean }>('/auth/me'),
  forgotPassword: (email: string) => request<{ emailDelivery: 'enabled' | 'unavailable'; message: string }>('/auth/forgot-password', { method: 'POST', json: { email } }),
  resetPassword: (token: string, password: string) => request<{ ok: true }>('/auth/reset-password', { method: 'POST', json: { token, password } }),
  // public links
  createLink: (b: LinkInput) => request<CreateLinkResponse>('/links', { method: 'POST', json: b }),
  checkSlug: (slug: string) => request<SlugCheck>(`/slugs/check${qs({ slug })}`),
  reportLink: (slug: string, b: { reason: string; details?: string }) => request<{ ok: true; alreadyReported: boolean }>(`/links/${encodeURIComponent(slug)}/report`, { method: 'POST', json: b }),
  // owned links
  listLinks: (q: { search?: string; status?: string; sort?: string; page?: number; limit?: number }) => request<LinkList>(`/me/links${qs(q)}`),
  getLink: (id: string) => request<{ link: LinkDto }>(`/me/links/${id}`),
  updateLink: (id: string, b: Partial<LinkInput>) => request<{ link: LinkDto }>(`/me/links/${id}`, { method: 'PATCH', json: b }),
  setStatus: (id: string, status: 'active' | 'disabled') => request<{ link: LinkDto }>(`/me/links/${id}/status`, { method: 'PATCH', json: { status } }),
  deleteLink: (id: string) => request<{ ok: true }>(`/me/links/${id}`, { method: 'DELETE' }),
  // analytics
  overview: (q: { from?: string; to?: string }) => request<Overview>(`/me/analytics/overview${qs(q)}`),
  timeline: (q: { from?: string; to?: string; linkId?: string }) => request<Timeline>(`/me/analytics/timeline${qs(q)}`),
  linkAnalytics: (id: string, q: { from?: string; to?: string }) => request<Timeline & { link: LinkDto }>(`/me/analytics/links/${id}${qs(q)}`),
  exportCsv: (q: { from?: string; to?: string; linkId?: string }) => request<string>(`/me/analytics/export${qs(q)}`),
  // account
  updateProfile: (b: { displayName?: string; preferences?: { defaultAnalyticsEnabled?: boolean } }) => request<{ user: User }>('/me/profile', { method: 'PATCH', json: b }),
  changePassword: (b: { currentPassword: string; newPassword: string }) => request<{ ok: true }>('/me/change-password', { method: 'POST', json: b }),
  deleteAccount: (password: string) => request<{ ok: true }>('/me/account', { method: 'DELETE', json: { password } }),
};
