# Migration History

Historical record of two migrations the site has been through. Both are complete — this document is kept for context, not as a runbook. The cutover steps below are preserved verbatim from the original migration playbooks.

## February 2026 — Jekyll 4.x (GitHub Pages) → Astro + Starlight (Cloudflare Pages)

The site started life as a Jekyll 4.x site served from GitHub Pages. In February 2026 it was rebuilt on Astro + Starlight and moved to Cloudflare Pages.

### What changed in this migration

- Jekyll layouts/includes/SCSS/Liquid templates → Starlight's built-in theme
- Content restructured from `_posts/` + various Jekyll collections → `src/content/docs/` with Starlight frontmatter
- Models and docs pages converted to `.mdx` with a reusable `GoogleEmbed` component
- Deployment target: GitHub Pages → Cloudflare Pages (git-connected)
- Search: none (or basic) → Pagefind via Starlight
- Added: OG image + Twitter Card meta, favicon, Google Analytics alongside the existing Plausible

### Cutover steps (completed)

1. Merged the `astro-migration` branch into `main`
2. Created the Cloudflare Pages project pointed at `Not-a-Fintech-Company/Website` `main` with build command `npm run build` and output directory `dist`
3. Disabled GitHub Pages in the repo settings (`Settings > Pages > Source: None`)
4. Added `www.notafintech.co` (primary) and `notafintech.co` (redirect) as custom domains in the Cloudflare Pages project, plus a Cloudflare redirect rule for `notafintech.co` → `www.notafintech.co` (301)
5. Verified SSL (Full/strict), site rendering across all sections, sitemap + robots.txt + OG image, both analytics dashboards
6. Removed legacy artifacts (`public/CNAME`, the Jekyll files, old GA Universal code, defunct Twitter footer references)

### Rollback plan (not used)

The Jekyll site lives in git history. To restore: `git log --oneline` for the last Jekyll commit and `git checkout <hash> -- .`. GitHub Pages can be re-enabled in repo settings.

---

## May 2026 — Astro + Starlight → custom Astro + Tailwind v4 + Preact

In May 2026 the site was redesigned off Starlight onto a custom Astro + Tailwind v4 layout with a fresh editorial visual identity. No URL or content schema changes that would have affected SEO.

### What changed in this migration

- `@astrojs/starlight` removed; replaced with custom page templates (Article, SectionIndex, Model, Tool) styled in Tailwind v4 (CSS-first config)
- Astro upgraded 5.x → 6.x (peer-required by `@astrojs/mdx@latest`)
- Content collection renamed `docs` → `pages` with extended frontmatter (added `authors`, `publishedAt`, `updatedAt`, etc.)
- Preact integration added (`compat: false`); SearchModal became the first interactive island
- Custom fonts self-hosted via `@fontsource[-variable]/*` (initially Fraunces + Inter, swapped May 15 to EB Garamond + Hanken Grotesk; see CHANGELOG)
- New editorial visual identity: warm Paper/Ink palette, oxblood accent
- Light/dark theme toggle with localStorage persistence; theme flash prevented via inline script
- Pagefind retained for search, now via a custom Preact modal UI (⌘K)
- Tools section added (initial stub; Term Loan calculator shipped May 15)
- `@astrojs/sitemap` replaced the static `sitemap.xml`

### Approach

- Implemented in an isolated git worktree (`astro-tailwind-migration` branch, later renamed `redesign`)
- Single PR rebased onto `main`
- 67 commits squashed-or-rebased linearly
- All URLs preserved; `public/_redirects` extended rather than rewritten
- Lighthouse + accessibility audits run before merge

### Verification (completed)

- 18 pages render correctly in light + dark themes
- All Jekyll-era 301 redirects functional
- Pagefind search modal works on production builds
- WCAG AA met; some elements approach AAA
- No regressions to OG / Twitter / favicon / theme-color metadata

---

## Subsequent post-launch work

For everything after the initial Astro + Tailwind launch — typography swap, calculator, audit-driven hardening, SEO infrastructure (JSON-LD, llms.txt, IndexNow, etc.) — see `CHANGELOG.md`.
