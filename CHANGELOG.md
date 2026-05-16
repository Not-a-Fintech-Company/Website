# Changelog

## 2026-05-16 — Documentation refresh + orphan cleanup

### Removed
- `src/assets/logo.svg`, `src/assets/logo.png` — orphan Starlight-era logo files
- `public/siteicon.png`, `public/touch-icon.png` — Jekyll-era favicon variants, never referenced by the new BaseLayout
- `public/CNAME` — GitHub Pages artifact, unused on Cloudflare Pages
- `public/sitemap.xml` — static sitemapindex backup, redundant now that `@astrojs/sitemap` emits `sitemap-index.xml` + `sitemap-0.xml`

### Changed
- `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `DEPLOYMENT.md` updated to reflect the post-migration state (typography swap, Tools section live, audit fixes, calculator)

## 2026-05-15 — Term Loan calculator + tools section live

### Added
- `/tools/term-loan/` — **Term Loan Unit Economics** calculator. Lender-side: 8 inputs (loan amount, APR, term, origination fee, cost of funds, servicing, loss rate, CAC), 6 outputs (monthly payment, total interest, origination revenue, cost of funds, expected losses, net profit, ROA). Live updating Preact island.
- `src/lib/term-loan.ts` — pure financial math functions (amortization schedule + unit economics). Reusable for follow-on calculators.
- `src/components/tools/` — `NumberField`, `ResultBlock`, `BreakdownRow`, `TermLoanCalculator` Preact components.
- `/tools/bank-account/`, `/tools/credit-card/` — "Coming soon" stub pages linking to the existing Google Sheets at `/models/*`.
- Named `<slot name="tool" />` on `ToolLayout` for mounting tool islands.
- `/about/` contributors now have full names linked to LinkedIn alongside Twitter handles.

## 2026-05-15 — Typography swap + bolder design pass

### Changed
- **Display typeface**: Fraunces → **EB Garamond** (variable, OFL). Classical Garalde with true italic forms. Used by editorial finance publications.
- **Body typeface**: Inter → **Hanken Grotesk** (variable, OFL). Warmer humanist sans, off the AI-monoculture reflex list.
- Display weight bumped 600 → 700; tighter letter-spacing on headings (-0.025em).
- Hero h1 uses fluid `clamp(2.75rem, 7vw, 6.25rem)` sizing.
- Section eyebrows shifted from muted gray to **accent oxblood** + semibold — adds ~7 oxblood touchpoints per home page load without flooding.
- `--rule` dividers darkened for stronger UI weight: `#E5DDD0` → `#D2C5B0` (light), `#2A231D` → `#3C3128` (dark).
- Hero CTAs: bigger padding, font-semibold, secondary uses `border-2 border-ink` with hover-fill.
- GuideCard: `border-2`, hover-border to ink + slight Y-lift, arrow slides in from left.
- Home Models section restyled as 3-column editorial TOC (monospace `01/02/03` numerals + roadmap-style links) — visually differentiated from the Featured Guides cards.
- Open-source callout reworked from centered marketing layout to a left-aligned two-column editorial block.
- Hero italic ("you need") restyled to italic-only — accent color dropped for editorial restraint.

## 2026-05-13 — Audit-driven hardening

### Changed
- **Accessibility**: skip-to-content link (WCAG 2.4.1); `aria-pressed` on ThemeToggle (WCAG 4.1.2); touch targets bumped 36 → 44px (Apple HIG, WCAG 2.1 AAA); `prefers-reduced-motion` media query disables transitions/animations.
- **Contrast**: `--muted` darkened to ~6.5:1 on paper; dark `--accent` raised to ~5.6:1 (was failing AA).
- **Anti-pattern fixes**: removed `border-l-2` accent stripes from Sidebar and Toc (BAN 1); replaced with `bg-surface-2` + accent text + semibold for active state.
- Prose styles moved to `@layer utilities` to win the Tailwind v4 cascade against `@tailwindcss/typography`'s defaults — fixes bullets and link colors on guide article pages.
- `lucide-astro` → `@lucide/astro` 1.x (former deprecated). `Github` icon dropped in v1; replaced with inline SVG `GithubIcon.astro`.
- `tsconfig.json`: `jsxImportSource: "preact"` added so `astro check` resolves Preact JSX types for `.tsx` islands.

## 2026-05-12 — Migration off Starlight

### Changed
- Replaced `@astrojs/starlight` with custom Astro layouts styled in Tailwind v4 (CSS-first config).
- Astro upgraded 5.x → 6.x (peer-required by `@astrojs/mdx@latest`).
- Added Preact integration (`compat: false`); SearchModal is the first island.
- Self-hosted Fraunces / Inter / JetBrains Mono fonts via `@fontsource[-variable]/*`; no Google Fonts request.
- New editorial visual identity: warm Paper/Ink palette, oxblood accent, Fraunces display + Inter body (later swapped — see May 15 entry).
- Renamed content collection `docs` → `pages`.
- Added Tools section (initially stub, calculator shipped May 15).
- Replaced flat bullet roadmap with structured `RoadmapGrid` component sourced from `src/data/roadmap.ts`.
- Added `@astrojs/sitemap` integration; `sitemap-index.xml` replaces the static `sitemap.xml`.
- Light/dark theme toggle with localStorage persistence; theme flash prevented via inline script.
- Kept Pagefind for search — now via a custom Preact modal UI (⌘K).

### Added
- 5 page templates built from scratch: Home, SectionIndex, Article, Model, Tool.
- New chrome: Header, Footer, MobileMenu, ThemeToggle, Sidebar, Toc, Breadcrumbs.
- Hardcoded home page in `src/pages/index.astro` (not a content entry).

## 2026-02-19 — Astro + Starlight Migration

### Changed
- Migrated entire site from Jekyll 4.x to Astro + Starlight
- Replaced Jekyll layouts, includes, SCSS, and Liquid templates with Starlight's built-in theme
- Content restructured into `src/content/docs/` with Starlight frontmatter format
- Models and docs pages converted to `.mdx` with reusable `GoogleEmbed` component
- Static assets moved to `public/` and `src/assets/`
- Twitter embed blockquotes in resources.md converted to plain blockquotes
- Deployment target changed from GitHub Pages to Cloudflare Pages
- Updated README with Astro build commands
- Replaced Google Docs iframes with inline markdown content (homepage roadmap, BSA policy)
- Homepage roadmap items linked to their corresponding guide, model, and docs pages

### Added
- `astro.config.mjs` with Starlight integration, sidebar config, analytics, and branding
- `src/components/GoogleEmbed.astro` reusable iframe component for Google Sheets embeds
- `src/components/Footer.astro` custom footer with CC0 license notice, Totavi hosting credit, and link to GitHub source
- `src/styles/custom.css` with brand colors (Roboto font, #284B9C accent)
- `wrangler.jsonc` for Cloudflare Pages deployment
- `src/content.config.ts` for Astro content collections
- Built-in search via Pagefind (provided by Starlight)
- OpenGraph and Twitter Card meta tags with branded OG image (1200x630)
- Favicon, apple-touch-icon, and theme-color meta tag
- Google Analytics (G-VJXL7WCFNM) alongside existing Plausible Analytics
- `DEPLOYMENT.md` with setup and deployment instructions
- `MIGRATION.md` with step-by-step cutover guide from GitHub Pages to Cloudflare Pages

### Fixed
- 47 spelling and grammar errors across 8 content files (typos, incomplete sentences, missing words)

### Removed
- Jekyll files: Gemfile, _config.yml, _layouts/, _includes/, _sass/, _data/, css/
- Blog section (_posts/), staff members collection (_staff_members/)
- Contact page, pricing page, contact-success page
- CloudCannon CMS configuration
- Milligram CSS framework and normalize.css CDN dependencies
- compress.html layout (Astro handles optimization)
- Google Docs iframes (content inlined as markdown)

## 2026-02-19

### Added
- Plausible Analytics on all pages via `_layouts/default.html`

- Linked challenger bank guide into guides/index.md

### Fixed
- guides/guide-to-starting-a-challenger-bank.md: fixed heading hierarchy (h1 → h2, etc.) to avoid duplicate h1 with page title, fixed TOC anchor for Product Features, completed two truncated sentences, removed emoji, fixed typo ("origionally" → "originally"), added trailing newline

### Removed
- Dead links from resources.md: 3 Unit.co blog posts (404), JP Morgan research video (404), Credit Suisse research doc (domain defunct after UBS acquisition), Videos section (now empty)

### Changed
- Updated contact email from not.a.fintech.company@gmail.com to hello@notafintech.co across all pages (index, contact, pricing)
- Updated site URL from notafintech.company to notafintech.co in _config.yml and README.md
- Replaced all Twitter references with X (x.com):
  - Footer social link now points to https://x.com/notafintechco/
  - Social icon updated from Twitter bird to X logo
  - Contributor links in about.md updated to x.com
  - Attribution links in guides/go-to-market-plan.md updated to x.com
  - `twitter` front matter field renamed to `x` in all staff member profiles
  - `social_icons` config updated from Twitter to X
  - Footer SCSS hover class updated from `.twitter-icon` to `.X-icon`
  - Resources section heading updated to "X (formerly Twitter) Threads"
- Added copyright notice (© 2026) to site footer in default layout
- Removed X/Twitter link from footer (`_data/footer.yml`), X icon from `_includes/social-icon.html`, hover style from `_sass/footer.scss`, and disabled X in `social_icons` config
- Removed placeholder staff member profiles (anna, betty, gerald, james, robin, tom); `_defaults.md` template retained

### Security fixes
- Added security headers: `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` meta tags in `_layouts/default.html`
- Added SRI (Subresource Integrity) hashes to CDN stylesheets (normalize.css, milligram.css)
- Added `sandbox="allow-scripts allow-same-origin"` and `title` attributes to all iframes (index.html, docs/bsa.md, models/bank-account.md, models/credit-card.md, models/term-loan.md)
- Replaced `<embed>` with sandboxed `<iframe>` for PDF in docs/credit-card-trunk.md
- Added `rel="noopener noreferrer"` to all `target="_blank"` links (footer, navigation, contact page)
- Escaped all Liquid template outputs with `| escape` or `| jsonify` filters across layouts and includes (page.html, post.html, list-posts.html, post-title.html, default.html, navigation.html)
- Fixed Disqus config in post.html to use `| jsonify` for safe JavaScript string injection
- Improved honeypot spam field accessibility in contact.html (`aria-hidden`, `tabindex="-1"`, `autocomplete="off"`)
- Fixed HTTP placeholder URLs in pricing.html to use HTTPS
- Removed dead Google Universal Analytics code and `google_analytics_key` config (sunset July 2023)
- Updated Gemfile dependencies to latest stable versions (Jekyll ~> 4.3, jekyll-seo-tag ~> 2.8, etc.) to address known CVEs in kramdown and rexml
