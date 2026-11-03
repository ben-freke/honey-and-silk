import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

import astrowind from './vendor/integration';
import csp from './src/integrations/csp';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://honeyandsilk.co.uk',
  output: 'static',
  // Build about.html, not about/index.html. Cloudflare serves about.html at /about with no redirect, which matches
  // trailingSlash: false in src/config.yaml.
  build: {
    format: 'file',
  },
  devToolbar: {
    enabled: false,
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        // Only the icons the site uses: service cards, and social links for when they are added.
        tabler: ['scissors', 'palette', 'droplet', 'sparkles', 'brand-instagram', 'brand-facebook'],
      },
    }),

    astrowind({
      config: './src/config.yaml',
    }),

    // Must run last: it hashes the final HTML. Report-only until a deployed preview shows no violations.
    csp({ enforce: false, formEndpoint: process.env.PUBLIC_FORM_ENDPOINT }),
  ],

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
