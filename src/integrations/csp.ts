/*
 * Content Security Policy, generated after the build.
 *
 * Astro puts small scripts and the brand CSS variables inline in each page. Instead of allowing all inline code
 * ('unsafe-inline'), this integration reads every built HTML page, computes a SHA-256 hash for each inline
 * <script> and <style>, and writes one policy for all pages into dist/_headers (Cloudflare applies that file).
 *
 * The policy is sent as Content-Security-Policy-Report-Only first: browsers report violations in the console but
 * do not block anything. When a deployed preview shows no violations, set `enforce: true` in astro.config.ts.
 */
import { createHash } from 'node:crypto';
import { appendFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

interface Options {
  /** Send Content-Security-Policy (blocks) instead of Content-Security-Policy-Report-Only (logs only). */
  enforce?: boolean;
  /** Origin of the contact form endpoint, allowed for fetch() and form posts. */
  formEndpoint?: string;
}

const sha256 = (text: string) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return Promise.resolve(entry.name.endsWith('.html') ? [full] : []);
    })
  );
  return nested.flat();
}

function originOf(url: string | undefined): string {
  try {
    const parsed = new URL(url ?? '');
    return parsed.protocol === 'https:' ? parsed.origin : '';
  } catch {
    return '';
  }
}

export default function csp({ enforce = false, formEndpoint }: Options = {}): AstroIntegration {
  return {
    name: 'honey-and-silk:csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const scriptHashes = new Set<string>();
        const styleHashes = new Set<string>();

        for (const file of await htmlFiles(outDir)) {
          const html = await readFile(file, 'utf8');
          for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
            if (match[1].trim()) scriptHashes.add(sha256(match[1]));
          }
          for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
            if (match[1].trim()) styleHashes.add(sha256(match[1]));
          }
        }

        const form = originOf(formEndpoint);
        const google = {
          tag: 'https://www.googletagmanager.com',
          analytics: 'https://*.google-analytics.com https://*.analytics.google.com',
          maps: 'https://www.google.com',
        };

        const directives = [
          "default-src 'self'",
          `script-src 'self' ${[...scriptHashes].sort().join(' ')} ${google.tag}`,
          `style-src 'self' ${[...styleHashes].sort().join(' ')}`,
          "font-src 'self'",
          `img-src 'self' data: ${google.tag} ${google.analytics}`,
          `connect-src 'self' ${google.tag} ${google.analytics} ${form}`.trim(),
          `frame-src ${google.maps}`,
          `form-action 'self' ${form}`.trim(),
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
        ];

        const header = enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
        await appendFile(path.join(outDir, '_headers'), `\n/*\n  ${header}: ${directives.join('; ')}\n`);
        logger.info(
          `${header} written to _headers (${scriptHashes.size} script and ${styleHashes.size} style hashes).`
        );
      },
    },
  };
}
