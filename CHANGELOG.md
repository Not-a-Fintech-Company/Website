# Changelog

## 2026-02-19

### Added
- Plausible Analytics on all pages via `_layouts/default.html`

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
