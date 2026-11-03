import type { BrowserContext, Page } from '@playwright/test';

export const FORM_ENDPOINT = /forms\.example\.test/;
export const GOOGLE = /(google|googletagmanager|google-analytics)\.com/;

/** Block every request to Google and record its path, so tests can assert what would have loaded. */
export async function recordGoogle(target: Page | BrowserContext) {
  const paths: string[] = [];
  await target.route(GOOGLE, (route) => {
    paths.push(new URL(route.request().url()).pathname);
    return route.abort();
  });
  return paths;
}

/** Start a test with a stored cookie choice, so the banner does not cover the page. */
export async function withConsent(target: Page | BrowserContext, value: 'accepted' | 'rejected') {
  await target.addInitScript((v) => {
    try {
      window.localStorage.setItem('hs-cookie-consent', v);
    } catch {
      /* storage blocked */
    }
  }, value);
}
