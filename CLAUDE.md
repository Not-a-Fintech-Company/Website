# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro + Starlight static site for [Not a Fintech Company](https://notafintech.co) — an open-source knowledge base for fintech founders. Licensed under CC0 1.0. Deployed on Cloudflare Pages. Contact email: hello@notafintech.co.

## Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Local dev server at http://localhost:4321
npm run build      # Production build (output to dist/)
npm run preview    # Preview production build locally
```

There are no test or lint commands — this is a content-focused static site.

## Architecture

**Framework**: Astro 5.x with Starlight documentation theme. Static output (`output: 'static'`).

**Configuration**: `astro.config.mjs` is the central config — Starlight integration, sidebar structure, analytics scripts, SEO meta tags, custom CSS, and component overrides are all defined here.

**Content**: All pages live in `src/content/docs/` as Markdown (`.md`) or MDX (`.mdx`). MDX is used only when a page needs the `GoogleEmbed` component for Google Sheets iframes. Content schema is defined in `src/content.config.ts` using Starlight's `docsSchema()`.

**Sidebar**: Guides, Models, and Docs sections auto-generate from their directories. Resources and About are linked individually by slug.

**Components**:
- `src/components/GoogleEmbed.astro` — sandboxed iframe wrapper for Google Sheets embeds
- `src/components/Footer.astro` — custom footer extending Starlight's default, adds CC0 license notice and Totavi hosting credit

**Styling**: `src/styles/custom.css` overrides Starlight CSS variables for brand colors (`#284B9C`), Roboto font, content width, and iframe containers.

**Content sections** (each with its own `index.md`):
- `guides/` — Educational guides for fintech founders
- `models/` — Financial model templates (Google Sheets embeds)
- `docs/` — Compliance documentation (BSA policy, credit card trunk)

**Static assets**: `public/` contains favicon, apple-touch-icon, OG image, robots.txt, and PDF/PPT downloads.

**Search**: Pagefind (built into Starlight). Index is generated at build time — only works in production builds, not `npm run dev`.

## Content Conventions

- Pages use YAML frontmatter with `title` and `description`
- Homepage (`index.mdx`) uses Starlight's `template: splash` with a hero section
- Google Sheets embeds use the `GoogleEmbed` component in `.mdx` files
- Footer social links: GitHub only
- CHANGELOG.md tracks all site updates

## Analytics

Two services configured in `astro.config.mjs` head config:
- **Plausible Analytics** — script ID: `pa-W0Dq5s5xrg0nZbo6PsWi5`
- **Google Analytics** — measurement ID: `G-VJXL7WCFNM`

## Deployment

Cloudflare Pages with git integration. Build command: `npm run build`, output directory: `dist/`. Config in `wrangler.jsonc`. Custom domain `notafintech.co` configured in Cloudflare dashboard.

## Security Conventions

- All `target="_blank"` links include `rel="noopener noreferrer"`
- All iframes include `sandbox="allow-scripts allow-same-origin"` and `title`
- No secrets or API keys in the repo — analytics IDs are public by design

## MDX Gotchas

- Angle-bracket autolinks (`<https://...>`) are invalid in `.mdx` — MDX interprets `<` as JSX. Use `[text](url)` syntax.
- URL query params in JSX props: use `&` not `&amp;` (JSX, not HTML).
