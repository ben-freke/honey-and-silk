import { expect, test } from '@playwright/test';
import { recordGoogle } from './helpers';

// Review items 8 (withdrawal when storage writes fail, other tabs) and 11 (map geometry, directions link).

const mapFrame = '[data-consent-map-frame]';
const directions = 'Open in Google Maps';

test('nothing loads from Google before a choice; the directions link is there', async ({ page }) => {
  const google = await recordGoogle(page);
  await page.goto('/contact');
  await expect(page.locator('#cookie-consent')).toBeVisible();
  await expect(page.locator(mapFrame)).toBeHidden();
  await expect(page.getByRole('link', { name: directions })).toBeVisible();
  await page.waitForTimeout(500);
  expect(google).toEqual([]);
});

test('Reject keeps Google off and keeps the directions link', async ({ page }) => {
  const google = await recordGoogle(page);
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Reject cookies' }).click();
  await expect(page.locator('#cookie-consent')).toBeHidden();
  await expect(page.locator(mapFrame)).toBeHidden();
  await expect(page.getByRole('link', { name: directions })).toBeVisible();
  await page.locator('#main-nav').getByRole('link', { name: 'Home' }).click();
  await page.waitForTimeout(500);
  expect(google).toEqual([]);
});

test('Accept loads analytics and the map', async ({ page }) => {
  const google = await recordGoogle(page);
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Accept cookies' }).click();
  await expect(page.locator(mapFrame)).toBeVisible();
  await expect.poll(() => google).toEqual(expect.arrayContaining(['/gtag/js', '/maps/embed']));
});

test('a returning visitor who accepted has the map space before scripts run (no layout shift)', async ({ page }) => {
  await recordGoogle(page);
  await page.goto('/contact');
  await page.evaluate(() => localStorage.setItem('hs-cookie-consent', 'accepted'));
  await page.goto('/contact', { waitUntil: 'commit' });
  await page.waitForSelector(mapFrame, { state: 'attached' });
  // The inline <head> script sets the attribute before the body is parsed.
  expect(await page.evaluate(() => document.documentElement.dataset.consent)).toBe('accepted');
  await expect(page.locator(mapFrame)).toBeVisible();
});

test('Reject works when storage reads succeed but writes fail', async ({ page }) => {
  await recordGoogle(page);
  await page.goto('/contact');
  await page.evaluate(() => localStorage.setItem('hs-cookie-consent', 'accepted'));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };
  });
  await page.reload();
  await expect(page.locator(mapFrame)).toBeVisible();
  await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('button', { name: 'Reject cookies' }).click();
  await expect(page.locator(mapFrame)).toBeHidden();
  expect(await page.locator(`${mapFrame} iframe`).getAttribute('src')).toBeNull();
  expect(await page.evaluate(() => window['ga-disable-G-TEST12345'])).toBe(true);
});

test('a choice in one tab applies in another open tab', async ({ context }) => {
  await recordGoogle(context);
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto('/contact');
  await second.goto('/contact');
  await first.getByRole('button', { name: 'Accept cookies' }).click();
  await expect(second.locator(mapFrame)).toBeVisible();
  await expect(second.locator('#cookie-consent')).toBeHidden();
  await second.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
  await second.getByRole('button', { name: 'Reject cookies' }).click();
  await expect(first.locator(mapFrame)).toBeHidden();
});
