# Deployment Guide

This site is built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- A Cloudflare account (for production deployment)

## Local Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Build for production (output to dist/)
npm run preview      # Preview the production build locally
```

## Project Structure

```
src/
├── assets/              # Logo and images (processed by Astro)
├── components/          # Astro components (e.g. GoogleEmbed.astro)
├── content/
│   └── docs/            # All site content (Starlight pages)
│       ├── index.mdx    # Homepage (splash template)
│       ├── guides/      # Fintech guides (.md)
│       ├── models/      # Financial models (.mdx with embeds)
│       ├── docs/        # Policy documents (.mdx with embeds)
│       ├── resources.md
│       ├── about.md
│       └── license.md
├── content.config.ts    # Content collection schema
└── styles/
    └── custom.css       # Brand overrides (colors, fonts)
public/                  # Static files served as-is (favicons, CNAME, PDFs)
astro.config.mjs         # Astro + Starlight configuration
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

Two analytics services are configured in `astro.config.mjs` via the Starlight `head` config:

- **Plausible Analytics** — privacy-friendly, script ID: `pa-W0Dq5s5xrg0nZbo6PsWi5`
- **Google Analytics** — measurement ID: `G-VJXL7WCFNM`

To change or remove either, edit the `head` array in `astro.config.mjs`.

## Updating Content

All content lives in `src/content/docs/`. To add or edit pages:

- **Markdown pages** (`.md`): Use standard Markdown with YAML frontmatter (`title`, `description`).
- **MDX pages** (`.mdx`): Use when you need the `GoogleEmbed` component for iframe embeds.
- **Sidebar**: Guides, Models, and Docs sections auto-generate from their directories. Resources and About are linked individually. Edit `astro.config.mjs` to change sidebar structure.

After editing, push to the configured branch and Cloudflare will rebuild automatically.

## Troubleshooting

- **Build fails with MDX errors**: Angle-bracket autolinks (`<https://...>`) are not valid in `.mdx` files. Use `[link text](url)` syntax instead.
- **Iframes not loading**: Google Sheets/Docs embeds require `sandbox="allow-scripts allow-same-origin"`. The `GoogleEmbed` component handles this automatically.
- **Search not working**: Pagefind builds the search index during `npm run build`. It won't work during `npm run dev` — use `npm run preview` to test search.
