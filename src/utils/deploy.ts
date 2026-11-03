/*
 * Build target, read at build time.
 *
 * Cloudflare Workers Builds sets WORKERS_CI_BRANCH to the branch it builds. A build of `main` is the production
 * deploy; a build of any other branch is a pull request preview. Local builds have no WORKERS_CI_BRANCH.
 *
 * Previews must not send data to the production Google Analytics property, and must not be indexed by search
 * engines. Production analytics is therefore on only for builds of `main`.
 */
import { GA_MEASUREMENT_ID } from '~/utils/site';

const branch = (process.env.WORKERS_CI_BRANCH ?? '').trim();

/** True for a Cloudflare build of any branch other than main (a pull request preview). */
export const IS_PREVIEW = branch !== '' && branch !== 'main';

/** True for the Cloudflare production build (main). */
export const IS_PRODUCTION_DEPLOY = branch === 'main';

/**
 * The Google Analytics 4 ID for this build, or '' for no analytics.
 * PUBLIC_GA_MEASUREMENT_ID overrides it (set it empty to turn analytics off). Otherwise only the production
 * deploy gets the real ID.
 */
export const ANALYTICS_ID: string = (() => {
  const override = import.meta.env.PUBLIC_GA_MEASUREMENT_ID;
  const id = (override ?? (IS_PRODUCTION_DEPLOY ? GA_MEASUREMENT_ID : '')).trim();
  return /^G-[A-Z0-9]+$/.test(id) ? id : '';
})();
