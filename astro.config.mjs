// astro.config.mjs
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://www.notafintech.co';

// Build a URL -> lastmod (ISO 8601) map at config-load time by scanning
// content frontmatter. Used by the @astrojs/sitemap serialize callback
// to emit per-URL <lastmod> for freshness signaling.
const lastmodMap = new Map();
function walk(dir, slugPrefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, slugPrefix + entry.name + '/');
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fm = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fm) continue;
      const updated = fm[1].match(/^updatedAt:\s*(\S+)/m)?.[1];
      const published = fm[1].match(/^publishedAt:\s*(\S+)/m)?.[1];
      const date = updated || published;
      if (!date) continue;
      const slug = (slugPrefix + entry.name)
        .replace(/\.(md|mdx)$/, '')
        .replace(/\/index$/, '');
      const url = slug ? `${SITE}/${slug}/` : `${SITE}/`;
      const iso = date.includes('T') ? date : `${date}T00:00:00.000Z`;
      lastmodMap.set(url, iso);
    }
  }
}
walk(path.resolve('./src/content/pages'));

// Homepage isn't a content entry — surface the latest updatedAt as its lastmod.
const allDates = [...lastmodMap.values()].sort();
if (allDates.length > 0) {
  lastmodMap.set(`${SITE}/`, allDates[allDates.length - 1]);
}

export default defineConfig({
  site: SITE,
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    preact({ compat: false }),
    mdx(),
    sitemap({
      serialize(item) {
        const lm = lastmodMap.get(item.url);
        if (lm) item.lastmod = lm;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
