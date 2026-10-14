import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {},
  api: {
    checkSlug: vi.fn(),
    createLink: vi.fn(),
    updateLink: vi.fn(),
  },
}));
vi.mock('@/lib/auth', () => ({ useAuth: () => ({ user: null }) }));

import { LinkForm } from '@/components/LinkForm';
import { api } from '@/lib/api';

beforeEach(() => vi.clearAllMocks());

describe('LinkForm', () => {
  it('shows validation errors and does not call the API', async () => {
    render(<LinkForm />);
    fireEvent.click(screen.getByRole('button', { name: /create my whatsapp link/i }));
    expect(await screen.findByText('Enter a WhatsApp number.')).toBeInTheDocument();
    expect(await screen.findByText('Write the message people will start with.')).toBeInTheDocument();
    expect(api.createLink).not.toHaveBeenCalled();
  });

  it('shows the real link returned by the server', async () => {
    (api.createLink as ReturnType<typeof vi.fn>).mockResolvedValue({
      link: { id: '1', slug: 'abc23xyz', shortUrl: 'https://tap.test/abc23xyz', whatsappUrl: 'https://wa.me/254712345678', phone: '254712345678', message: 'Hello', title: null, description: null, theme: 'midnight', ownerType: 'guest', status: 'active', disabledReason: null, expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), analyticsEnabled: false, createdAt: '', updatedAt: '' },
      policy: { guest: true },
    });
    render(<LinkForm />);
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText('Pre-filled message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /create my whatsapp link/i }));
    await waitFor(() => expect(screen.getByTestId('short-url')).toHaveTextContent('https://tap.test/abc23xyz'));
    expect(screen.getByText(/guest link/i)).toBeInTheDocument();
  });

  it('inserts formatting markers around the selected text', async () => {
    render(<LinkForm />);
    const box = screen.getByLabelText('Pre-filled message') as HTMLTextAreaElement;
    fireEvent.change(box, { target: { value: 'Hello' } });
    box.setSelectionRange(0, 5);
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    await waitFor(() => expect(box.value).toBe('*Hello*'));
  });
});
