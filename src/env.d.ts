// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

declare global {
  interface ImportMetaEnv {
    /** Contact form endpoint, for example a Formspree form URL. Leave blank to disable sending. */
    readonly PUBLIC_FORM_ENDPOINT?: string;
    /** Google Analytics 4 measurement ID, for example G-XXXXXXXXXX. Leave blank to turn analytics off. */
    readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  }

  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Google Analytics opt-out flag, one per measurement ID: window['ga-disable-G-XXXX'] = true. */
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export {};
