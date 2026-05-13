# Astro + Tailwind Migration — Design Spec

**Date:** 2026-05-12
**Status:** Approved for implementation planning
**Author:** Matthew Goldman (with Claude)
**Target site:** [www.notafintech.co](https://www.notafintech.co)

---

## 1. Context

The site is currently Astro 5 + Starlight, migrated from Jekyll in February 2026. Starlight provides the entire visual chrome: header, auto-generated sidebar, Pagefind search, dark-mode toggle, mobile menu, and the docs-flavored layout. The site has 12 content pages across 5 sections (Guides, Models, Docs, Resources, About).

The decision has been made to leave Starlight for a custom Astro + Tailwind stack. The motivation is design flexibility — both to give the site a distinctive editorial identity and to host upcoming interactive Preact calculators that don't fit a docs-theme container.

This migration is **sub-project A of a broader effort**. Calculators, full audits (design / accessibility / SEO / performance), and content edits are explicitly out of scope here and will have their own specs.

## 2. Decisions Locked

| Topic | Decision |
|---|---|
| Site shape | Knowledge base + tools. Home is a polished landing; sections each have their own index; sidebar only on long-form content. |
| Search | Keep Pagefind. Standalone install, custom UI as a Preact island. |
| Dark mode | Keep, with explicit user toggle. Persisted to `localStorage`. |
| Visual direction | Editorial / finance publication (Stripe Press family). |
| Information architecture | Existing 5 sections preserved. Add `Tools` as a new top-level section (stub for now). |
| Migration approach | Big-bang on a git worktree, single PR, single merge. |
| Logo | Replace icon + PNG with a Fraunces-set wordmark. Light/dark via color token, no CSS-invert hacks. |

## 3. Visual Identity & Design System

### Typography
- **Display / headings:** Fraunces (variable serif, self-hosted via `@fontsource-variable/fraunces`).
- **Body & UI:** Inter (variable, self-hosted via `@fontsource-variable/inter`).
- **Numeric / tabular figures:** JetBrains Mono for figure-prominent contexts; Inter `font-feature-settings: "tnum"` for inline numerics in prose.
- Self-hosted to remove a Google Fonts request, fix a current LCP regression, and avoid consent-banner exposure.

### Color tokens
Restrained, warm-toned, editorial:

| Token | Light value | Dark value | Use |
|---|---|---|---|
| `paper` | `#FAF7F2` | `#15110E` | Page background |
| `ink` | `#1A1714` | `#F4EFE7` | Primary text |
| `accent` | `#7A2E2A` | `#B85450` | Links, key states, focus rings |
| `rule` | `#E5DDD0` | `#2A231D` | Dividers, borders |
| `muted` | `#6E6660` | `#8E867F` | Secondary text |
| `surface` | `#FFFFFF` | `#1F1813` | Cards, modal backgrounds |

Plus a 9-step warm-gray scale derived from `ink` for fine-grained UI states. Final hex values may be tuned during implementation; the *relationships* are fixed.

### Spacing & rhythm
- Tailwind default scale.
- Prose measure: `max-w-[68ch]`.
- Body line-height 1.6; display 1.15–1.25.
- `@tailwindcss/typography` plugin, customized to the Fraunces / Inter pair.

### Iconography
Lucide. `lucide-astro` for static Astro components, `lucide-preact` inside islands.

## 4. Site Architecture & Layout

### Chrome
**Header (sticky, slim):**
- Left: Fraunces wordmark "Not a Fintech Company"
- Center–right: top nav — *Guides · Models · Tools · Docs · Resources · About*
- Right cluster: search button (opens `⌘K` modal), theme toggle, GitHub link
- Mobile (`<768px`): hamburger → full-screen drawer

**Footer (multi-column desktop, stacked mobile):**
- Brand block: wordmark + tagline + CC0 notice
- Sections column: mirrors top nav
- Community column: GitHub, contribute, contact (`hello@notafintech.co`)
- Credit row: "Powered by community. Hosted by Totavi."

### Page templates
Five distinct templates:

| Template | Used by | Shape |
|---|---|---|
| **Home** (`/`) | Single page | Hero → featured guides → models/tools preview → open-source callout → redesigned roadmap. No sidebar. |
| **SectionIndex** | `/guides/`, `/models/`, `/docs/`, `/tools/` | Title + intro + article list as cards or editorial rows. No sidebar. |
| **Article** | `/guides/x/`, `/docs/bsa/`, `/about`, `/resources`, `/license` | Breadcrumbs → left: sidebar of section siblings → center: prose @ 68ch → right (≥1024px): sticky TOC. |
| **Model** | `/models/x/` | Slim intro + Google Sheets embed prominent. Sidebar suppressed. |
| **Tool** | `/tools/x/` | Full-width tool dominates. Brief intro + tool + supporting prose. No sidebar. |

### Layout rules
- Sidebar is **not** universal — only on Article template.
- TOC is desktop-only (≥1024px). Mobile gets no TOC — mobile TOC patterns rarely earn their cost.
- Section indexes get full width to breathe (no sidebar).

## 5. Tech Stack

### Add
- **Tailwind v4** — CSS-first config via `@theme` and `@import "tailwindcss"`. Tokens live in `src/styles/theme.css`.
- **`@tailwindcss/typography`** — base prose styles, customized to Fraunces / Inter pair.
- **`@astrojs/preact`** — for islands. Installed but no islands until calculators ship, except the search modal.
- **`@astrojs/sitemap`** — replaces the static `public/sitemap.xml` (currently misaligned with `CLAUDE.md`).
- **`@astrojs/mdx`** — installed explicitly (was previously transitive via Starlight).
- **`pagefind`** — standalone CLI as a post-build step.
- **`@fontsource-variable/fraunces`**, **`@fontsource-variable/inter`**, **`@fontsource/jetbrains-mono`** — self-hosted fonts.
- **`lucide-astro`** + **`lucide-preact`** — icons.

### Remove
- **`@astrojs/starlight`** and its content schema.

### Keep
- Astro 5.x, Content Collections, TypeScript strict.
- Cloudflare Pages git deployment.
- `public/_redirects` (Jekyll-era 301s).
- `wrangler.jsonc` (local Wrangler only).

### Theming
CSS custom properties exposed to Tailwind v4 via `@theme`. Theme toggle = `class="dark"` on `<html>`. Inline `<script>` at top of `<head>` reads `localStorage.theme` and applies the class before any CSS loads — prevents flash of wrong theme. Standard pattern.

### Build pipeline
```
astro build  →  pagefind --site dist  →  dist/ deployed by Cloudflare Pages
```

`package.json` `build` script becomes: `astro build && pagefind --site dist`.

## 6. Content Migration Plan

### Directory rename
`src/content/docs/` → `src/content/pages/`. Content URLs are unaffected (set by routing, not folder names). The old name was Starlight-flavored and misleading once Starlight is gone.

### New frontmatter schema
```ts
{
  title: string,
  description: string,
  section?: 'guides' | 'models' | 'docs' | 'tools' | 'resources' | 'about',
  publishedAt?: Date,
  updatedAt?: Date,
  draft?: boolean,
  ogImage?: string,        // per-page OG override
  hideToc?: boolean,       // suppress TOC on this Article page
  hideSidebar?: boolean,   // for Tool/Model pages
}
```

### File-by-file treatment

| Path | Before | After |
|---|---|---|
| `index.mdx` | Starlight `splash` hero + roadmap bullets | Home template: hero + featured guides + tools preview + open-source callout + structured `RoadmapGrid` |
| `about.md` | Starlight page | Article template, restyled |
| `license.md` | Starlight page | Article template, restyled |
| `resources.md` | Starlight page | Article template, restyled |
| `guides/index.md` + 5 guides | Auto-sidebar | SectionIndex + Article templates |
| `models/index.md` + 3 MDX models | Auto-sidebar | SectionIndex + Model template (embed-prominent) |
| `docs/index.md` + BSA + credit-card-trunk | Auto-sidebar | SectionIndex + Article + Model templates as appropriate |
| `tools/index.md` | — | **NEW**: stub page noting calculators coming |

### Components to build (from scratch, no Starlight inheritance)
- `Header.astro`
- `Footer.astro` (replaces existing custom one)
- `Sidebar.astro` (siblings within section)
- `Toc.astro` (sticky, desktop-only)
- `Breadcrumbs.astro`
- `SearchButton.astro` (in header)
- `SearchModal.preact.tsx` (Pagefind UI as an island)
- `ThemeToggle.astro` (inline script + button)
- `GoogleEmbed.astro` (kept semantically, restyled)
- `Hero.astro`
- `RoadmapGrid.astro` (replaces flat bullet roadmap)
- `GuideCard.astro`
- `SectionIndex.astro`
- `ArticleLayout.astro`
- Layout primitives: `BaseLayout.astro`, `Prose.astro`

### Roadmap component
Today: flat hierarchical bullet list inside `index.mdx`. After: a `RoadmapGrid.astro` that renders categories as cards/columns, each item bearing a status (`Published` / `Drafting` / `Planned` / `External-linked`). Source data lives in a TypeScript constants file (`src/data/roadmap.ts`) so it's editable separately from layout.

## 7. Migration Sequence

Eight phases inside the worktree:

| # | Phase | Output | User-visible? |
|---|---|---|---|
| 1 | Foundation | Worktree created, Starlight removed, all new deps installed, `theme.css` written, `astro.config.mjs` rewritten, content collection schema migrated | Build passes; site renders unstyled or blank — internal only |
| 2 | Chrome | `BaseLayout`, Header, Footer, ThemeToggle, mobile menu, base typography | Yes |
| 3 | Templates | All 5 templates + routing + Breadcrumbs/Sidebar/Toc | Yes |
| 4 | Content | Directory rename, frontmatter migration, MDX adapted, Home rebuilt, `RoadmapGrid` ships | Yes |
| 5 | Search | Pagefind install + post-build script + `SearchModal` Preact island + `SearchButton` in header | Yes |
| 6 | SEO + meta | Per-page OG/Twitter meta, canonical URLs, `@astrojs/sitemap` integration, `robots.txt` updated | Invisible to users, visible to crawlers |
| 7 | Verification | Build green, all 12 pages render, dark mode no FOWT, Lighthouse spot checks, mobile pass, axe DevTools pass, `_redirects` 301s confirmed | Internal QA |
| 8 | Cut over | Delete Starlight remnants, update `CLAUDE.md` / `CHANGELOG.md` / `MIGRATION.md`, open PR, merge | Live |

### Testing approach
Static content site → testing is mostly build-time + manual:
- TypeScript strict; `astro check` green.
- Manual walkthrough of all 12 pages in both themes, both viewport widths.
- Lighthouse on three templates: home, `/guides/how-to-launch-a-card-product/`, `/models/credit-card/`. Targets in §9.
- Axe DevTools on each of the five templates: zero serious violations.
- No automated visual regression testing for now. Can be added later if it earns its keep.

## 8. Out of Scope (and calculator roadmap)

The following are **explicitly excluded** from this spec. Each will be its own brainstorm → spec → plan → implement cycle.

### Preact calculators / live models
The three `/models/*` pages keep their existing Google Sheets embeds throughout this migration. The new `/tools/` section ships *empty* (stub index page).

After this migration ships, the proposed calculator roadmap:

| Order | Spec | Output |
|---|---|---|
| Spec 2 | Data extraction + calculator framework | Canonical formulas extracted from the three sheets into typed TS modules. Shared Preact framework (inputs, results, scenarios, charts, share-via-URL state, accessibility model). One reference calculator built end-to-end (bank account — simplest math) to prove the pattern. |
| Spec 3 | Term Loan calculator | Amortization, prepayment, comparisons. Lives at `/tools/term-loan/`. |
| Spec 4 | Credit Card calculator | Revolving balance, APR, minimum payment, fees, payoff scenarios. |
| Spec 5 | Bank Account follow-up | Extend Spec 2's reference work into a full calculator if not already complete. |

Each calculator spec is roughly the same effort as this migration spec.

The Google Sheets embeds **stay live indefinitely** even after Preact calculators ship — they remain a "see the underlying math" affordance for power users. Tools become the default interactive experience; Models become the archive.

### Other deferred work
- **Comprehensive audits (design, a11y, SEO, performance).** This migration ships *baseline* practice — semantic HTML, focus rings, keyboard nav, ARIA on chrome, per-page OG meta. It does not run a findings-driven audit pass. That happens against the redesigned site in a follow-up spec.
- **Content edits.** Prose on the 12 pages stays as-is. Editing copy is a separate content workstream.
- **Analytics changes.** Plausible + Google Analytics stay configured identically. No new event tracking.

## 9. Success Criteria

Definition of done:
1. Site builds successfully on Cloudflare Pages from the merged branch.
2. All 12 existing content pages render in the new design, in both light and dark themes, on desktop and mobile (≥375px width).
3. All `public/_redirects` 301s still resolve correctly.
4. Pagefind search functional in `npm run preview` and on the deployed site.
5. No flash of incorrect theme on initial paint.
6. Lighthouse on three representative templates (home, one guide, one model):
   - Performance ≥ 95
   - Accessibility = 100
   - Best Practices ≥ 95
   - SEO ≥ 95
7. Manual axe DevTools pass on each of the five templates: zero serious violations.
8. `CLAUDE.md`, `CHANGELOG.md`, `MIGRATION.md`, `DEPLOYMENT.md` updated to reflect new stack.

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Pagefind doesn't index correctly on Cloudflare Pages | Test in `npm run preview` during Phase 5. Fallback: ship without search at launch, add in follow-up. Pagefind is well-trodden; expect this to work. |
| Flash of incorrect theme on initial paint | Inline `<script>` in `<head>` before any CSS, applies `dark` class from `localStorage`. Test specifically in Phase 2. |
| Cloudflare Node version too low for Tailwind v4 | Tailwind v4 needs Node 20+. Cloudflare Pages defaults to Node 22 currently. Confirm in Phase 1 build. |
| Long-running worktree branch drifts from `main` | `main` is essentially frozen during migration — no concurrent feature work expected. Rebase opportunistically if any hotfixes land on `main`. |
| `_redirects` regressions | Test each 301 entry during Phase 7. |
| Lighthouse Performance regression from font self-hosting | Use `font-display: swap`, preload critical font weights, subset if needed. Variable fonts reduce request count. |

## 11. Open items (deferred, not blocking)

- Final hex tuning of color tokens during implementation — relationships are fixed, exact values may shift after seeing them in context.
- Fraunces optical-axis and weight selection for the wordmark — pick during Phase 2 with a quick visual sanity check.
- Mobile menu animation style — pick during Phase 2.
- Whether to add Astro's `<ClientRouter />` view transitions — defer the decision to Phase 2; can ship without and add later.
