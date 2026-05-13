# Deployment Guide

This site is built with [Astro](https://astro.build) + [Tailwind v4](https://tailwindcss.com) + [Preact](https://preactjs.com) and deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- A Cloudflare account (for production deployment)

## Local Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:4321
npm run check        # Type-check Astro/TypeScript files
npm run build        # Build for production (output to dist/) with Pagefind indexing
npm run preview      # Preview the production build locally
```

The `npm run build` command chains `astro build && pagefind --site dist`, which generates the site and then indexes all pages into `dist/pagefind/` for the search modal.

## Project Structure

```
src/
├── assets/              # Fonts and images (processed by Astro)
├── components/
│   ├── layout/          # Page layout templates
│   ├── nav/             # Navigation components (Header, Footer, etc.)
│   ├── ui/              # UI components (ThemeToggle, Sidebar, Toc, SearchModal)
│   └── blocks/          # Content blocks (Hero, GuideCard, RoadmapGrid)
├── content/
│   └── pages/           # All site content
│       ├── guides/      # Fintech guides (.md)
│       ├── models/      # Financial models (.mdx with embeds)
│       ├── docs/        # Policy documents (.mdx with embeds)
│       ├── tools/       # Tools section (stub)
│       ├── about.md
│       └── license.md
├── data/                # Navigation data file
├── pages/               # Astro routes (index.astro, [...slug].astro)
├── content.config.ts    # Content collection schema
└── styles/
    └── global.css       # Tailwind v4 entry CSS and design tokens
public/                  # Static files served as-is (favicons, robots.txt, PDFs)
astro.config.mjs         # Astro configuration (Preact, MDX, sitemap, Tailwind)
wrangler.jsonc           # Cloudflare Pages configuration
```

## Deploying to Cloudflare Pages

### Option A: Connect via Git (recommended)

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and go to **Workers & Pages**.
2. Click **Create** > **Pages** > **Connect to Git**.
3. Select the **Not-a-Fintech-Company/Website** repository and the **main** branch.
4. Configure the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** Set the environment variable `NODE_VERSION` to `18` (or later).
5. Click **Save and Deploy**.

Cloudflare will automatically rebuild on every push to the configured branch.

### Option B: Direct upload via Wrangler CLI

1. Install Wrangler globally:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

3. Build the site:
   ```bash
   npm run build
   ```

4. Deploy:
   ```bash
   wrangler pages deploy dist
   ```

   On first run, Wrangler will prompt you to create a new project or select an existing one. The project name in `wrangler.jsonc` is `not-a-fintech-company`.

## Custom Domain Setup

1. In the Cloudflare dashboard, go to your Pages project > **Custom domains**.
2. Click **Set up a custom domain** and enter `www.notafintech.co` (primary).
3. Also add `notafintech.co` as a custom domain.
4. Cloudflare will guide you through DNS configuration:
   - If the domain is already on Cloudflare DNS, it will add the required CNAME records automatically.
   - If the domain is on an external registrar, point the DNS to Cloudflare's nameservers or add a CNAME record pointing to `<project-name>.pages.dev`.
5. Set up a Cloudflare redirect rule to redirect `notafintech.co` → `www.notafintech.co` (301).

The custom domain and redirect rules are configured entirely through the Cloudflare dashboard.

## Environment Variables

No environment variables are required for the build. The site is fully static.

If needed, environment variables can be set in:
- **Cloudflare dashboard:** Pages project > Settings > Environment variables
- **Local development:** Create a `.env` file (not committed to git)

## Analytics

Two analytics services are configured in `astro.config.mjs` via the `head` config:

- **Plausible Analytics** — privacy-friendly, script ID: `pa-W0Dq5s5xrg0nZbo6PsWi5`
- **Google Analytics** — measurement ID: `G-VJXL7WCFNM`

To change or remove either, edit the `head` array in `astro.config.mjs`.

## Updating Content

All content lives in `src/content/pages/`. To add or edit pages:

- **Markdown pages** (`.md`): Use standard Markdown with YAML frontmatter (`title`, `description`, `section`, `template`, `publishedAt`, `updatedAt`, `draft`, `ogImage`, `hideToc`, `hideSidebar`).
- **MDX pages** (`.mdx`): Use when you need the `GoogleEmbed` component for iframe embeds.
- **Templates**: Pages use one of four templates: `article` (default), `section-index`, `model`, `tool`.

After editing, push to the configured branch and Cloudflare will rebuild automatically.

## Troubleshooting

- **Build fails with MDX errors**: Angle-bracket autolinks (`<https://...>`) are not valid in `.mdx` files. Use `[link text](url)` syntax instead.
- **Iframes not loading**: Google Sheets/Docs embeds require `sandbox="allow-scripts allow-same-origin"`. The `GoogleEmbed` component handles this automatically.
- **Search not working**: Pagefind builds the search index during `npm run build` (via the `pagefind --site dist` post-build step). It won't work during `npm run dev` — use `npm run preview` to test search locally.
- **Type errors on build**: Run `npm run check` to diagnose TypeScript/Astro type issues before building.
