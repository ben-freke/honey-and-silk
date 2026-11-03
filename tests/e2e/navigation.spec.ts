import { expect, test } from '@playwright/test';
import { recordGoogle, withConsent } from './helpers';

// Review items 4 (listeners and observers do not pile up), 5 (accessible mobile menu) and 7 (banner vs menu).

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 740 } });

  test.beforeEach(async ({ page }) => {
    await recordGoogle(page);
  });

  test('exposes its state, closes with Escape and returns focus', async ({ page }) => {
    await withConsent(page, 'rejected');
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'main-nav');
    await expect(page.locator('#main-nav')).toBeHidden();

    await button.click();
    const close = page.getByRole('button', { name: 'Close menu' });
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#main-nav')).toBeVisible();
    expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(true);
    await expect(page.locator('#main-nav a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(false);
  });

  test('a menu link navigates and closes the menu', async ({ page }) => {
    await withConsent(page, 'rejected');
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#main-nav').getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#main-nav')).toBeHidden();
  });

  test('menu still toggles once per click after many navigations', async ({ page }) => {
    await withConsent(page, 'rejected');
    await page.goto('/');
    const routes = ['Services', 'About Us', 'Contact Us', 'Home'];
    for (let i = 0; i < 12; i++) {
      await page.getByRole('button', { name: 'Menu' }).click();
      await page
        .locator('#main-nav')
        .getByRole('link', { name: routes[i % routes.length] })
        .click();
      await expect(page.locator('#main-nav')).toBeHidden();
    }
    // If click listeners had piled up, one click would toggle the menu more than once.
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('with the cookie banner showing, all menu links, Book now and both consent buttons are reachable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 740, height: 390 }); // short landscape
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const banner = page.locator('#cookie-consent');
    await expect(banner).toBeVisible();
    const bannerTop = (await banner.boundingBox())!.y;
    // The menu panel scrolls. Scrolled to the end, the last item (Book now) must sit above the banner, so every
    // item can be scrolled into the space between the header and the banner.
    await page.locator('#main-nav').evaluate((nav) => nav.scrollTo(0, nav.scrollHeight));
    const last = (await page.locator('#main-nav').getByRole('link', { name: 'Book now' }).boundingBox())!;
    expect(last.y + last.height, 'Book now must not be under the banner').toBeLessThanOrEqual(bannerTop + 1);
    for (const name of ['Home', 'Services', 'About Us', 'Contact Us', 'Book now']) {
      await expect(page.locator('#main-nav').getByRole('link', { name })).toBeAttached();
    }
    await expect(page.getByRole('button', { name: 'Accept cookies' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Reject cookies' })).toBeInViewport();
  });
});

test('skip link moves focus to the main content', async ({ page }) => {
  await withConsent(page, 'rejected');
  await recordGoogle(page);
  await page.goto('/services');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('reveal observers do not pile up across navigations', async ({ page }) => {
  await withConsent(page, 'rejected');
  await recordGoogle(page);
  await page.addInitScript(() => {
    const Original = window.IntersectionObserver;
    let active = 0;
    (window as unknown as { __activeObservers: () => number }).__activeObservers = () => active;
    window.IntersectionObserver = class extends Original {
      private live = true;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options);
        active++;
      }
      disconnect() {
        if (this.live) active--;
        this.live = false;
        super.disconnect();
      }
    };
  });
  await page.goto('/');
  for (const name of ['Services', 'About Us', 'Contact Us', 'Home', 'Services', 'About Us', 'Contact Us', 'Home']) {
    await page.locator('#main-nav').getByRole('link', { name }).click();
    await page.waitForLoadState('domcontentloaded');
  }
  const active = await page.evaluate(() =>
    (window as unknown as { __activeObservers: () => number }).__activeObservers()
  );
  expect(active).toBeLessThanOrEqual(1);
});
