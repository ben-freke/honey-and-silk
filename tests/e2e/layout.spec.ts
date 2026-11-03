import { expect, test } from '@playwright/test';
import { recordGoogle, withConsent } from './helpers';

// Review item 6: no horizontal overflow or hidden header links at the listed widths, also at 200% text size.

const routes = ['/', '/services', '/about', '/contact', '/privacy', '/404'];
const widths = [320, 375, 640, 768, 820, 1024, 1536];

for (const width of widths) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await withConsent(page, 'accepted');
    await recordGoogle(page);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    }
  });
}

for (const width of [320, 768]) {
  test(`no horizontal overflow at ${width}px with 200% text`, async ({ page }) => {
    await withConsent(page, 'rejected');
    await recordGoogle(page);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('at 1024px all header links are visible and do not overlap', async ({ page }) => {
  await withConsent(page, 'rejected');
  await recordGoogle(page);
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');
  const links = page.locator('#main-nav ul a');
  await expect(links).toHaveCount(4);
  const boxes: { x: number; y: number; width: number; height: number }[] = [];
  for (let i = 0; i < 4; i++) {
    await expect(links.nth(i)).toBeVisible();
    boxes.push((await links.nth(i).boundingBox())!);
  }
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].x).toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width - 1);
  }
  const logo = (await page.locator('header a').first().boundingBox())!;
  expect(boxes[0].x).toBeGreaterThan(logo.x + logo.width);
});
