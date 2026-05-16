# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro 6 + Tailwind v4 + Preact static site for [Not a Fintech Company](https://www.notafintech.co) — an open-source knowledge base for fintech founders. Licensed under CC0 1.0. Deployed on Cloudflare Pages at `notafintech.pages.dev` with primary domain `www.notafintech.co` (`notafintech.co` redirects to `www` via Cloudflare rules). Contact email: hello@notafintech.co.

Previously a Jekyll 4.x site on GitHub Pages — migrated to Astro in February 2026. Migrated again from Starlight to custom Astro + Tailwind in May 2026. No Jekyll or Starlight files remain.

## Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Local dev server at http://localhost:4321
npm run check      # Type-check Astro/TypeScript files (astro check)
npm run build      # Production build (output to dist/) with Pagefind indexing
npm run preview    # Preview production build locally
```

The `npm run build` command chains `astro build && pagefind --site dist`, which builds the site and emits the search index into `dist/pagefind/`. Search only works in production builds, not under `npm run dev` — use `npm run preview` to test search locally.

There are no test or lint commands — this is a content-focused static site.

## Architecture

**Framework**: Astro 6.x with custom Tailwind v4 layouts. Static output (`output: 'static'`). Dev toolbar disabled.

**Configuration**: `astro.config.mjs` is the central config — Preact integration (`compat: false`), MDX, sitemap, and the Tailwind v4 Vite plugin are all defined there. `astro.config.mjs` also marks `/pagefind/pagefind.js` as a Rollup external so Vite doesn't try to resolve the post-build path at bundle time.

**Theming tokens**: Tailwind v4 entry CSS at `src/styles/global.css` defines the design system. Color tokens are CSS variables read by Tailwind's `@theme`. Dark mode uses a `.dark` class on `<html>`, with a first-paint inline script in `BaseLayout.astro` reading `localStorage.theme` to prevent flash of wrong theme.

**Content**: All pages live in `src/content/pages/` as Markdown (`.md`) or MDX (`.mdx`). The content collection is named `pages`. Schema in `src/content.config.ts` defines fields: `title`, `description`, `section`, `template`, `publishedAt`, `updatedAt`, `draft`, `ogImage`, `hideToc`, `hideSidebar`.

**Page templates** (selected by frontmatter `template:` field):
- `article` (default) — long-form with sidebar + prose + sticky TOC
- `section-index` — listing page for a section (auto-lists entries + markdown intro slot)
- `model` — embed-prominent page for Google Sheets models
- `tool` — interactive calculators (named `<slot name="tool" />` for Preact island mount)

**Directory layout:**

```
src/
  layouts/                 # Page-level templates
    BaseLayout.astro       # html/head/body, theme-flash script, meta, analytics
    ArticleLayout.astro
    SectionIndexLayout.astro
    ModelLayout.astro
    ToolLayout.astro
  components/
    layout/                # Site chrome
      Header.astro
      Footer.astro
      MobileMenu.astro
    nav/                   # In-content navigation
      Breadcrumbs.astro
      Sidebar.astro        # Section siblings (Article only)
      Toc.astro            # On-this-page table of contents (Article, desktop only)
    ui/                    # Reusable UI primitives
      ThemeToggle.astro
      SearchModal.tsx      # Preact island, Pagefind-backed ⌘K search
      Prose.astro          # Typography wrapper applying the .prose class
      GoogleEmbed.astro    # Sandboxed iframe wrapper
      GithubIcon.astro     # Inline SVG (since @lucide/astro 1.x dropped brand icons)
    blocks/                # Composable content blocks
      Hero.astro
      GuideCard.astro
      RoadmapGrid.astro
    tools/                 # Interactive calculator islands
      NumberField.tsx
      ResultBlock.tsx
      BreakdownRow.tsx
      TermLoanCalculator.tsx
  content/
    pages/                 # All site content (see Content sections below)
  data/
    navigation.ts          # Top nav + footer link data
    roadmap.ts             # RoadmapGrid source data
  lib/
    term-loan.ts           # Pure math for the Term Loan calculator
  pages/
    index.astro            # Home (hardcoded; not a content entry)
    [...slug].astro        # Dynamic router for everything in src/content/pages/
  styles/
    global.css             # Tailwind v4 entry + theme tokens + base styles
```

**Sidebar**: Auto-generated from Starlight is gone. `Sidebar.astro` queries the `pages` collection for section siblings. Appears only on Article-template pages.

**Search**: Pagefind with a custom Preact modal UI mounted in `BaseLayout` as a `client:idle` island. ⌘K opens the modal. SearchModal dynamic-imports `/pagefind/pagefind.js` via a runtime path variable (to defeat Vite static analysis) with a `.catch` for the dev 404.

**Content sections** (each with an `index.md`):
- `guides/` — Educational guides for fintech founders (5 guides + index)
- `models/` — Financial model templates with Google Sheets embeds (3 models + index)
- `docs/` — Compliance documentation: BSA policy (inline markdown), credit card trunk (PDF iframe + downloads)
- `tools/` — Interactive calculators: Term Loan Unit Economics live; Bank Account + Credit Card as coming-soon stubs linking to `/models/`
- `resources.md`, `about.md`, `license.md` — top-level pages

**Static assets** (`public/`): `favicon.png`, `apple-touch-icon.png`, `og-image.png` (1200×630), `robots.txt`, `_redirects` (Jekyll-era 301s), `credit-card-biz-trunk.pdf`, `credit-card-biz-trunk.ppt`.

## Typography

Self-hosted variable fonts via `@fontsource[-variable]/*`:

- **Display / headings**: **EB Garamond** (variable, OFL) — classical Garalde with true italic forms. Used for hero, h1–h4, page titles.
- **Body / UI**: **Hanken Grotesk** (variable, OFL) — warm humanist sans for body copy, chrome, and form controls.
- **Numeric / monospace**: **JetBrains Mono** — used for code blocks and tabular figures in the calculator.

The previous Fraunces + Inter pair was swapped out (May 15) per audit feedback to break out of the AI-monoculture default font choices. See `.impeccable.md` for the design rationale.

## Color Palette

Restrained, warm-toned, editorial. Single accent (oxblood) used sparingly. All colors are CSS variables, dark mode is a token swap (not a redesign).

| Token | Light | Dark |
|---|---|---|
| `--paper` (background) | `#FAF7F2` | `#15110E` |
| `--ink` (primary text) | `#1A1714` | `#F4EFE7` |
| `--accent` (links, brand) | `#7A2E2A` oxblood | `#CD7572` |
| `--accent-hover` | `#5C2220` | `#DC8B89` |
| `--rule` (dividers) | `#D2C5B0` | `#3C3128` |
| `--muted` (secondary text) | `#5A534D` | `#9E968F` |
| `--surface` (cards) | `#FFFFFF` | `#1F1813` |
| `--surface-2` (tinted sections) | `#EFE8D9` | `#2B221A` |

Contrast: `--ink` on `--paper` is ~16:1 (AAA); `--muted` is ~6.5:1 (AA+); `--accent` on `--paper` ≥ 9:1 (AAA); dark `--accent` on dark `--paper` ~5.6:1 (AA).

## Content Conventions

- Pages use YAML frontmatter with fields listed in the Architecture section
- Page templates: `article` (default), `section-index`, `model`, `tool`
- Google Sheets embeds use the `GoogleEmbed` component in `.mdx` files
- Homepage (`src/pages/index.astro`) is hardcoded — composes Hero + featured guides + Models TOC + open-source callout + RoadmapGrid
- Roadmap data lives in `src/data/roadmap.ts` (typed)
- Footer: CC0 license notice, Totavi hosting credit, GitHub source link
- Footer social links: GitHub only
- CHANGELOG.md tracks site updates

## Analytics

Two services configured in `BaseLayout.astro`:

- **Plausible Analytics** — primary, privacy-friendly. Script ID: `pa-W0Dq5s5xrg0nZbo6PsWi5`
- **Google Analytics** — measurement ID: `G-VJXL7WCFNM`

Both load `async` and use `is:inline` directives.

## SEO

- OpenGraph image (`og-image.png` at 1200×630) with width/height/type meta tags
- Twitter Card (`summary_large_image`)
- Apple touch icon at `/apple-touch-icon.png` (180×180)
- Theme color: `#7A2E2A` (light) / `#15110E` (dark) — set via `prefers-color-scheme` media queries on the `theme-color` meta
- Favicon (`/favicon.png`)
- Canonical URL per page (set in `BaseLayout`)
- Sitemap at `/sitemap-index.xml` (generated by `@astrojs/sitemap`); `robots.txt` references it

## Deployment

**Host**: Cloudflare Pages with Git integration (auto-deploys on push to `main`).
- **Project name**: `notafintech` (on Cloudflare)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 20 or newer (Tailwind v4 requirement; Cloudflare default Node 22 is fine)
- **Primary domain**: `www.notafintech.co` (canonical)
- **Redirect**: `notafintech.co` → `www.notafintech.co` (Cloudflare redirect rule)
- **Pages URL**: `notafintech.pages.dev`

`wrangler.jsonc` is for local Wrangler CLI deploys only — Git-connected Pages deploys do not use it. Cloudflare's Pages build system handles deployment natively after running the build command.

See `DEPLOYMENT.md` for full setup, `MIGRATION.md` for the Jekyll→Astro and Starlight→Astro cutover steps.

## Accessibility

- All `target="_blank"` links include `rel="noopener noreferrer"`
- All iframes include `sandbox="allow-scripts allow-same-origin"` and `title`
- Skip-to-content link at the top of `<body>` (visible on focus)
- Touch targets ≥ 44px on icon buttons
- `prefers-reduced-motion` media query disables all transitions/animations
- Focus rings global: 2px accent outline with 2px offset
- ThemeToggle exposes `aria-pressed` reflecting current state
- WCAG AA fully met; some elements approach AAA

## Security Conventions

- No secrets or API keys in the repo — analytics IDs are public by design
- SearchModal renders Pagefind excerpts via safe text-node + `<mark>` element interpolation (parsed with `String.prototype.matchAll`), not via any raw-HTML injection sink

## MDX Gotchas

- Angle-bracket autolinks (`<https://...>`) are invalid in `.mdx` — MDX interprets `<` as JSX. Use `[text](url)` syntax.
- URL query params in JSX props: use `&` not `&amp;` (JSX, not HTML).

## Logo / Branding

The header is a text wordmark in EB Garamond — no static PNG logo. There is no `src/assets/` directory; the old `logo.svg` / `logo.png` were removed when the migration shipped.

## Design Context

See `.impeccable.md` at the repo root for users / brand personality / aesthetic direction / anti-references / design principles. This file feeds the impeccable, audit, critique, polish, and other design skills.
