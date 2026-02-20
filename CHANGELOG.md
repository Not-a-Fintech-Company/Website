# Changelog

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
