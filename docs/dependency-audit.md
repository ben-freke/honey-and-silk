# Dependency audit

Last reviewed: 3 November 2026. Re-run with `npm audit` after dependency updates, and update this file.

## Result

|                   | Before | After  |
| ----------------- | ------ | ------ |
| Critical          | 2      | 1      |
| High              | 31     | 3      |
| Moderate          | 11     | 15     |
| Low               | 4      | 4      |
| **Total entries** | **48** | **23** |

## What changed

- **Updates:** all packages updated to the latest version within their current major version (`npm update`). Astro is now 5.18.2.
- **Sharp:** moved from an exact pin (0.34.3) to `^0.34` (now 0.34.5).
- **Removed, unused:** `@astrojs/partytown` and `@iconify-json/flat-color-icons`.
- **Removed, `astro-compress`:** it only minified HTML at build time, and it brought in `@playform/pipe`, `deepmerge-ts`, `svgo` and its own Sharp copy. Cloudflare already compresses responses (Brotli/gzip).
- **Removed, unused template components:** these are no longer bundled or scanned by Tailwind.

## Remaining high and critical findings

The site is fully static. Cloudflare serves HTML, CSS, JS, fonts and images from `dist/`. There is no Astro server, no server islands, no upload handler and no on-demand image endpoint. All content and images come from this repository.

| Package                            | Severity | Advisory summary                                                                      | Fix                               | Reachability                                                                                                                                        |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astro` 5.18.2                     | Critical | XSS in `define:vars` sanitization; server island parameter handling; other SSR issues | Astro 7 (major)                   | **Not reachable.** The site has no `define:vars` and no server islands, and it does not run as a server. Build input is trusted repository content. |
| `zod`, `zod-to-ts` (through Astro) | High     | Memory exhaustion when validating oversized collections                               | Astro 7 (major)                   | **Build time only**, and only on trusted content collections. Nothing validates visitor input at runtime.                                           |
| `sharp` 0.34.5                     | High     | Inherited libvips and libheif issues                                                  | Sharp 0.35 (Astro 5 expects 0.34) | **Build time only.** Sharp processes the repository's own PNG logos. No untrusted image is ever processed.                                          |

## Plan

- Upgrade to Astro 7 in a dedicated PR. That removes the Astro and Zod findings and allows Sharp 0.35.
- Dependabot (`.github/dependabot.yml`) opens weekly update PRs. Minor and patch updates are grouped. Major updates come as separate PRs.
- Run the development server only on trusted interfaces. `astro dev` listens on localhost by default; do not pass `--host` on untrusted networks.
