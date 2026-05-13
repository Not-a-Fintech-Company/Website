# Astro + Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-12-astro-tailwind-migration-design.md`

**Goal:** Migrate `notafintech.co` from Astro + Starlight to Astro + Tailwind v4 + Preact, with a fresh editorial visual identity. Preserve all content URLs, search, and dark mode. Single PR, single deploy. Calculators and audits are explicitly out of scope.

**Architecture:** Big-bang migration on a git worktree. Remove Starlight entirely. Build custom Astro layouts styled with Tailwind v4 (CSS-first config). Self-host fonts. Preact for islands — search modal now, calculators later. Pagefind as a post-build CLI step. Five page templates (Home, SectionIndex, Article, Model, Tool) selected by frontmatter.

**Tech Stack:** Astro 5, Tailwind v4, Preact, Pagefind, MDX, `@astrojs/sitemap`, Fraunces / Inter / JetBrains Mono (self-hosted via `@fontsource[-variable]`), Lucide icons.

**Note on package versions:** This plan is dated 2026-05-12. Where version numbers appear in `package.json` snippets, treat them as floors — the executing agent should run `npm install <pkg>@latest` and accept whatever current minor is shipped, unless a major-version pin is explicitly called out. The plan flags compatibility checkpoints.

**Prerequisite:** Before Task 1, create an isolated worktree via `superpowers:using-git-worktrees`. Suggested branch name: `astro-tailwind-migration`. All subsequent commits land on that branch in the worktree.

---

## File Structure (final state)

```
src/
  pages/
    index.astro                     # home page (hardcoded)
    [...slug].astro                 # dynamic routing for all content pages
  layouts/
    BaseLayout.astro                # html, head, body, theme-flash script
    ArticleLayout.astro             # long-form prose template
    SectionIndexLayout.astro        # section landing template
    ModelLayout.astro               # embed-prominent template
    ToolLayout.astro                # full-width tool template
  components/
    layout/
      Header.astro
      Footer.astro
      MobileMenu.astro
    nav/
      Sidebar.astro                 # section siblings (Article only)
      Toc.astro                     # right TOC (Article only, desktop)
      Breadcrumbs.astro
    ui/
      ThemeToggle.astro
      SearchButton.astro
      SearchModal.tsx               # Preact island
      Prose.astro                   # typography wrapper
      GoogleEmbed.astro             # restyled, kept semantically
    blocks/
      Hero.astro
      GuideCard.astro
      RoadmapGrid.astro
  content/
    pages/                          # renamed from src/content/docs/
      about.md
      license.md
      resources.md
      guides/
        index.md
        ...
      models/
        index.md
        bank-account.mdx
        credit-card.mdx
        term-loan.mdx
      docs/
        index.md
        bsa.md
        credit-card-trunk.mdx
      tools/
        index.md                    # NEW stub
  content.config.ts                 # rewritten schema
  data/
    navigation.ts                   # top nav + footer link data
    roadmap.ts                      # RoadmapGrid source data
  styles/
    global.css                      # Tailwind import + theme tokens + base styles
  assets/
    logo.svg                        # kept temporarily; wordmark in Header supersedes use
    logo.png                        # kept temporarily; may be removed in a follow-up

public/
  _redirects                        # unchanged
  robots.txt                        # updated in Task 32
  favicon.png                       # unchanged
  apple-touch-icon.png              # unchanged
  og-image.png                      # unchanged
  ... other static assets unchanged

docs/superpowers/
  specs/2026-05-12-astro-tailwind-migration-design.md
  plans/2026-05-12-astro-tailwind-migration.md   # this file
```

**Removed entirely:** `src/components/Footer.astro` (Starlight-extending version), `src/components/GoogleEmbed.astro` (old version), `src/styles/custom.css`, `@astrojs/starlight` dependency.

---

## Phase 1 — Foundation

### Task 1: Verify worktree and clean working state

**Files:** none

- [ ] **Step 1: Confirm you are in the worktree, not the main checkout**

```bash
pwd
git rev-parse --show-toplevel
git status
git branch --show-current
```

Expected: working directory ends with the worktree path (e.g., `.../Website-astro-tailwind-migration`), branch is `astro-tailwind-migration`, working tree is clean.

If not, stop and run `superpowers:using-git-worktrees` first.

- [ ] **Step 2: Confirm Node version**

```bash
node --version
```

Expected: `v20.x` or higher (Tailwind v4 requires Node 20+). If lower, install Node 20 LTS or 22.

---

### Task 2: Remove Starlight, install new dependencies

**Files:**
- Modify: `package.json` (replaced via `npm install/uninstall`)

- [ ] **Step 1: Uninstall Starlight**

```bash
npm uninstall @astrojs/starlight
```

- [ ] **Step 2: Install runtime deps**

```bash
npm install \
  @astrojs/mdx@latest \
  @astrojs/preact@latest \
  @astrojs/sitemap@latest \
  @tailwindcss/vite@latest \
  @tailwindcss/typography@latest \
  tailwindcss@latest \
  preact@latest \
  @fontsource-variable/fraunces@latest \
  @fontsource-variable/inter@latest \
  @fontsource/jetbrains-mono@latest \
  lucide-astro@latest \
  lucide-preact@latest
```

- [ ] **Step 3: Install build-time dep (pagefind) as devDependency**

```bash
npm install --save-dev pagefind@latest
```

- [ ] **Step 4: Verify `package.json` reads sensibly**

```bash
cat package.json
```

Expected: `@astrojs/starlight` is **not** in `dependencies`. All packages from Steps 2–3 are present. `astro` remains at `^5.x`.

- [ ] **Step 5: Verify install is consistent**

```bash
npm ls --depth=0
```

Expected: no `UNMET DEPENDENCY` or `extraneous` warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove Starlight, install Tailwind v4 + Preact + Pagefind + fonts + icons"
```

---

### Task 3: Update `package.json` scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace the `scripts` block**

Final scripts block:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build && pagefind --site dist",
  "preview": "astro preview",
  "astro": "astro",
  "check": "astro check"
}
```

The `build` script chains Pagefind so the search index ships with `dist/`. `check` is added for the type-check step used in verification.

- [ ] **Step 2: Verify**

```bash
cat package.json
```

Confirm `build` includes `&& pagefind --site dist` and `check` is present.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update build script to run pagefind, add check script"
```

---

### Task 4: Rewrite `astro.config.mjs`

**Files:**
- Modify: `astro.config.mjs` (full rewrite)

- [ ] **Step 1: Replace the entire file**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.notafintech.co',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    preact({ compat: false }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
```

Notes:
- `preact({ compat: false })` — no React compatibility needed; smaller runtime.
- Sitemap integration: default options are fine; outputs `dist/sitemap-index.xml` + `dist/sitemap-0.xml`.
- Shiki dual-theme: code blocks adapt to dark mode automatically.

- [ ] **Step 2: Type-check (will fail — that's expected; the content schema and pages haven't been updated yet)**

```bash
npm run check
```

Expected: errors about the content collection schema. The point is to confirm `astro.config.mjs` itself parses before continuing.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: rewrite astro.config.mjs for Tailwind v4 + Preact + sitemap"
```

---

### Task 5: Rewrite content collection schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Replace the entire file**

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z
      .enum(['guides', 'models', 'docs', 'tools', 'resources', 'about'])
      .optional(),
    template: z
      .enum(['article', 'section-index', 'model', 'tool'])
      .optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
    ogImage: z.string().optional(),
    hideToc: z.boolean().optional().default(false),
    hideSidebar: z.boolean().optional().default(false),
  }),
});

export const collections = { pages };
```

Key changes from Starlight-flavored schema:
- New collection name: `pages` (replaces Starlight's `docs`).
- `glob` loader explicitly targets `src/content/pages/` — directory rename happens in Task 14.
- Custom schema replaces `docsSchema()`.

- [ ] **Step 2: Commit (build still won't pass — that's fine, we'll fix in subsequent tasks)**

```bash
git add src/content.config.ts
git commit -m "feat: rewrite content collection schema for pages"
```

---

### Task 6: Create Tailwind entry CSS + theme tokens

**Files:**
- Create: `src/styles/global.css`
- Delete: `src/styles/custom.css` (Starlight-flavored, no longer used)

- [ ] **Step 1: Create `src/styles/global.css`**

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Self-hosted fonts */
@import "@fontsource-variable/fraunces/index.css";
@import "@fontsource-variable/inter/index.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/700.css";

/* Dark variant: any descendant of an element with .dark */
@variant dark (&:where(.dark, .dark *));

@theme {
  /* Typography */
  --font-display: "Fraunces Variable", Georgia, "Times New Roman", serif;
  --font-sans: "Inter Variable", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  /* Color tokens read from CSS variables (set per theme below) */
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-rule: var(--rule);
  --color-muted: var(--muted);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);

  /* Content measure */
  --container-prose: 68ch;
}

/* Light theme tokens (default) */
:root {
  --paper: #FAF7F2;
  --ink: #1A1714;
  --accent: #7A2E2A;
  --accent-hover: #5C2220;
  --rule: #E5DDD0;
  --muted: #6E6660;
  --surface: #FFFFFF;
  --surface-2: #F2EBE0;

  color-scheme: light;
}

/* Dark theme tokens */
.dark {
  --paper: #15110E;
  --ink: #F4EFE7;
  --accent: #B85450;
  --accent-hover: #D26B66;
  --rule: #2A231D;
  --muted: #8E867F;
  --surface: #1F1813;
  --surface-2: #271F19;

  color-scheme: dark;
}

/* Base styles */
@layer base {
  html {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
    scroll-padding-top: 5rem; /* sticky header offset */
  }

  body {
    font-feature-settings: "ss01", "cv11"; /* Inter stylistic alternates */
  }

  ::selection {
    background-color: var(--color-accent);
    color: var(--color-paper);
  }

  *:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

/* Tailwind Typography plugin theme — customized to Fraunces / Inter */
@layer base {
  .prose {
    --tw-prose-body: var(--color-ink);
    --tw-prose-headings: var(--color-ink);
    --tw-prose-links: var(--color-accent);
    --tw-prose-bold: var(--color-ink);
    --tw-prose-quotes: var(--color-ink);
    --tw-prose-quote-borders: var(--color-accent);
    --tw-prose-counters: var(--color-muted);
    --tw-prose-bullets: var(--color-muted);
    --tw-prose-hr: var(--color-rule);
    --tw-prose-th-borders: var(--color-rule);
    --tw-prose-td-borders: var(--color-rule);
    --tw-prose-code: var(--color-ink);
    --tw-prose-pre-bg: var(--color-surface-2);
    --tw-prose-pre-code: var(--color-ink);
    --tw-prose-captions: var(--color-muted);

    font-family: var(--font-sans);
    font-size: 1.0625rem;
    line-height: 1.7;
    max-width: var(--container-prose);
  }

  .prose :where(h1, h2, h3, h4) {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .prose :where(h1) { font-size: 2.5rem; }
  .prose :where(h2) { font-size: 1.875rem; margin-top: 2.5em; }
  .prose :where(h3) { font-size: 1.375rem; margin-top: 2em; }

  .prose :where(a) {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    transition: color 150ms ease;
  }

  .prose :where(a):hover {
    color: var(--color-accent-hover);
  }

  .prose :where(code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background-color: var(--color-surface-2);
    padding: 0.15em 0.4em;
    border-radius: 0.25em;
  }

  .prose :where(pre code) {
    background-color: transparent;
    padding: 0;
  }
}
```

- [ ] **Step 2: Delete the old `custom.css`**

```bash
git rm src/styles/custom.css
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Tailwind v4 entry CSS with editorial theme tokens"
```

---

### Task 7: Create directory scaffold

**Files:**
- Create empty directories: `src/layouts/`, `src/components/layout/`, `src/components/nav/`, `src/components/ui/`, `src/components/blocks/`, `src/data/`

- [ ] **Step 1: Create directory scaffold**

```bash
mkdir -p src/layouts \
  src/components/layout \
  src/components/nav \
  src/components/ui \
  src/components/blocks \
  src/data
```

- [ ] **Step 2: Add `.gitkeep` placeholders so empty dirs survive the commit**

```bash
touch src/layouts/.gitkeep \
  src/components/layout/.gitkeep \
  src/components/nav/.gitkeep \
  src/components/ui/.gitkeep \
  src/components/blocks/.gitkeep \
  src/data/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "chore: scaffold layouts/components/data directories"
```

---

## Phase 2 — Chrome

### Task 8: Navigation data file

**Files:**
- Create: `src/data/navigation.ts`

- [ ] **Step 1: Write the file**

```ts
// src/data/navigation.ts
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const topNav: NavItem[] = [
  { label: 'Guides', href: '/guides/' },
  { label: 'Models', href: '/models/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About', href: '/about/' },
];

export const footerSections: NavItem[] = [...topNav];

export const footerCommunity: NavItem[] = [
  { label: 'GitHub', href: 'https://github.com/Not-a-Fintech-Company/Website', external: true },
  { label: 'Contribute', href: 'https://github.com/Not-a-Fintech-Company/Website/blob/main/README.md', external: true },
  { label: 'hello@notafintech.co', href: 'mailto:hello@notafintech.co' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/navigation.ts
git commit -m "feat: add navigation data file"
```

---

### Task 9: `BaseLayout.astro` with theme-flash prevention

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

const {
  title,
  description,
  ogImage = '/og-image.png',
  canonical,
  noindex = false,
} = Astro.props;

const siteName = 'Not a Fintech Company';
const fullTitle = title === siteName ? title : `${title} · ${siteName}`;
const canonicalUrl = canonical ?? new URL(Astro.url.pathname, Astro.site).toString();
const ogImageUrl = ogImage.startsWith('http')
  ? ogImage
  : new URL(ogImage, Astro.site).toString();
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#7A2E2A" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#15110E" media="(prefers-color-scheme: dark)" />
    <meta name="generator" content={Astro.generator} />

    {/* THEME FLASH PREVENTION — must run before any CSS loads */}
    <script is:inline>
      (function () {
        try {
          const stored = localStorage.getItem('theme');
          const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const theme = stored || (prefers ? 'dark' : 'light');
          if (theme === 'dark') document.documentElement.classList.add('dark');
          document.documentElement.dataset.theme = theme;
        } catch (e) { /* localStorage may throw in private mode */ }
      })();
    </script>

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    {noindex && <meta name="robots" content="noindex" />}

    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:image" content={ogImageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageUrl} />

    <link rel="sitemap" href="/sitemap-index.xml" />

    {/* Analytics — Plausible */}
    <script
      async
      src="https://plausible.io/js/pa-W0Dq5s5xrg0nZbo6PsWi5.js"
    ></script>
    <script is:inline>
      window.plausible = window.plausible || function () {
        (plausible.q = plausible.q || []).push(arguments);
      };
      plausible.init = plausible.init || function (i) { plausible.o = i || {}; };
      plausible.init();
    </script>

    {/* Analytics — Google Analytics */}
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-VJXL7WCFNM"
    ></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-VJXL7WCFNM');
    </script>
  </head>
  <body class="min-h-screen flex flex-col bg-paper text-ink antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add BaseLayout with theme-flash prevention and meta"
```

---

### Task 10: `ThemeToggle.astro`

**Files:**
- Create: `src/components/ui/ThemeToggle.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/ui/ThemeToggle.astro
import { Sun, Moon } from 'lucide-astro';
---

<button
  type="button"
  id="theme-toggle"
  class="inline-flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-surface-2 transition-colors"
  aria-label="Toggle dark mode"
>
  <Sun class="w-4 h-4 hidden dark:block" />
  <Moon class="w-4 h-4 block dark:hidden" />
</button>

<script is:inline>
  (function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem('theme', theme);
      } catch (e) { /* private mode */ }
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ThemeToggle.astro
git commit -m "feat: add ThemeToggle component"
```

---

### Task 11: `Header.astro`

**Files:**
- Create: `src/components/layout/Header.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/layout/Header.astro
import { topNav } from '../../data/navigation';
import ThemeToggle from '../ui/ThemeToggle.astro';
import { Github, Search, Menu } from 'lucide-astro';

const currentPath = Astro.url.pathname;
const isActive = (href: string) =>
  href === '/' ? currentPath === '/' : currentPath.startsWith(href);
---

<header class="sticky top-0 z-40 backdrop-blur-md bg-paper/85 border-b border-rule">
  <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-6">
    <a href="/" class="font-display text-lg font-semibold tracking-tight text-ink hover:text-accent transition-colors whitespace-nowrap">
      Not a Fintech Company
    </a>

    <nav class="hidden md:flex items-center gap-1 ml-4" aria-label="Primary">
      {topNav.map((item) => (
        <a
          href={item.href}
          class:list={[
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            isActive(item.href)
              ? 'text-accent font-medium'
              : 'text-ink hover:text-accent hover:bg-surface-2',
          ]}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>

    <div class="ml-auto flex items-center gap-1">
      <button
        type="button"
        id="search-button"
        class="inline-flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-surface-2 transition-colors"
        aria-label="Open search"
      >
        <Search class="w-4 h-4" />
      </button>

      <ThemeToggle />

      <a
        href="https://github.com/Not-a-Fintech-Company/Website"
        rel="noopener noreferrer"
        target="_blank"
        class="inline-flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-surface-2 transition-colors"
        aria-label="View on GitHub"
      >
        <Github class="w-4 h-4" />
      </a>

      <button
        type="button"
        id="mobile-menu-trigger"
        class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-surface-2 transition-colors"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <Menu class="w-4 h-4" />
      </button>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Header.astro
git commit -m "feat: add Header with desktop nav and right action cluster"
```

---

### Task 12: `MobileMenu.astro`

**Files:**
- Create: `src/components/layout/MobileMenu.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/layout/MobileMenu.astro
import { topNav, footerCommunity } from '../../data/navigation';
import { X } from 'lucide-astro';

const currentPath = Astro.url.pathname;
const isActive = (href: string) =>
  href === '/' ? currentPath === '/' : currentPath.startsWith(href);
---

<div
  id="mobile-menu"
  class="fixed inset-0 z-50 bg-paper hidden md:hidden flex-col"
  role="dialog"
  aria-modal="true"
  aria-label="Site navigation"
  hidden
>
  <div class="flex items-center justify-between h-16 px-4 border-b border-rule">
    <span class="font-display text-lg font-semibold">Menu</span>
    <button
      type="button"
      id="mobile-menu-close"
      class="inline-flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-surface-2"
      aria-label="Close menu"
    >
      <X class="w-5 h-5" />
    </button>
  </div>
  <nav class="flex-1 overflow-y-auto px-4 py-6" aria-label="Primary mobile">
    <ul class="space-y-1">
      {topNav.map((item) => (
        <li>
          <a
            href={item.href}
            class:list={[
              'block px-3 py-3 text-lg rounded-md transition-colors',
              isActive(item.href)
                ? 'text-accent font-medium'
                : 'text-ink hover:bg-surface-2',
            ]}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
    <div class="border-t border-rule mt-6 pt-6">
      <p class="px-3 text-sm font-medium text-muted mb-2">Community</p>
      <ul class="space-y-1">
        {footerCommunity.map((item) => (
          <li>
            <a
              href={item.href}
              rel={item.external ? 'noopener noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
              class="block px-3 py-3 text-base rounded-md text-ink hover:bg-surface-2 transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </nav>
</div>

<script is:inline>
  (function () {
    const menu = document.getElementById('mobile-menu');
    const trigger = document.getElementById('mobile-menu-trigger');
    const close = document.getElementById('mobile-menu-close');
    if (!menu || !trigger || !close) return;

    const open = () => {
      menu.hidden = false;
      menu.classList.remove('hidden');
      menu.classList.add('flex');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const shut = () => {
      menu.hidden = true;
      menu.classList.add('hidden');
      menu.classList.remove('flex');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    trigger.addEventListener('click', open);
    close.addEventListener('click', shut);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) shut();
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MobileMenu.astro
git commit -m "feat: add MobileMenu drawer"
```

---

### Task 13: `Footer.astro` (replacement)

**Files:**
- Create: `src/components/layout/Footer.astro` (the old Starlight-extending `src/components/Footer.astro` is deleted in Task 38)

- [ ] **Step 1: Write the new component**

```astro
---
// src/components/layout/Footer.astro
import { footerSections, footerCommunity } from '../../data/navigation';

const year = new Date().getFullYear();
---

<footer class="mt-24 border-t border-rule">
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-12 grid gap-10 md:grid-cols-3">
    <div>
      <p class="font-display text-xl font-semibold text-ink">Not a Fintech Company</p>
      <p class="mt-3 text-sm text-muted max-w-sm">
        Open-source knowledge base for fintech founders. All materials provided under
        <a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="noopener noreferrer" target="_blank" class="underline hover:text-accent">CC0 1.0 Universal</a>.
      </p>
    </div>

    <div>
      <p class="text-sm font-medium text-ink mb-3">Sections</p>
      <ul class="space-y-2">
        {footerSections.map((item) => (
          <li>
            <a href={item.href} class="text-sm text-muted hover:text-accent transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <p class="text-sm font-medium text-ink mb-3">Community</p>
      <ul class="space-y-2">
        {footerCommunity.map((item) => (
          <li>
            <a
              href={item.href}
              rel={item.external ? 'noopener noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
              class="text-sm text-muted hover:text-accent transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>

  <div class="border-t border-rule">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted">
      <p>© {year} Not a Fintech Company.</p>
      <p>
        Powered by community. Hosted by
        <a href="https://www.totavi.com" rel="noopener noreferrer" target="_blank" class="underline hover:text-accent">Totavi</a>.
      </p>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.astro
git commit -m "feat: add new Footer (multi-column, editorial)"
```

---

## Phase 3 — Templates

### Task 14: Rename `src/content/docs/` → `src/content/pages/`

**Files:**
- Move every file under `src/content/docs/` to `src/content/pages/`.

- [ ] **Step 1: Rename the directory via git**

```bash
git mv src/content/docs src/content/pages
```

- [ ] **Step 2: Verify**

```bash
ls src/content/pages
git status
```

Expected: same set of files (index.mdx, about.md, license.md, resources.md, guides/, models/, docs/), git status shows renames staged.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: rename content/docs to content/pages"
```

---

### Task 15: Migrate frontmatter for all 12 content pages

For each page, update the frontmatter to match the new schema (Task 5).

**Files:**
- Modify: every `.md` and `.mdx` file under `src/content/pages/`

- [ ] **Step 1: Handle `src/content/pages/index.mdx`**

The new home is hardcoded in `src/pages/index.astro` (Task 27). We don't want both rendering at `/`. Move the existing content somewhere safe to mine for the roadmap data (Task 26):

```bash
mv src/content/pages/index.mdx /tmp/old-home-roadmap.mdx
```

Keep `/tmp/old-home-roadmap.mdx` available as a reference for Task 26 and Task 27. Don't commit it.

- [ ] **Step 2: Update `src/content/pages/about.md` frontmatter**

Replace the frontmatter block with:

```yaml
---
title: About
description: Not a Fintech Company is an open-source knowledge base for fintech founders.
section: about
template: article
---
```

- [ ] **Step 3: Update `src/content/pages/license.md` frontmatter**

```yaml
---
title: License
description: Materials on this site are released under CC0 1.0 Universal.
section: about
template: article
hideToc: true
---
```

- [ ] **Step 4: Update `src/content/pages/resources.md` frontmatter**

```yaml
---
title: Resources
description: External resources for fintech founders — newsletters, communities, regulators, tools.
section: resources
template: article
---
```

- [ ] **Step 5: Update `src/content/pages/guides/index.md` frontmatter**

```yaml
---
title: Guides
description: Educational guides for fintech founders — bank partner selection, card products, go-to-market, and more.
section: guides
template: section-index
---
```

- [ ] **Step 6: Update each guide file (5 files)**

For each of `go-to-market-plan.md`, `guide-to-starting-a-challenger-bank.md`, `how-to-launch-a-card-product.md`, `how-to-select-a-bank-partner.md`, `n-steps-to-closing-a-bank-partner.md`, add to the existing frontmatter:

```yaml
section: guides
template: article
```

(Keep existing `title` and `description`.)

- [ ] **Step 7: Update `src/content/pages/models/index.md` frontmatter**

```yaml
---
title: Models
description: Financial model templates for fintech products — bank accounts, term loans, credit cards.
section: models
template: section-index
---
```

- [ ] **Step 8: Update each model MDX file (3 files)**

For each of `bank-account.mdx`, `credit-card.mdx`, `term-loan.mdx`, add:

```yaml
section: models
template: model
hideSidebar: true
```

- [ ] **Step 9: Update `src/content/pages/docs/index.md` frontmatter**

```yaml
---
title: Docs
description: Compliance documents and policy templates for fintech operators.
section: docs
template: section-index
---
```

- [ ] **Step 10: Update `bsa.md` and `credit-card-trunk.mdx`**

For `bsa.md`, add:
```yaml
section: docs
template: article
```

For `credit-card-trunk.mdx`, add:
```yaml
section: docs
template: model
hideSidebar: true
```

- [ ] **Step 11: Type-check**

```bash
npm run check
```

Expected: schema validation passes for all pages. Errors about missing layouts/components are fine — those come next.

- [ ] **Step 12: Commit**

```bash
git add src/content/pages
git commit -m "chore: migrate frontmatter to new schema"
```

---

### Task 16: `Prose.astro` wrapper

**Files:**
- Create: `src/components/ui/Prose.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/ui/Prose.astro
interface Props {
  class?: string;
}
const { class: className = '' } = Astro.props;
---

<div class:list={['prose', className]}>
  <slot />
</div>
```

The `prose` class is defined in `global.css` (Task 6) — this wrapper just applies it.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Prose.astro
git commit -m "feat: add Prose wrapper"
```

---

### Task 17: `Breadcrumbs.astro`, `Sidebar.astro`, `Toc.astro`

**Files:**
- Create: `src/components/nav/Breadcrumbs.astro`
- Create: `src/components/nav/Sidebar.astro`
- Create: `src/components/nav/Toc.astro`

- [ ] **Step 1: Write `Breadcrumbs.astro`**

```astro
---
// src/components/nav/Breadcrumbs.astro
import { ChevronRight } from 'lucide-astro';

interface Crumb {
  label: string;
  href?: string;
}
interface Props {
  crumbs: Crumb[];
}
const { crumbs } = Astro.props;
---

<nav aria-label="Breadcrumb" class="text-sm text-muted">
  <ol class="flex items-center flex-wrap gap-1.5">
    {crumbs.map((c, i) => (
      <li class="flex items-center gap-1.5">
        {i > 0 && <ChevronRight class="w-3.5 h-3.5 opacity-60" />}
        {c.href ? (
          <a href={c.href} class="hover:text-accent transition-colors">{c.label}</a>
        ) : (
          <span class="text-ink">{c.label}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 2: Write `Sidebar.astro`**

```astro
---
// src/components/nav/Sidebar.astro
import { getCollection } from 'astro:content';

interface Props {
  section: string;
  currentSlug: string;
}
const { section, currentSlug } = Astro.props;

const all = await getCollection('pages', ({ data }) =>
  data.section === section && data.template !== 'section-index' && !data.draft
);

all.sort((a, b) => {
  const ad = a.data.publishedAt?.getTime() ?? 0;
  const bd = b.data.publishedAt?.getTime() ?? 0;
  if (ad !== bd) return bd - ad;
  return a.data.title.localeCompare(b.data.title);
});

const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
---

<aside class="hidden lg:block" aria-label={`${sectionLabel} sidebar`}>
  <div class="sticky top-20">
    <a href={`/${section}/`} class="text-sm font-medium text-muted hover:text-accent uppercase tracking-wider">
      {sectionLabel}
    </a>
    <ul class="mt-3 space-y-1 border-l border-rule">
      {all.map((entry) => {
        const href = `/${entry.id.replace(/\.(md|mdx)$/, '/').replace(/\/index\/$/, '/')}`;
        const active = entry.id === currentSlug;
        return (
          <li>
            <a
              href={href}
              class:list={[
                'block pl-4 -ml-px border-l-2 py-1.5 text-sm transition-colors',
                active
                  ? 'border-accent text-accent font-medium'
                  : 'border-transparent text-muted hover:text-ink',
              ]}
              aria-current={active ? 'page' : undefined}
            >
              {entry.data.title}
            </a>
          </li>
        );
      })}
    </ul>
  </div>
</aside>
```

- [ ] **Step 3: Write `Toc.astro`**

```astro
---
// src/components/nav/Toc.astro
import type { MarkdownHeading } from 'astro';

interface Props {
  headings: MarkdownHeading[];
}
const { headings } = Astro.props;

const toc = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{toc.length > 0 && (
  <aside class="hidden xl:block" aria-label="Table of contents">
    <div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <p class="text-xs font-medium uppercase tracking-wider text-muted mb-3">On this page</p>
      <ul class="space-y-2 text-sm border-l border-rule">
        {toc.map((h) => (
          <li class:list={['leading-snug', h.depth === 3 && 'pl-3']}>
            <a
              href={`#${h.slug}`}
              data-toc-slug={h.slug}
              class="toc-link block pl-4 -ml-px border-l-2 border-transparent text-muted hover:text-ink transition-colors py-1"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </aside>

  <script is:inline>
    (function () {
      const links = document.querySelectorAll('.toc-link');
      if (!links.length) return;
      const headings = Array.from(document.querySelectorAll('h2[id], h3[id]'));
      if (!headings.length) return;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            links.forEach((l) => {
              const active = l.getAttribute('data-toc-slug') === id;
              l.classList.toggle('border-accent', active);
              l.classList.toggle('text-accent', active);
              l.classList.toggle('font-medium', active);
            });
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

      headings.forEach((h) => obs.observe(h));
    })();
  </script>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/
git commit -m "feat: add Breadcrumbs, Sidebar, Toc nav components"
```

---

### Task 18: `ArticleLayout.astro`

**Files:**
- Create: `src/layouts/ArticleLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/ArticleLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import MobileMenu from '../components/layout/MobileMenu.astro';
import Footer from '../components/layout/Footer.astro';
import Breadcrumbs from '../components/nav/Breadcrumbs.astro';
import Sidebar from '../components/nav/Sidebar.astro';
import Toc from '../components/nav/Toc.astro';
import Prose from '../components/ui/Prose.astro';
import type { MarkdownHeading } from 'astro';

interface Props {
  title: string;
  description: string;
  section?: string;
  slug: string;
  headings: MarkdownHeading[];
  ogImage?: string;
  hideToc?: boolean;
  hideSidebar?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}
const {
  title, description, section, slug, headings,
  ogImage, hideToc = false, hideSidebar = false,
  publishedAt, updatedAt,
} = Astro.props;

const sectionLabel = section
  ? section.charAt(0).toUpperCase() + section.slice(1)
  : null;

const crumbs = [
  { label: 'Home', href: '/' },
  ...(section ? [{ label: sectionLabel!, href: `/${section}/` }] : []),
  { label: title },
];

const showSidebar = !hideSidebar && !!section;
const showToc = !hideToc;
---

<BaseLayout {title} {description} {ogImage}>
  <Header />
  <MobileMenu />

  <main id="main" class="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
    <div class:list={[
      'grid gap-8 lg:gap-12',
      showSidebar && showToc ? 'lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_14rem]' :
      showSidebar ? 'lg:grid-cols-[14rem_minmax(0,1fr)]' :
      showToc ? 'xl:grid-cols-[minmax(0,1fr)_14rem]' :
      ''
    ]}>
      {showSidebar && section && <Sidebar {section} currentSlug={slug} />}

      <article class="min-w-0">
        <Breadcrumbs crumbs={crumbs} />
        <h1 class="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p class="mt-4 text-lg text-muted max-w-prose">{description}</p>
        )}
        {(publishedAt || updatedAt) && (
          <p class="mt-3 text-xs text-muted">
            {publishedAt && <span>Published {publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {updatedAt && <span class="ml-2">· Updated {updatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
          </p>
        )}

        <hr class="mt-8 border-rule" />

        <Prose class="mt-8">
          <slot />
        </Prose>
      </article>

      {showToc && <Toc {headings} />}
    </div>
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ArticleLayout.astro
git commit -m "feat: add ArticleLayout (sidebar + prose + toc)"
```

---

### Task 19: `SectionIndexLayout.astro`

**Files:**
- Create: `src/layouts/SectionIndexLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/SectionIndexLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import MobileMenu from '../components/layout/MobileMenu.astro';
import Footer from '../components/layout/Footer.astro';
import { getCollection } from 'astro:content';
import { ArrowRight } from 'lucide-astro';

interface Props {
  title: string;
  description: string;
  section: string;
  ogImage?: string;
}
const { title, description, section, ogImage } = Astro.props;

const entries = await getCollection('pages', ({ data }) =>
  data.section === section &&
  data.template !== 'section-index' &&
  !data.draft
);

entries.sort((a, b) => {
  const ad = a.data.publishedAt?.getTime() ?? 0;
  const bd = b.data.publishedAt?.getTime() ?? 0;
  if (ad !== bd) return bd - ad;
  return a.data.title.localeCompare(b.data.title);
});
---

<BaseLayout {title} {description} {ogImage}>
  <Header />
  <MobileMenu />

  <main id="main" class="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-12 md:py-20">
    <header class="max-w-3xl">
      <p class="text-xs uppercase tracking-[0.2em] text-muted font-medium">{section}</p>
      <h1 class="mt-3 font-display text-5xl md:text-6xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p class="mt-5 text-lg md:text-xl text-muted leading-relaxed">{description}</p>
    </header>

    <slot name="intro" />

    {entries.length > 0 ? (
      <ul class="mt-12 divide-y divide-rule border-t border-rule">
        {entries.map((entry) => {
          const href = `/${entry.id.replace(/\.(md|mdx)$/, '/').replace(/\/index\/$/, '/')}`;
          return (
            <li>
              <a
                href={href}
                class="group flex items-start gap-6 py-6 hover:bg-surface-2 -mx-4 px-4 rounded-lg transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <h2 class="font-display text-2xl font-medium text-ink group-hover:text-accent transition-colors">
                    {entry.data.title}
                  </h2>
                  {entry.data.description && (
                    <p class="mt-2 text-muted max-w-2xl">{entry.data.description}</p>
                  )}
                </div>
                <ArrowRight class="w-5 h-5 mt-2 text-muted group-hover:text-accent transition-colors flex-shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>
    ) : (
      <div class="mt-12 py-12 text-center text-muted border-t border-rule">
        <p>Nothing here yet — check back soon.</p>
      </div>
    )}
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/SectionIndexLayout.astro
git commit -m "feat: add SectionIndexLayout"
```

---

### Task 20: `ModelLayout.astro`

**Files:**
- Create: `src/layouts/ModelLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/ModelLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import MobileMenu from '../components/layout/MobileMenu.astro';
import Footer from '../components/layout/Footer.astro';
import Breadcrumbs from '../components/nav/Breadcrumbs.astro';
import Prose from '../components/ui/Prose.astro';

interface Props {
  title: string;
  description: string;
  section?: string;
  ogImage?: string;
}
const { title, description, section, ogImage } = Astro.props;

const sectionLabel = section ? section.charAt(0).toUpperCase() + section.slice(1) : null;
const crumbs = [
  { label: 'Home', href: '/' },
  ...(section ? [{ label: sectionLabel!, href: `/${section}/` }] : []),
  { label: title },
];
---

<BaseLayout {title} {description} {ogImage}>
  <Header />
  <MobileMenu />

  <main id="main" class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
    <Breadcrumbs crumbs={crumbs} />
    <h1 class="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
      {title}
    </h1>
    {description && (
      <p class="mt-4 text-lg text-muted max-w-prose">{description}</p>
    )}

    <div class="mt-10">
      <Prose>
        <slot />
      </Prose>
    </div>
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ModelLayout.astro
git commit -m "feat: add ModelLayout (embed-prominent)"
```

---

### Task 21: `ToolLayout.astro`

**Files:**
- Create: `src/layouts/ToolLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/ToolLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import MobileMenu from '../components/layout/MobileMenu.astro';
import Footer from '../components/layout/Footer.astro';
import Breadcrumbs from '../components/nav/Breadcrumbs.astro';
import Prose from '../components/ui/Prose.astro';

interface Props {
  title: string;
  description: string;
  section?: string;
  ogImage?: string;
}
const { title, description, section, ogImage } = Astro.props;

const sectionLabel = section ? section.charAt(0).toUpperCase() + section.slice(1) : null;
const crumbs = [
  { label: 'Home', href: '/' },
  ...(section ? [{ label: sectionLabel!, href: `/${section}/` }] : []),
  { label: title },
];
---

<BaseLayout {title} {description} {ogImage}>
  <Header />
  <MobileMenu />

  <main id="main" class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
    <Breadcrumbs crumbs={crumbs} />
    <h1 class="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
      {title}
    </h1>
    {description && (
      <p class="mt-4 text-lg text-muted max-w-prose">{description}</p>
    )}

    <div class="mt-10">
      <Prose>
        <slot />
      </Prose>
    </div>
  </main>

  <Footer />
</BaseLayout>
```

(Identical shape to `ModelLayout` for now — they will diverge as calculators ship and tool pages take on full-width custom UI. Keeping them as separate layouts means changes to one don't bleed into the other.)

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ToolLayout.astro
git commit -m "feat: add ToolLayout (will diverge from ModelLayout when calculators ship)"
```

---

### Task 22: Dynamic route `src/pages/[...slug].astro`

**Files:**
- Create: `src/pages/[...slug].astro`

- [ ] **Step 1: Write the dynamic route**

```astro
---
// src/pages/[...slug].astro
import { getCollection, render } from 'astro:content';
import ArticleLayout from '../layouts/ArticleLayout.astro';
import SectionIndexLayout from '../layouts/SectionIndexLayout.astro';
import ModelLayout from '../layouts/ModelLayout.astro';
import ToolLayout from '../layouts/ToolLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('pages', ({ data }) => !data.draft);
  return entries.map((entry) => {
    const slug = entry.id.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
    return {
      params: { slug: slug === '' ? undefined : slug },
      props: { entry },
    };
  });
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
const data = entry.data;
const template = data.template ?? 'article';
---

{template === 'section-index' && (
  <SectionIndexLayout
    title={data.title}
    description={data.description}
    section={data.section!}
    ogImage={data.ogImage}
  >
    <Content slot="intro" />
  </SectionIndexLayout>
)}

{template === 'model' && (
  <ModelLayout
    title={data.title}
    description={data.description}
    section={data.section}
    ogImage={data.ogImage}
  >
    <Content />
  </ModelLayout>
)}

{template === 'tool' && (
  <ToolLayout
    title={data.title}
    description={data.description}
    section={data.section}
    ogImage={data.ogImage}
  >
    <Content />
  </ToolLayout>
)}

{(template === 'article' || !template) && (
  <ArticleLayout
    title={data.title}
    description={data.description}
    section={data.section}
    slug={entry.id}
    headings={headings}
    ogImage={data.ogImage}
    hideToc={data.hideToc}
    hideSidebar={data.hideSidebar}
    publishedAt={data.publishedAt}
    updatedAt={data.updatedAt}
  >
    <Content />
  </ArticleLayout>
)}
```

- [ ] **Step 2: Try a dev build to make sure routes resolve**

```bash
npm run dev
```

In a browser, visit:
- http://localhost:4321/about/
- http://localhost:4321/guides/
- http://localhost:4321/guides/how-to-launch-a-card-product/
- http://localhost:4321/models/credit-card/
- http://localhost:4321/docs/bsa/

Expected: each page renders with the correct template. Home (`/`) will 404 until Task 27.

Stop the dev server: `Ctrl-C`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/[...slug].astro
git commit -m "feat: add dynamic route with template selection"
```

---

### Task 23: Restyle `GoogleEmbed.astro`

**Files:**
- Create: `src/components/ui/GoogleEmbed.astro`
- Update imports in MDX files

- [ ] **Step 1: Write the new component**

```astro
---
// src/components/ui/GoogleEmbed.astro
interface Props {
  src: string;
  title: string;
  height?: string;
}
const { src, title, height = '600px' } = Astro.props;
---

<div class="my-8 border border-rule rounded-lg overflow-hidden bg-surface shadow-sm">
  <iframe
    src={src}
    title={title}
    width="100%"
    height={height}
    sandbox="allow-scripts allow-same-origin"
    loading="lazy"
    class="block border-0"
  ></iframe>
</div>
```

- [ ] **Step 2: Update import paths in MDX files**

In each of:
- `src/content/pages/models/bank-account.mdx`
- `src/content/pages/models/credit-card.mdx`
- `src/content/pages/models/term-loan.mdx`
- `src/content/pages/docs/credit-card-trunk.mdx`

Change the import line from (likely):

```mdx
import GoogleEmbed from '../../../components/GoogleEmbed.astro';
```

to:

```mdx
import GoogleEmbed from '../../../components/ui/GoogleEmbed.astro';
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Visit http://localhost:4321/models/credit-card/ — confirm the embed renders with the new bordered styling.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GoogleEmbed.astro src/content/pages/
git commit -m "feat: restyle GoogleEmbed with editorial border, update imports"
```

---

## Phase 4 — Home & content blocks

### Task 24: `Hero.astro` block

**Files:**
- Create: `src/components/blocks/Hero.astro`

- [ ] **Step 1: Write the block**

```astro
---
// src/components/blocks/Hero.astro
import { ArrowRight, Github } from 'lucide-astro';
---

<section class="relative max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-28 pb-12 md:pb-20">
  <div class="max-w-4xl">
    <p class="text-xs uppercase tracking-[0.25em] text-muted font-medium">Open-source · CC0 1.0</p>
    <h1 class="mt-5 font-display text-5xl md:text-7xl font-semibold tracking-tight text-ink leading-[1.05]">
      The fintech info <em class="font-display italic text-accent">you need</em>
    </h1>
    <p class="mt-6 text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
      Guides, financial models, and policy templates for fintech founders.
      Everything here is free, public-domain, and improving every week.
    </p>
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <a
        href="/guides/"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-paper font-medium hover:bg-accent-hover transition-colors"
      >
        Read the guides
        <ArrowRight class="w-4 h-4" />
      </a>
      <a
        href="https://github.com/Not-a-Fintech-Company/Website"
        rel="noopener noreferrer"
        target="_blank"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-rule text-ink hover:bg-surface-2 transition-colors"
      >
        <Github class="w-4 h-4" />
        View on GitHub
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/Hero.astro
git commit -m "feat: add Hero block for home page"
```

---

### Task 25: `GuideCard.astro` block

**Files:**
- Create: `src/components/blocks/GuideCard.astro`

- [ ] **Step 1: Write the block**

```astro
---
// src/components/blocks/GuideCard.astro
import { ArrowUpRight } from 'lucide-astro';

interface Props {
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
}
const { title, description, href, eyebrow } = Astro.props;
---

<a
  href={href}
  class="group block p-6 rounded-lg border border-rule bg-surface hover:border-accent transition-colors"
>
  {eyebrow && (
    <p class="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-3">{eyebrow}</p>
  )}
  <h3 class="font-display text-xl font-medium text-ink group-hover:text-accent transition-colors flex items-start gap-2">
    <span class="flex-1">{title}</span>
    <ArrowUpRight class="w-4 h-4 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
  </h3>
  <p class="mt-3 text-sm text-muted leading-relaxed">{description}</p>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/GuideCard.astro
git commit -m "feat: add GuideCard block"
```

---

### Task 26: `RoadmapGrid.astro` + data file

**Files:**
- Create: `src/data/roadmap.ts`
- Create: `src/components/blocks/RoadmapGrid.astro`

The data comes from the old `index.mdx` (now in `/tmp/old-home-roadmap.mdx` from Task 15).

- [ ] **Step 1: Write `src/data/roadmap.ts`**

```ts
// src/data/roadmap.ts
export type Status = 'published' | 'drafting' | 'planned' | 'external';

export interface RoadmapItem {
  label: string;
  href?: string;
  status: Status;
}

export interface RoadmapCategory {
  title: string;
  items: RoadmapItem[];
}

export interface RoadmapSection {
  title: string;
  categories: RoadmapCategory[];
}

export const roadmap: RoadmapSection[] = [
  {
    title: 'Guides',
    categories: [
      {
        title: 'Foundations',
        items: [
          { label: 'How to select a bank partner', href: '/guides/how-to-select-a-bank-partner/', status: 'published' },
          { label: 'MTL vs MSB vs National Trust bank charter vs National Charter', status: 'planned' },
          { label: 'How to launch a card product', href: '/guides/how-to-launch-a-card-product/', status: 'published' },
          { label: 'Credit card vs Charge Card vs Debit Card', status: 'planned' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Financial crime prevention and compliance partner selection', status: 'planned' },
          { label: 'Card product operational preparation', status: 'planned' },
          { label: 'Managing cards/payments/compliance vendors and sponsor bank relationships', status: 'planned' },
          { label: 'Financial Crime compliance roles, responsibilities, and alerts', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Models',
    categories: [
      {
        title: 'Identity & Fraud',
        items: [
          { label: 'Financial Crime risk assessment', status: 'planned' },
          { label: 'Origination Fraud', status: 'planned' },
          { label: 'KYC & Identity Fraud', status: 'planned' },
          { label: 'Transactional Fraud', status: 'planned' },
          { label: 'Synthetic Fraud', status: 'planned' },
        ],
      },
      {
        title: 'Financial Product',
        items: [
          { label: 'Bank Accounts (debit & savings)', href: '/models/bank-account/', status: 'published' },
          { label: 'Term Loans (installment, mortgage, student)', href: '/models/term-loan/', status: 'published' },
          { label: 'Credit Cards (credit & charge)', href: '/models/credit-card/', status: 'published' },
          { label: 'Debit cards', status: 'planned' },
          { label: 'Insurance', status: 'planned' },
          { label: 'Brokerage Accounts', status: 'planned' },
        ],
      },
      {
        title: 'Underwriting',
        items: [
          { label: 'Credit Risk (Mortgage, Credit Card, Installment, Auto, Payday)', status: 'planned' },
          { label: 'ACH Risk', status: 'planned' },
          { label: 'Wire Risk', status: 'planned' },
        ],
      },
      {
        title: 'People',
        items: [
          { label: 'Customer Operations', status: 'planned' },
          { label: 'Financial Crime Operations', status: 'planned' },
          { label: 'Product', status: 'planned' },
          { label: 'Engineering', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Disclosures & Agreements',
    categories: [
      {
        title: 'Credit Card',
        items: [
          { label: 'Schumer Box', href: 'https://en.wikipedia.org/wiki/Schumer_box', status: 'external' },
          { label: 'Credit Cardholder Agreement — CFPB template', href: 'https://www.consumerfinance.gov/data-research/credit-card-data/know-you-owe-credit-cards/', status: 'external' },
          { label: 'Statement Disclosure', status: 'planned' },
        ],
      },
      {
        title: 'Bank Account',
        items: [
          { label: 'Deposit Account Agreement', status: 'planned' },
          { label: 'Saving Account Agreement', status: 'planned' },
          { label: 'Automatic Savings Account Agreement', status: 'planned' },
        ],
      },
      {
        title: 'General',
        items: [
          { label: 'Electronic Communications Agreement', status: 'planned' },
          { label: 'eSign Agreement', status: 'planned' },
          { label: 'Terms and Conditions', status: 'planned' },
          { label: 'Company Privacy Policy', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Policies',
    categories: [
      {
        title: 'Compliance & Risk',
        items: [
          { label: 'Bank Secrecy Act / AML / OFAC Policy', href: '/docs/bsa/', status: 'published' },
          { label: 'Fraud prevention policy', status: 'planned' },
          { label: 'Collections Policy', status: 'planned' },
          { label: 'Credit Bureau Reporting', status: 'planned' },
          { label: 'Third Party Vendor Management', status: 'planned' },
          { label: 'Information Security Program and Policies', href: 'https://docs.google.com/document/d/19b9vL85524hHLElJ3O5xnEOrgvgRKbgQxjiM89196Fo/edit?usp=sharing', status: 'external' },
          { label: 'Business Continuity / Disaster Recovery', href: 'https://docs.google.com/document/d/1-dRk6RjxaT1jUWssw_6kgek8YPIjU0egLmPew_Q3cZQ/edit?usp=sharing', status: 'external' },
        ],
      },
    ],
  },
  {
    title: 'Procedures',
    categories: [
      {
        title: 'Operations',
        items: [
          { label: 'Customer Service Manual', status: 'planned' },
          { label: 'SAR Filing Process', status: 'planned' },
          { label: 'OFAC Procedure', status: 'planned' },
          { label: 'Financial Crime prevention manual', status: 'planned' },
        ],
      },
    ],
  },
];
```

- [ ] **Step 2: Write `RoadmapGrid.astro`**

```astro
---
// src/components/blocks/RoadmapGrid.astro
import { roadmap, type Status } from '../../data/roadmap';
import { ExternalLink, FileText, PenLine, Circle } from 'lucide-astro';

const statusMeta: Record<Status, { label: string; iconName: string }> = {
  published: { label: 'Published', iconName: 'FileText' },
  drafting: { label: 'In progress', iconName: 'PenLine' },
  planned: { label: 'Planned', iconName: 'Circle' },
  external: { label: 'External link', iconName: 'ExternalLink' },
};

const icons = { FileText, PenLine, Circle, ExternalLink };
---

<section class="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
  <header class="max-w-3xl mb-12">
    <p class="text-xs uppercase tracking-[0.25em] text-muted font-medium">Roadmap</p>
    <h2 class="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
      What we're building
    </h2>
    <p class="mt-5 text-lg text-muted leading-relaxed">
      A living catalog of everything in scope. Some items are published.
      Others are planned, drafting, or linked to external authoritative sources.
    </p>
  </header>

  <div class="space-y-16">
    {roadmap.map((section) => (
      <div>
        <h3 class="font-display text-2xl font-semibold text-ink mb-6 pb-3 border-b border-rule">
          {section.title}
        </h3>
        <div class="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {section.categories.map((cat) => (
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-muted font-medium mb-3">{cat.title}</p>
              <ul class="space-y-2">
                {cat.items.map((item) => {
                  const meta = statusMeta[item.status];
                  const Icon = icons[meta.iconName as keyof typeof icons];
                  const isLink = !!item.href;
                  const isExternal = item.status === 'external' || item.href?.startsWith('http');
                  const Wrapper = isLink ? 'a' : 'span';
                  return (
                    <li>
                      <Wrapper
                        {...(isLink
                          ? {
                              href: item.href,
                              ...(isExternal && { rel: 'noopener noreferrer', target: '_blank' }),
                            }
                          : {})}
                        class:list={[
                          'flex items-start gap-2 text-sm leading-snug',
                          item.status === 'planned' ? 'text-muted' : 'text-ink',
                          isLink && 'hover:text-accent transition-colors',
                        ]}
                      >
                        <Icon class:list={[
                          'w-3.5 h-3.5 mt-1 flex-shrink-0',
                          item.status === 'published' && 'text-accent',
                          item.status === 'external' && 'text-muted',
                          item.status === 'planned' && 'text-muted opacity-50',
                        ]} />
                        <span>{item.label}</span>
                      </Wrapper>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/data/roadmap.ts src/components/blocks/RoadmapGrid.astro
git commit -m "feat: add RoadmapGrid + structured roadmap data"
```

---

### Task 27: Home page `src/pages/index.astro`

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Write the home page**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import MobileMenu from '../components/layout/MobileMenu.astro';
import Footer from '../components/layout/Footer.astro';
import Hero from '../components/blocks/Hero.astro';
import GuideCard from '../components/blocks/GuideCard.astro';
import RoadmapGrid from '../components/blocks/RoadmapGrid.astro';
import { getCollection } from 'astro:content';
import { ArrowRight } from 'lucide-astro';

const guides = await getCollection('pages', ({ data }) =>
  data.section === 'guides' && data.template !== 'section-index' && !data.draft
);
const featuredGuides = guides.slice(0, 3);

const models = await getCollection('pages', ({ data }) =>
  data.section === 'models' && data.template !== 'section-index' && !data.draft
);

const title = 'Not a Fintech Company';
const description = 'All the pieces you need to start, build, and run a fintech company. Guides, models, and policies — open-source and CC0.';
---

<BaseLayout {title} {description}>
  <Header />
  <MobileMenu />

  <main id="main" class="flex-1">
    <Hero />

    <section class="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24 border-t border-rule pt-16">
      <header class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted font-medium">Guides</p>
          <h2 class="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">Start here</h2>
        </div>
        <a href="/guides/" class="hidden md:inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors">
          All guides
          <ArrowRight class="w-3.5 h-3.5" />
        </a>
      </header>
      <div class="grid gap-6 md:grid-cols-3">
        {featuredGuides.map((g) => {
          const href = `/${g.id.replace(/\.(md|mdx)$/, '/').replace(/\/index\/$/, '/')}`;
          return (
            <GuideCard
              title={g.data.title}
              description={g.data.description}
              href={href}
              eyebrow="Guide"
            />
          );
        })}
      </div>
      <a href="/guides/" class="md:hidden mt-6 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        All guides <ArrowRight class="w-3.5 h-3.5" />
      </a>
    </section>

    <section class="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24 border-t border-rule pt-16">
      <header class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted font-medium">Models</p>
          <h2 class="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">The math, in a spreadsheet</h2>
          <p class="mt-3 text-muted max-w-2xl">
            Open Google Sheets templates for fintech product economics. Interactive versions are coming to <a href="/tools/" class="underline hover:text-accent">Tools</a>.
          </p>
        </div>
      </header>
      <div class="grid gap-6 md:grid-cols-3">
        {models.map((m) => {
          const href = `/${m.id.replace(/\.(md|mdx)$/, '/').replace(/\/index\/$/, '/')}`;
          return (
            <GuideCard
              title={m.data.title}
              description={m.data.description}
              href={href}
              eyebrow="Model"
            />
          );
        })}
      </div>
    </section>

    <section class="bg-surface-2 border-y border-rule">
      <div class="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <p class="text-xs uppercase tracking-[0.25em] text-muted font-medium">Open source</p>
        <h2 class="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">
          Everything here is yours to use, fork, and improve.
        </h2>
        <p class="mt-5 text-muted max-w-2xl mx-auto leading-relaxed">
          All content is released under CC0 1.0 — no rights reserved. Spot something missing or wrong?
          Open a pull request or send us a note.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/Not-a-Fintech-Company/Website"
            rel="noopener noreferrer"
            target="_blank"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-ink text-paper font-medium hover:opacity-90 transition-opacity"
          >
            Contribute on GitHub
          </a>
          <a
            href="mailto:hello@notafintech.co"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-rule text-ink hover:bg-paper transition-colors"
          >
            hello@notafintech.co
          </a>
        </div>
      </div>
    </section>

    <RoadmapGrid />
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```

Visit http://localhost:4321/ — confirm hero, featured guides (3), models preview (3), open-source callout, and roadmap all render. Toggle dark mode and verify no theme flash on refresh.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build home page (hero, guides, models, callout, roadmap)"
```

---

### Task 28: Tools section stub

**Files:**
- Create: `src/content/pages/tools/index.md`

- [ ] **Step 1: Write the stub**

```markdown
---
title: Tools
description: Interactive financial calculators for fintech founders — coming soon.
section: tools
template: section-index
---

Interactive versions of our financial models are in the works.
The first calculators — covering term loans, credit cards, and bank accounts — will ship as their own dedicated pages here.

In the meantime, the underlying **[Google Sheets models](/models/)** remain available for copy-and-tweak.
```

The `<slot name="intro" />` in `SectionIndexLayout` renders this prose.

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit http://localhost:4321/tools/ — confirm the stub renders inside a SectionIndex layout.

- [ ] **Step 3: Commit**

```bash
git add src/content/pages/tools/index.md
git commit -m "feat: add Tools section stub page"
```

---

## Phase 5 — Search

### Task 29: `SearchModal.tsx` (Preact island)

**Files:**
- Create: `src/components/ui/SearchModal.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/ui/SearchModal.tsx
import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Search, X } from 'lucide-preact';

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: { title: string };
    excerpt: string;
  }>;
}

interface PagefindAPI {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

declare global {
  interface Window {
    pagefind?: PagefindAPI;
  }
}

interface RenderedResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

// Pagefind returns excerpts containing <mark>...</mark> wrappers around matched
// terms. Render those safely as text nodes + <mark> elements — no raw HTML injection.
function renderExcerpt(excerpt: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  const pattern = /<mark>([\s\S]*?)<\/mark>/g;
  let lastIndex = 0;
  let key = 0;
  for (const match of excerpt.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(<span key={key++}>{excerpt.slice(lastIndex, start)}</span>);
    }
    parts.push(
      <mark key={key++} class="bg-accent/15 text-ink font-medium not-italic">
        {match[1]}
      </mark>
    );
    lastIndex = start + match[0].length;
  }
  if (lastIndex < excerpt.length) {
    parts.push(<span key={key++}>{excerpt.slice(lastIndex)}</span>);
  }
  return parts;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RenderedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load pagefind on first open
  useEffect(() => {
    if (!open) return;
    if (window.pagefind) return;
    // @ts-expect-error dynamic import path served by Pagefind at build time
    import(/* @vite-ignore */ '/pagefind/pagefind.js').then((mod) => {
      window.pagefind = mod;
    });
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query || !window.pagefind) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    window.pagefind.search(query).then(async (raw) => {
      const top = await Promise.all(
        raw.results.slice(0, 8).map(async (r) => {
          const d = await r.data();
          return { id: r.id, url: d.url, title: d.meta.title, excerpt: d.excerpt };
        })
      );
      if (!cancelled) {
        setResults(top);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);

    const btn = document.getElementById('search-button');
    const click = () => setOpen(true);
    btn?.addEventListener('click', click);

    return () => {
      window.removeEventListener('keydown', handler);
      btn?.removeEventListener('click', click);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-ink/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        class="w-full max-w-2xl bg-surface border border-rule rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <Search class="w-4 h-4 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            placeholder="Search guides, models, docs…"
            class="flex-1 bg-transparent outline-none text-ink placeholder:text-muted text-base"
            aria-label="Search query"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            class="text-muted hover:text-ink"
            aria-label="Close search"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p class="px-4 py-6 text-sm text-muted">Searching…</p>
          )}
          {!loading && query && results.length === 0 && (
            <p class="px-4 py-6 text-sm text-muted">No results for "{query}".</p>
          )}
          {!loading && !query && (
            <p class="px-4 py-6 text-sm text-muted">
              Type to search. Press{' '}
              <kbd class="px-1.5 py-0.5 rounded border border-rule text-xs">Esc</kbd> to close.
            </p>
          )}
          {results.length > 0 && (
            <ul>
              {results.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    class="block px-4 py-3 border-t border-rule hover:bg-surface-2 transition-colors"
                  >
                    <p class="text-ink font-medium">{r.title}</p>
                    <p class="text-sm text-muted mt-1 line-clamp-2">
                      {renderExcerpt(r.excerpt)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
```

Notes:
- `/pagefind/pagefind.js` is the path Pagefind serves to. This works in production and in `npm run preview` after `npm run build`. In `npm run dev`, the file won't exist and search will silently no-op. That's acceptable; we test in `preview`.
- `renderExcerpt` parses `<mark>` tags into Preact elements via `matchAll` — no raw HTML injection, no `dangerouslySetInnerHTML`, no DOMPurify dependency.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SearchModal.tsx
git commit -m "feat: add SearchModal Preact island for Pagefind"
```

---

### Task 30: Wire `SearchModal` into `BaseLayout`

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add the import and render the island**

In the frontmatter, add near the top:

```astro
import SearchModal from '../components/ui/SearchModal.tsx';
```

And add the modal mount at the end of `<body>`, just before the closing `</body>`:

```astro
    <SearchModal client:idle />
  </body>
</html>
```

The `client:idle` directive defers hydration until the browser is idle — the search button still works because the modal mounts before any user-initiated open.

- [ ] **Step 2: Build and preview to test search**

```bash
npm run build
npm run preview
```

Visit the URL the preview server prints. Click the search button or press `⌘K`. Confirm:
- Modal opens with focus on input.
- Typing returns Pagefind results within ~200ms.
- Clicking a result navigates to the page.
- Escape closes the modal.
- Clicking the backdrop closes the modal.

Stop preview.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: mount SearchModal in BaseLayout, wire to ⌘K and search button"
```

---

## Phase 6 — SEO + meta

### Task 31: Per-page meta sanity check

**Files:** none (verification only)

- [ ] **Step 1: Build the site**

```bash
npm run build
```

- [ ] **Step 2: Inspect built HTML for a sample page**

```bash
grep -E 'og:title|canonical|twitter:card' dist/guides/how-to-launch-a-card-product/index.html | head -10
```

Expected: `og:title` reflects the page title, `canonical` is the absolute https URL for the page, `twitter:card` is `summary_large_image`.

If any are wrong, fix `BaseLayout.astro` accordingly.

- [ ] **Step 3: Verify home page meta**

```bash
grep -E 'og:title|twitter:title|canonical' dist/index.html
```

Expected: title is "Not a Fintech Company" (no doubled site name), canonical is `https://www.notafintech.co/`.

- [ ] **Step 4: No commit needed unless changes were required.**

---

### Task 32: Update `public/robots.txt`

**Files:**
- Modify: `public/robots.txt`
- Possibly delete: `public/sitemap.xml` (if no longer needed)

- [ ] **Step 1: Inspect current content**

```bash
cat public/robots.txt
cat public/sitemap.xml 2>/dev/null | head -5
```

- [ ] **Step 2: Write the updated `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.notafintech.co/sitemap-index.xml
```

- [ ] **Step 3: Decide on static sitemap.xml**

If the static `public/sitemap.xml` is referenced by an active `_redirects` rule or external system, keep it. Otherwise delete:

```bash
git rm public/sitemap.xml
```

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt
git add public/sitemap.xml 2>/dev/null || true
git commit -m "chore: update robots.txt to reference sitemap-index"
```

---

### Task 33: Verify sitemap generation

**Files:** none (verification only)

- [ ] **Step 1: Build and check**

```bash
npm run build
ls dist/sitemap*
```

Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml` present.

- [ ] **Step 2: Inspect**

```bash
head -30 dist/sitemap-0.xml
```

Expected: each URL begins with `https://www.notafintech.co/`. All 12 content pages listed. Home `https://www.notafintech.co/` is present.

- [ ] **Step 3: No commit needed.**

---

## Phase 7 — Verification

### Task 34: Full type-check and build

**Files:** none

- [ ] **Step 1: Type-check**

```bash
npm run check
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: build succeeds; Pagefind logs that it indexed N pages; no errors.

- [ ] **Step 3: Preview**

```bash
npm run preview
```

Keep running for the next task.

---

### Task 35: Manual walkthrough — all pages, both themes, two viewport widths

**Files:** none

Visit each URL below in **both light and dark mode** (toggle theme via header) and at both desktop (≥1280px) and mobile (375px) widths.

- [ ] **Step 1: Walk through every page**

- `/`
- `/about/`
- `/license/`
- `/resources/`
- `/guides/`
- `/guides/how-to-launch-a-card-product/`
- `/guides/how-to-select-a-bank-partner/`
- `/guides/go-to-market-plan/`
- `/guides/guide-to-starting-a-challenger-bank/`
- `/guides/n-steps-to-closing-a-bank-partner/`
- `/models/`
- `/models/bank-account/`
- `/models/credit-card/`
- `/models/term-loan/`
- `/docs/`
- `/docs/bsa/`
- `/docs/credit-card-trunk/`
- `/tools/`

For each: verify the right template is used, no console errors, no horizontal scroll on mobile, dark mode reads cleanly, links work, breadcrumbs match the URL, sidebar appears only on Article pages.

- [ ] **Step 2: Theme flash check**

Hard-refresh (`⌘⇧R`) each page in dark mode. There should be **no** flash of light theme before dark applies.

- [ ] **Step 3: Search check**

Open search via header button and `⌘K`. Query for "bsa", "credit card", "fraunces" (no result expected for the last). Verify results, navigation, and close.

- [ ] **Step 4: Fix any issues**

Each fix is its own commit with `fix: <description>`. After fixes, re-run from Step 1.

---

### Task 36: Lighthouse & axe spot checks

**Files:** none

- [ ] **Step 1: Lighthouse on home**

In Chrome DevTools, run Lighthouse against `http://localhost:4321/` (preview still running). Mobile preset, all categories.

Targets:
- Performance ≥ 95
- Accessibility = 100
- Best Practices ≥ 95
- SEO ≥ 95

- [ ] **Step 2: Lighthouse on an article**

Run against `http://localhost:4321/guides/how-to-launch-a-card-product/`. Same targets.

- [ ] **Step 3: Lighthouse on a model**

Run against `http://localhost:4321/models/credit-card/`. Same targets (note: Google Sheets iframe may drag Performance — accept if ≥ 90 and note in commit).

- [ ] **Step 4: axe DevTools on each template**

Run axe DevTools on:
- `/`
- `/guides/`
- `/guides/how-to-launch-a-card-product/`
- `/models/credit-card/`
- `/tools/`

Expected: zero "Serious" or "Critical" issues. "Moderate" / "Minor" findings reviewed and fixed if cheap.

- [ ] **Step 5: Fix anything below threshold; commit each fix individually.**

---

### Task 37: Verify `_redirects` content unchanged

**Files:** none

The `_redirects` file is honored by Cloudflare Pages — verification of actual 301 behavior happens against the preview deploy after the PR opens, not in `npm run preview`.

- [ ] **Step 1: Confirm file content is preserved**

```bash
git diff main -- public/_redirects
```

Expected: no diff (the file should not have been touched in this migration).

- [ ] **Step 2: Note in PR description that 301 verification happens against the Cloudflare preview deploy.**

After the preview deploys, run:

```bash
for path in /pricing/ /contact/ /blog/ /docs/credit-card-biz-trunk.pdf; do
  echo "--- $path"
  curl -sI "https://<preview-deploy>.pages.dev$path" | grep -E '^(HTTP|Location)'
done
```

Each should return a 301 to the right target.

---

## Phase 8 — Cut over

### Task 38: Delete Starlight remnants

**Files:**
- Delete: `src/components/Footer.astro` (old Starlight-extending footer)
- Delete: `src/components/GoogleEmbed.astro` (old version superseded by `src/components/ui/GoogleEmbed.astro`)
- Delete: `.gitkeep` files placed in Task 7 that now sit alongside real content

- [ ] **Step 1: Verify which old files are still present**

```bash
ls src/components/
```

Expected: only `layout/`, `nav/`, `ui/`, `blocks/` subdirectories. Any loose `.astro` files in `src/components/` are Starlight-era and should be removed.

- [ ] **Step 2: Delete**

```bash
git rm src/components/Footer.astro src/components/GoogleEmbed.astro 2>/dev/null || true
```

- [ ] **Step 3: Remove `.gitkeep` files**

```bash
find src/layouts src/components src/data -name .gitkeep -delete
git add -A src/
```

- [ ] **Step 4: Type-check + build**

```bash
npm run check && npm run build
```

Expected: both green.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/ src/layouts/ src/data/
git commit -m "chore: remove Starlight-era component files and gitkeeps"
```

---

### Task 39: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Rewrite affected sections**

Open `CLAUDE.md` and update each section to reflect the new stack:

Under **Project Overview**:
- Change "Astro + Starlight static site" → "Astro 5 + Tailwind v4 + Preact static site"
- Append to the Jekyll note: "Migrated again from Starlight to custom Astro + Tailwind in May 2026."

Under **Architecture**:
- Update **Framework** line to: "Astro 5.x with custom Tailwind v4 layouts. Static output. Dev toolbar disabled."
- Update **Configuration**: `astro.config.mjs` now configures Preact, MDX, sitemap, and the Tailwind v4 Vite plugin. Tailwind tokens live in `src/styles/global.css`.
- Update **Content**: collection renamed `pages`. Schema in `src/content.config.ts` with fields `section`, `template`, `publishedAt`, `updatedAt`, `draft`, `ogImage`, `hideToc`, `hideSidebar`.
- Replace **Sidebar** description: auto-generated sidebar is gone. The `Sidebar` component pulls section siblings from the `pages` collection. Sidebar appears only on Article-template pages.
- Replace **Components** list with the new tree (`layouts/`, `components/layout`, `components/nav`, `components/ui`, `components/blocks`).
- Replace **Styling**: Tailwind v4 entry CSS at `src/styles/global.css`. Color tokens are CSS variables read by Tailwind's `@theme`. Dark mode uses `.dark` class on `<html>`.
- Under **Content sections**: add the Tools section (currently a stub).
- Replace **Search** description: Pagefind, custom Preact modal, indexed via post-build CLI step.

Under **Build Commands**:
- Note that `npm run build` now chains `pagefind --site dist`.
- Add `npm run check` line.

Under **Content Conventions**:
- List the new frontmatter fields.
- List the templates: `article` (default), `section-index`, `model`, `tool`.

Under **Logo**:
- Replace with: header wordmark in Fraunces, no PNG inversion hack. Old `logo.svg` / `logo.png` may be removed in a follow-up.

Keep **MDX Gotchas** and **Deployment** sections as-is.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for new Astro + Tailwind stack"
```

---

### Task 40: Update `CHANGELOG.md`, `MIGRATION.md`, `DEPLOYMENT.md`

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `MIGRATION.md`
- Modify: `DEPLOYMENT.md`

- [ ] **Step 1: Add a CHANGELOG entry**

At the top of `CHANGELOG.md`, add:

```markdown
## 2026-05 — Migration off Starlight

- Replaced `@astrojs/starlight` with custom Astro layouts styled in Tailwind v4.
- Added Preact integration; search modal is the first island.
- Self-hosted Fraunces / Inter / JetBrains Mono fonts; removed Google Fonts request.
- New editorial visual identity: warm Paper/Ink palette, oxblood accent, Fraunces display.
- Renamed content collection `docs` → `pages`.
- Added Tools section (stub) for upcoming Preact calculators.
- Replaced flat bullet roadmap with structured `RoadmapGrid` component.
- Added `@astrojs/sitemap` integration; `sitemap-index.xml` replaces the static `sitemap.xml`.
- Light/dark theme toggle with localStorage persistence; theme flash prevented via inline script.
- Kept Pagefind for search — now via a custom Preact modal UI.
```

- [ ] **Step 2: Update `MIGRATION.md`**

Append a section noting this second migration (Starlight → custom Astro/Tailwind), with brief approach (worktree, single PR) and an explicit "no content URLs changed" note.

- [ ] **Step 3: Update `DEPLOYMENT.md`**

Add one-line note that the build command remains `npm run build` and now includes a Pagefind post-build step that emits the search index into `dist/pagefind/`.

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md MIGRATION.md DEPLOYMENT.md
git commit -m "docs: update changelog, migration, deployment for Starlight removal"
```

---

### Task 41: Open the PR

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin astro-tailwind-migration
```

- [ ] **Step 2: Open the PR via `gh`**

```bash
gh pr create --title "Migrate from Starlight to custom Astro + Tailwind v4" --body "$(cat <<'EOF'
## Summary

Replaces `@astrojs/starlight` with custom Astro layouts styled in Tailwind v4, plus a fresh editorial visual identity (Fraunces + Inter, warm Paper/Ink palette, oxblood accent).

- Spec: `docs/superpowers/specs/2026-05-12-astro-tailwind-migration-design.md`
- Plan: `docs/superpowers/plans/2026-05-12-astro-tailwind-migration.md`

No content URLs change. All `_redirects` 301s preserved. Pagefind search retained via a custom Preact modal.

## What changed

- Removed `@astrojs/starlight` and its content schema
- Added Tailwind v4, Preact, sitemap, mdx, fontsource, Lucide, Pagefind
- Built 5 page templates: Home, SectionIndex, Article, Model, Tool
- New chrome: Header, Footer, MobileMenu, ThemeToggle, Sidebar, Toc, Breadcrumbs
- Renamed `src/content/docs/` → `src/content/pages/`
- Hardcoded home page in `src/pages/index.astro` with new `RoadmapGrid`
- Added Tools section stub for upcoming Preact calculators
- Light/dark toggle with FOWT prevention

## Out of scope (follow-on specs)

- Preact calculators (3 calculators planned, each its own spec)
- Comprehensive design / a11y / SEO / performance audit
- Content edits beyond frontmatter

## Test plan

- [ ] Cloudflare Pages preview deploys without errors
- [ ] All 12 content pages render in both themes (verified pre-PR in `npm run preview`)
- [ ] All `_redirects` 301s functional on preview deploy (`curl -I` each one)
- [ ] Search works on preview deploy
- [ ] Lighthouse: home Performance ≥ 95, Accessibility = 100, SEO ≥ 95
- [ ] axe DevTools on each of 5 templates: zero serious violations
EOF
)"
```

- [ ] **Step 3: Return the PR URL.**

After merge, Cloudflare Pages auto-deploys. Confirm `https://www.notafintech.co` reflects the new design.

---

## Out-of-band notes

### What is intentionally not in this plan

- **Calculators / interactive models.** Spec'd separately. Tools section is a stub.
- **Design / a11y / SEO audits.** Baseline only here; full audits run on the redesigned site in their own specs.
- **Content edits.** Prose stays as-is; only frontmatter changes.
- **Analytics changes.** Plausible + GA stay identically configured.

### Risks called out during planning

| Risk | Where it surfaces | Mitigation |
|---|---|---|
| Pagefind doesn't index on Cloudflare | Task 30 (preview test), Task 33 (sitemap check), final deploy | Falls back to "ship without search at launch" — hotfix removes search button + modal, not a rollback. |
| Theme flash | Task 9 (inline script), Task 35 (hard-refresh check) | Inline script must be the **first** script in `<head>`. |
| Node version too old | Task 1 (Step 2 check) | Cloudflare Pages defaults to Node 22 currently. If their default moves, set `NODE_VERSION` in Pages settings. |
| `_redirects` regressions | Task 37 | Verified post-deploy on preview. |
| Lighthouse regression from self-hosted fonts | Task 36 | `@fontsource-variable/*` ships a single file per variable axis; preload critical weights in `BaseLayout` only if Lighthouse flags it. |
