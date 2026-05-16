# Not a Fintech Company

The website for [notafintech.co](https://www.notafintech.co) — an open-source knowledge base for fintech founders. Tactical guides, financial models, compliance documents, and interactive calculators for launching card products, debit programs, lending businesses, and challenger banks.

All content is licensed under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain). No attribution required.

## Stack

- **[Astro 6](https://astro.build)** — static site generator (output: 'static')
- **[Tailwind v4](https://tailwindcss.com)** — CSS-first config via `@theme` directive
- **[Preact](https://preactjs.com)** — interactive calculator islands (`client:load`)
- **[Pagefind](https://pagefind.app)** — client-side search (⌘K opens a custom modal)
- **[Cloudflare Pages](https://pages.cloudflare.com)** — hosting, auto-deploys on push to `main`

Self-hosted variable fonts (EB Garamond, Hanken Grotesk, JetBrains Mono) via `@fontsource[-variable]/*`.

## Development

```bash
npm install        # Install dependencies
npm run dev        # Local dev server at http://localhost:4321
npm run check      # Type-check Astro/TypeScript files
npm run build      # Production build to dist/ (includes Pagefind indexing)
npm run preview    # Preview the production build locally
```

Search only works in production builds — Pagefind indexes are emitted by the post-build step (`pagefind --site dist`). Use `npm run preview` to test search locally.

There are no test or lint commands — this is a content-focused static site.

## Repo layout

```
src/
├── layouts/             # Page-level templates (BaseLayout, Article, SectionIndex, Model, Tool)
├── components/
│   ├── layout/          # Site chrome (Header, Footer, MobileMenu)
│   ├── nav/             # In-content navigation (Breadcrumbs, Sidebar, Toc)
│   ├── ui/              # UI primitives (ThemeToggle, SearchModal, Prose, GoogleEmbed, GithubIcon)
│   ├── blocks/          # Content blocks (Hero, GuideCard, RoadmapGrid)
│   └── tools/           # Calculator islands (NumberField, ResultBlock, BreakdownRow, TermLoanCalculator)
├── content/pages/       # All site content (markdown + MDX) — see "Content sections" below
├── data/                # Navigation + roadmap data
├── lib/                 # Pure utility modules (e.g. term-loan.ts math)
├── pages/               # Astro routes (index.astro home, [...slug].astro dynamic)
├── content.config.ts    # Content collection schema
└── styles/global.css    # Tailwind v4 entry, theme tokens, prose styles, font fallbacks
public/                  # Static assets (favicons, robots.txt, _redirects, _headers, llms.txt, PDFs, IndexNow key)
astro.config.mjs         # Astro config (Preact, MDX, sitemap with per-URL lastmod, Tailwind v4)
.github/workflows/       # GitHub Actions (indexnow.yml submits URLs to IndexNow on push)
scripts/                 # One-off generation scripts (e.g. font-fallbacks.mjs)
docs/                    # Internal documentation + historical SEO audits
```

## Content sections

| Section | Notes |
|---|---|
| `guides/` | 5 long-form guides for fintech founders, each with a named author byline |
| `models/` | 3 Google Sheets-backed financial models (bank account, credit card, term loan) |
| `tools/` | Interactive calculators — Term Loan Unit Economics is live; Bank Account and Credit Card are stubs with rich previews |
| `docs/` | Compliance documents (BSA/AML sample policy, credit card business trunk) |
| `resources.md`, `about.md`, `license.md` | Top-level pages |

Each page uses YAML frontmatter with `title`, `description`, `section`, `template`, `publishedAt`, `updatedAt`, `authors`, plus a few optional flags. See `src/content.config.ts` for the full schema.

## SEO infrastructure

- **JSON-LD structured data** — Organization + WebSite graph sitewide; Article + BreadcrumbList on guide pages; SoftwareApplication on `/tools/term-loan/`
- **Per-URL `<lastmod>`** — `@astrojs/sitemap` `serialize` callback reads `updatedAt` from frontmatter at build time
- **`llms.txt`** — manifest for AI search crawlers (Perplexity, ChatGPT, Claude, etc.)
- **IndexNow** — GitHub Action submits all sitemap URLs to Bing/Yandex/Naver/Seznam on every push to `main`
- **Security + caching headers** — `public/_headers` sets HSTS preload, CSP, X-Frame-Options, and immutable cache TTL on `_astro/*` content-hashed assets
- **Per-article bylines** — `authors` frontmatter field renders a visible "By X" line and `Person` objects in Article JSON-LD
- **Font metrics** — Latin-only `@font-face` declarations plus Capsize-generated fallback metrics on Georgia / Times New Roman / Arial / Helvetica Neue to eliminate CLS from `font-display: swap`
- **Site-wide E-E-A-T disclaimer** — YMYL-appropriate "not legal/financial advice" footer

The full audit history lives in `docs/seo/`.

## Contributing

Pull requests welcome. The content is CC0 1.0 (public domain) — no attribution required.

To add a guide: drop a Markdown file in `src/content/pages/guides/`, add frontmatter (`title`, `description`, `section: guides`, `template: article`, `publishedAt`, `updatedAt`, `authors`), and push to `main`. Cloudflare will rebuild automatically.

For setup details and Cloudflare configuration see [DEPLOYMENT.md](DEPLOYMENT.md). For the project's editorial direction and design principles see [.impeccable.md](.impeccable.md).

## License

All content is licensed [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Free to use, reproduce, and redistribute without restriction.
