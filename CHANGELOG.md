# Changelog

## 2026-06-13 — favicon.ico, 404 page, health-check script, CF token cleanup

### Added
- **`src/pages/404.astro`** — real 404 page (BaseLayout, `noindex`, editorial design with links back to Guides/Models/Tools/Docs). Fixes a soft-404 where unknown paths served the homepage at HTTP 200 because no `dist/404.html` existed; Cloudflare Pages now serves a proper 404 for unmatched routes
- **`public/favicon.ico`** — multi-resolution ICO (48×48 + 32×32, 32-bit) rasterized from the oxblood credit-card-N mark. `BaseLayout` emits `<link rel="icon" href="/favicon.ico" sizes="any">` first, ahead of the SVG + PNG icon links — covers the `/favicon.ico` path that browsers, RSS readers, and link unfurlers probe regardless of `<link>` tags
- **`scripts/health-check.sh`** — one-command daily HTTP health check (no Google API / OAuth calls, safe anytime). Covers core pages, SEO endpoints, the soft-404 guard, legacy-domain redirects, and security headers. Exits non-zero on failure. `BASE=<url>` overrides for previews
- **`SITE-HEALTH.md`** + `@`-import pointer in `CLAUDE.md` — tracks the auto-generated health report from `totavi-llc/site-healthcheck` (regenerated each run; do not hand-edit)

### Security
- **Deleted the over-scoped `notafintech build token`** Cloudflare API token (~23 perms across 1 Account + User + All zones — same broad-template shape as `barranca-verde-prod`). Confirmed unused: notafintech deploys via Git-integrated Pages (GitHub App, not an API token); repo has zero `CLOUDFLARE_API_TOKEN` references; token was dormant since Apr 17 while deploys kept running. Verified post-deletion via an empty commit — Cloudflare Pages + IndexNow check-runs both reported success. If a token is ever needed for manual `wrangler pages deploy`, create minimal: `Account → Cloudflare Pages → Edit`, single account, no zones, named `notafintech-ci-deploy`

### Health snapshot (no code changes)
- GSC indexing trending up: indexed pages 4 → 9 over the audit window; impressions 71 → 152 (28d). Manual re-index requested for `/guides/go-to-market-plan/` + `/docs/bsa/`
- Weekly automated healthcheck ALERTs on notafintech traffic swings are noise-floor artifacts (sub-20 weekly sessions); the real signal — impressions + indexed-page count — is positive

---

## 2026-05-25 — Post-audit health check + legacy domain consolidation

### Verified (no code changes)
- **GA4 organic traffic** (28-day): 10 sessions, 8 users, 25 pageviews. Up from 7 organic in the May 16 baseline — directional improvement, still noise-level absolute. Top organic landing pages: `/` (5 sessions, 60% engaged, 4.4 pv/session), `/guides`, `/models/credit-card` (first organic hit since the P1-8 prose rewrite). No regressions vs. baseline.
- **GSC search performance** (28-day): 0 clicks, 11 impressions across 5 query rows. Best-positioned query: "self challenger bank fintech debit card features fees" at position 7.5 on `/guides/guide-to-starting-a-challenger-bank/`. Other queries at position 24-91. Too early to measure audit lift (typical 2-8 week lag).
- **Sitemap** at `/sitemap-index.xml`: 21 URLs submitted 2026-05-16, 0 errors, 0 warnings.
- **URL Inspection** across all 21 URLs:
  - 7 PASS / indexed (`/`, `/guides/`, `/guides/guide-to-starting-a-challenger-bank/`, `/guides/how-to-launch-a-card-product/`, `/models/bank-account/`, `/models/term-loan/`, `/tools/term-loan/`)
  - 12 "Discovered — currently not indexed" (normal new-site crawl-budget pattern; the audit signals shipped May 16 should move these to indexed over 2-8 weeks)
  - 3 stale-data verdicts (pre-migration crawls from Nov-Dec 2025 that GSC hadn't refreshed): `/models/`, `/resources/`, `/guides/n-steps-to-closing-a-bank-partner/`. Manual re-index requested via GSC URL Inspector — should flip to PASS within days.
- **Rich results detection**: only Breadcrumbs surfaced so far. Article + SoftwareApplication JSON-LD blocks are in the HTML but Google's rich-results validator typically lags 2-6 weeks behind indexation. Re-check mid-June.
- **Zero 4xx-class errors site-wide.**

### Changed — legacy domain consolidation
Two old domains now properly funnel into the canonical `www.notafintech.co`:

- **`notafintech.company`** (the pre-2026 Jekyll-era domain) — was previously serving a `302` redirect that collapsed every deep URL to the `.co` homepage, losing per-page link equity (notably from an Alloy blog backlink). Reconfigured Porkbun URL Forwarding:
  - Type: Permanent (301)
  - Include Path: yes
  - Wildcard: yes (covers apex + www)
  - Destination: `https://www.notafintech.co`
  - Then submitted **Change of Address** in GSC (`sc-domain:notafintech.company` → `sc-domain:notafintech.co`) so Google formally consolidates ranking signals
- **`notafintechcompany.com`** (newly acquired; previously appeared as a referring URL to the old `.company` domain) — set up identical Porkbun forwarding, added as GSC property (DNS TXT verification), submitted Change of Address. DNS still propagating to public resolvers at the time of writing; redirect should be externally testable within 24-48h.

End-state: any URL on `notafintech.company` or `notafintechcompany.com` (with or without path or query string) issues a 301 to the path-equivalent on `www.notafintech.co`.

### Internal docs
- New memory note `cloudflare-security-config` (saved earlier this session) — captured here for the index. Bot Fight Mode + Browser Integrity Check are intentionally OFF on CF; a WAF Skip rule covers SEO crawler paths defensively.
- Updated memory note `credentials-location` — documents the recurring config-clobber issue between `~/dev/ayso-website` and this project (both share `~/.config/claude-seo/google-api.json` + `oauth-token.json`; whichever ran last wins). Includes the swap procedure and the OAuth scope-drift gotcha (local `.google-token.json` only has `webmasters.readonly` scope; need to re-run `--auth --creds` to restore the broader scope set after a swap).

---

## 2026-05-16 — Brand mark refresh + IndexNow operational

### Changed — brand assets
- New brand mark in oxblood (`#7A2E2A`) + paper (`#FAF7F2`): credit-card-N motif with double border, lucide-style credit card icon, diagonal slash, serif "N". Replaces the prior navy + cream design
- `public/favicon.svg` — hand-coded SVG source of truth (1.1 KB)
- `public/favicon.png` — 32×32 fallback rasterized from SVG
- `public/apple-touch-icon.png` — 180×180 (was navy + circle-and-cross "OFC" mark)
- `public/og-image.svg` — new social-preview source: paper background, oxblood logo centered, EB Garamond headline ("Not a Fintech Company"), Hanken Grotesk subtitle ("Open-source knowledge base for fintech founders"), letter-spaced `NOTAFINTECH.CO` footer, oxblood rule at bottom
- `public/og-image.png` — 1200×630 rasterized from the new SVG; replaces the navy "Open Sourcing the rest of Fintech" version
- `notafintech.png` (repo root) — 1024×1024 raster for GitHub repo Social Preview upload, org avatar, etc.
- `BaseLayout.astro` now serves `favicon.svg` as the primary icon with `favicon.png` fallback

Generation flow: edit SVG sources, re-rasterize with `rsvg-convert`. Documented in `CLAUDE.md` under "Logo / Branding".

### Fixed — IndexNow operational
- IndexNow GitHub Action workflow was failing on every run with the sitemap fetch returning a Cloudflare "Just a moment..." bot-challenge HTML page instead of XML. Two changes resolved it:
  - Workflow: added a Chrome User-Agent string to both `curl` calls (sitemap fetch + IndexNow POST), defensive against UA-only matching
  - Cloudflare: disabled **Bot Fight Mode** and **Browser Integrity Check** in the site's security settings. The site is open CC0 content with no auth surface — these protections were creating friction for the legit AI/SEO crawlers we actually want
- A WAF Custom Rule was also added covering `/sitemap-*.xml`, `/llms.txt`, `/robots.txt`, and the IndexNow key file — defensive in case Bot Fight Mode is ever re-enabled
- Manual workflow dispatch verified end-to-end: sitemap returns 20 URLs (200 OK), IndexNow returns 200 (submitted successfully)

### Internal docs
- `CLAUDE.md` static-assets section + new "Logo / Branding" subsection reflect the SVG-driven workflow
- `DEPLOYMENT.md` project structure section enumerates the new brand files
- `.impeccable.md` color tokens corrected to match `global.css` (the May 13 audit hardening lifted dark accent from `#B85450` → `#CD7572` and darkened muted/rule; design context was still showing pre-hardening values)

---

## 2026-05-16 — SEO audit implementation (P0 + P1 + P2 + P3)

Ran `/seo audit` against production, then closed or declined every item across all four priority tiers. 14 commits, audit health score estimate up from **57/100 → ~85/100**.

### Added — structured data + crawler discovery
- **JSON-LD sitewide** (P1-5): `Organization` + `WebSite` `@graph` in `BaseLayout`; `Article` in `ArticleLayout` (gated on `publishedAt`); `BreadcrumbList` inline in `Breadcrumbs.astro`; `SoftwareApplication` + `Offer` on `/tools/term-loan/` via a `schema` prop on `ToolLayout`
- **`og:type=article`** on article-template pages with `article:published_time` / `article:modified_time` meta (P1-6)
- **`public/llms.txt`** — AI-search crawler manifest with all guides/models/tools/docs/license/contact (P1-9)
- **Per-URL sitemap `<lastmod>`** — `astro.config.mjs` synchronously scans frontmatter at config-load time and builds a URL → date map for `@astrojs/sitemap`'s `serialize` callback (P3-22)
- **IndexNow workflow** (`.github/workflows/indexnow.yml`) — submits all sitemap URLs to Bing/Yandex/Naver/Seznam on every push to main. Key file at `public/<uuid>.txt` (P2-19)
- **`public/_redirects`** entry: `/sitemap.xml` → `/sitemap-index.xml` 301 (P1-10)

### Added — content fields + trust signals
- **`authors` frontmatter field** in `src/content.config.ts` (array of `{name, url}`); rendered as a visible byline in `ArticleLayout` and as `Person` objects in Article JSON-LD (P1-12). Populated across all 5 guides: Aaron Frank (3), Jeremy Black, Seema Amble
- **Site-wide YMYL disclaimer** in the footer ("not legal/financial/regulatory/tax/accounting advice; consult qualified counsel") (P2-13)
- **About page** expanded from 72 → 342 words: "Why this exists" / "How we work" / "Contribute" sections plus the existing contributor list. Added Jeremy Black and Seema Amble (P3-23)

### Added — performance + security infrastructure
- **`public/_headers`** (P1-7 + P2-20): HSTS preload, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP scoped to Plausible/GTM/GA/Google Sheets, immutable cache (`max-age=31536000`) on `/_astro/*` `/pagefind/*` `/fonts/*`
- **Font preload** in `BaseLayout` — `<link rel="preload" as="font" crossorigin>` for EB Garamond + Hanken Grotesk Latin woff2 (cuts LCP ~200-400ms on cold visits) (P2-17)
- **Metrics-aligned font fallbacks** — Capsize-generated size-adjust/ascent-override/descent-override declarations for Georgia/Times New Roman (serif) and Arial/Helvetica Neue (sans) eliminate CLS from `font-display: swap`. Generator script at `scripts/generate-font-fallbacks.mjs` (P2-18)
- **Latin-only `@font-face`** — replaced `@fontsource-variable/*/index.css` imports with explicit Latin-subset declarations. Dist asset count drops from 14+ subset variants to 5 Latin-only files (P2-16)

### Changed — content quality
- **Per-article bylines** rendered on all 5 guide pages with rel="author" LinkedIn links
- **Model pages rewritten** (P1-8): `/models/credit-card/`, `/models/bank-account/`, `/models/term-loan/` each expanded from ~60 → 400+ words. Adds "How to use it" (bulleted input list with industry-standard ranges), "Modeling assumptions", and "Related" sections. Iframe + "make a copy" link remain prominent
- **Tool stub pages expanded** (P1-11): `/tools/bank-account/` and `/tools/credit-card/` from ~80 → ~250 words each, describing the eventual interactive calculator's inputs/outputs
- **Resources page rewritten** (P2-15): bare-URL `<https://...>` autolinks → `[Title](url) — attribution` format. 45 external links verified live (all 200). Consolidated 13 small sections into 7 thematic ones. Preserved the "Start here" intro and Twitter quote section
- **Question-form headings on 3 guides** (P2-14): card-product, bank-partner, challenger-bank h2/h3s rewritten ("Networks" → "How do you choose a card network?"). Table of Contents anchors updated. Underlying content untouched. n-steps and go-to-market guides left as-is (already imperative-action or question-oriented)
- **Internal linking from orphans** (P3-24): added "Start here" section to `/resources/`; "Related" sections to `/docs/bsa/` and `/docs/credit-card-trunk/`; annotated `/models/` index to point at the `/tools/term-loan/` calculator. `/tools/term-loan/` inbound link count: 1 → 6

### Fixed — content quality (P0)
- **Empty stub headings removed** (P0-3): `/guides/how-to-launch-a-card-product/` had `<h4>Underwriting</h4>`, `<h4>Collections</h4>`, `<h4>Marketing ToDos</h4>` with no body content. Removed headings + TOC entries
- **`publishedAt` + `updatedAt` populated** (P0-4) on all 20 content files. `publishedAt` = git first-add date; `updatedAt` = 2026-05-16
- **GSC verification + GA4 scopes** (P0-1): credentials migrated to local repo, OAuth re-auth flow expanded scopes to include `analytics.readonly` and `indexing`
- **Post-migration indexation** (P0-2): confirmed clean via GSC URL Inspection

### Declined / closed without change
- **P3-21** (`twitter:site` / `twitter:creator` meta): site owner no longer maintains a Twitter/X presence; no canonical handle

### Added — tooling
- `@capsizecss/core` + `@capsizecss/metrics` as devDependencies for font-fallback metrics generation
- `scripts/generate-font-fallbacks.mjs` — one-off generator that emits the @font-face fallback CSS

### Internal docs
- `docs/seo/2026-05-16-audit.md` — full SEO audit output (8 sub-skill subagents in parallel) preserved as historical reference

---

## 2026-05-16 — Documentation refresh, orphan cleanup, analytics + gitignore

### Removed
- `src/assets/logo.svg`, `src/assets/logo.png` — orphan Starlight-era logo files
- `public/siteicon.png`, `public/touch-icon.png` — Jekyll-era favicon variants, never referenced by the new BaseLayout
- `public/CNAME` — GitHub Pages artifact, unused on Cloudflare Pages
- `public/sitemap.xml` — static sitemapindex backup, redundant now that `@astrojs/sitemap` emits `sitemap-index.xml` + `sitemap-0.xml`

### Changed
- Restored **Google Analytics** alongside Plausible in `BaseLayout.astro` — both trackers wanted, reverting the audit-era decision to drop GA
- `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `DEPLOYMENT.md` updated to reflect the post-migration state (typography swap, Tools section live, audit fixes, calculator, dual-tracker analytics)

### Added
- `.gitignore` rules for local credential mirrors (`analytics-credentials.md`, `.google-client-secret.json`, `.google-token.json`) — never to be committed; canonical credentials remain at `~/dev/ghost/analytics-credentials.md`

### Partial work — not pushed
- Started a `/seo audit` of the live site. Four of eight sub-skill subagents completed (technical, schema, sitemap, SXO) with detailed findings. Four were interrupted before completion (content, performance, GEO, google). The completed audits identified actionable items for a future PR:
  - **Technical** (71/100): soft-404 fallback returns 200 for unknown paths; thin "Coming soon" stub pages are indexed; missing HSTS/CSP/X-Frame-Options security headers; trailing-slash inconsistency on internal homepage links
  - **Schema** (28/100): zero structured data on any page; recommended additions are Organization, WebSite + SearchAction, Article, Person (for /about/), BreadcrumbList — projected score after implementation: 74/100
  - **Sitemap** (74/100): `/sitemap.xml` returns HTML instead of redirecting to `/sitemap-index.xml`; no `<lastmod>` on any URL; stub tool pages are indexable
  - **SXO** (gap score 32/100; persona scores 48/62): `/models/credit-card/` is a critical page-type mismatch (template-marketplace SERP, stub page); guide pages have empty subsections; no media; no per-article author attribution
  
  Address in a future PR — none are blockers for the current production deploy.

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
