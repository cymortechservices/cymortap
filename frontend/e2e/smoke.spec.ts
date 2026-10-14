import { expect, test } from '@playwright/test';

// Needs the backend and frontend running locally (see docs/TESTING.md).
test('home renders, validates, creates a real link and shows it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your WhatsApp');

  await page.getByRole('button', { name: /create my whatsapp link/i }).click();
  await expect(page.getByText('Enter a WhatsApp number.')).toBeVisible();

  await page.getByLabel('WhatsApp number').fill('0712345678');
  await page.getByLabel('Pre-filled message').fill('Hello from the e2e test 👋');
  await page.getByRole('button', { name: /create my whatsapp link/i }).click();

  const short = page.getByTestId('short-url');
  await expect(short).toBeVisible();
  const url = (await short.textContent()) ?? '';
  expect(url).toMatch(/^https?:\/\/.+\/[a-z0-9-]{3,40}$/);

  const res = await page.request.get(url, { maxRedirects: 0, headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/126.0 Safari/537.36' } });
  expect(res.status()).toBe(302);
  expect(res.headers()['location']).toContain('https://wa.me/254712345678?text=');
});

test('no horizontal overflow on the home page', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
