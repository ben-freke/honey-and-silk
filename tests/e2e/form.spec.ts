import { expect, test, type Page } from '@playwright/test';
import { FORM_ENDPOINT, recordGoogle, withConsent } from './helpers';

// Review item 1 (handler survives view-transition navigation) and item 9 (validation, duplicates, status).

async function mockEndpoint(page: Page, { status = 200, delayMs = 0 } = {}) {
  const requests: string[] = [];
  await page.route(FORM_ENDPOINT, async (route) => {
    requests.push(route.request().method());
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({ status, contentType: 'application/json', body: '{}' });
  });
  return requests;
}

async function fillForm(page: Page) {
  await page.getByLabel('Name').fill('Test Visitor');
  await page.getByLabel('Email').fill('visitor@example.com');
  await page.getByLabel('Message').fill('Hello, I would like to book a cut.');
}

const status = (page: Page) => page.locator('[data-form-status]');

test.beforeEach(async ({ page }) => {
  await recordGoogle(page);
  await withConsent(page, 'rejected');
});

test('sends once on a direct load and announces success', async ({ page }) => {
  const requests = await mockEndpoint(page);
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(status(page)).toHaveText(/has been sent/);
  await expect(status(page)).toHaveAttribute('role', 'status');
  expect(requests).toEqual(['POST']);
  await expect(page).toHaveURL(/\/contact$/);
});

test('still sends once after Contact → Services → Contact (view transitions)', async ({ page }) => {
  const requests = await mockEndpoint(page);
  await page.goto('/');
  await page.locator('#main-nav').getByRole('link', { name: 'Contact Us' }).click();
  await page.locator('#main-nav').getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.locator('#main-nav').getByRole('link', { name: 'Contact Us' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(status(page)).toHaveText(/has been sent/);
  expect(requests).toEqual(['POST']);
  await expect(page).toHaveURL(/\/contact$/);
});

test('still sends once after browser Back and Forward', async ({ page }) => {
  const requests = await mockEndpoint(page);
  await page.goto('/contact');
  await page.locator('#main-nav').getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goForward();
  await page.goBack();
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(status(page)).toHaveText(/has been sent/);
  expect(requests).toEqual(['POST']);
});

test('repeated clicks while sending create one request', async ({ page }) => {
  const requests = await mockEndpoint(page, { delayMs: 800 });
  await page.goto('/contact');
  await fillForm(page);
  const submit = page.getByRole('button', { name: 'Send message' });
  await submit.click();
  await submit.click({ force: true });
  await page.locator('form[data-contact-form]').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(status(page)).toHaveText(/has been sent/);
  expect(requests).toHaveLength(1);
});

test('rejects empty input without a request', async ({ page }) => {
  const requests = await mockEndpoint(page);
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(status(page)).toHaveText(/required/);
  await expect(page.getByLabel('Name')).toBeFocused();
  expect(requests).toHaveLength(0);
});

test('keeps the typed text when sending fails', async ({ page }) => {
  await mockEndpoint(page, { status: 500 });
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(status(page)).toHaveText(/not sent/);
  await expect(page.getByLabel('Message')).toHaveValue('Hello, I would like to book a cut.');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
});
