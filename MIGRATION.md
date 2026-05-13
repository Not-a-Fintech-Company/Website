# Migration Guide: GitHub Pages (Jekyll) to Cloudflare Pages (Astro)

This document covers the specific steps to cut over the live site at `notafintech.co` from the old Jekyll/GitHub Pages setup to the new Astro + Starlight site on Cloudflare Pages.

## Prerequisites

- Access to the [Cloudflare dashboard](https://dash.cloudflare.com) for the account that will host the site
- Access to the domain registrar for `notafintech.co` (to update nameservers or DNS records)
- The `astro-migration` branch merged to `main`

## Step 1: Merge the migration branch

```bash
git checkout main
git merge astro-migration
git push origin main
```

After this, `main` contains the Astro site. The Jekyll site is gone from the repo.

## Step 2: Create the Cloudflare Pages project

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3. Select the **Not-a-Fintech-Company/Website** repository and the **main** branch.
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION` = `18`
5. Click **Save and Deploy**. Wait for the first build to complete.
6. Note the `*.pages.dev` URL assigned to the project (e.g., `not-a-fintech-company.pages.dev`). Verify the site loads correctly there.

## Step 3: Disable GitHub Pages

1. Go to the GitHub repo **Settings** > **Pages**.
2. Under **Source**, select **None** to disable GitHub Pages.
3. This stops GitHub from serving the old Jekyll site.

## Step 4: Configure the custom domain on Cloudflare Pages

1. In the Cloudflare dashboard, go to your Pages project > **Custom domains**.
2. Click **Set up a custom domain** and enter `www.notafintech.co` (primary).
3. Add `notafintech.co` as a second custom domain.
4. Set up a Cloudflare redirect rule to redirect `notafintech.co` → `www.notafintech.co` (301).

### If the domain is already on Cloudflare DNS:

Cloudflare will automatically add the required CNAME records. No additional DNS changes needed.

### If the domain is on an external registrar:

You have two options:

**Option A — Move DNS to Cloudflare (recommended):**
1. Add `notafintech.co` as a site in the Cloudflare dashboard.
2. Cloudflare will provide two nameservers (e.g., `ada.ns.cloudflare.com`).
3. Update the nameservers at your domain registrar.
4. Wait for propagation (up to 24 hours, usually faster).
5. Once active, the Pages custom domain setup will work automatically.

**Option B — External DNS with CNAME:**
1. At your registrar's DNS settings, add a CNAME record:
   - `notafintech.co` → `not-a-fintech-company.pages.dev` (or your project's `.pages.dev` URL)
   - `www.notafintech.co` → `not-a-fintech-company.pages.dev`
2. Note: CNAME at the apex (`notafintech.co`) requires CNAME flattening support from your DNS provider.

## Step 5: Verify SSL

Cloudflare Pages provides automatic SSL. After the custom domain is active:

1. Visit `https://www.notafintech.co` and confirm the SSL certificate is valid.
2. In the Cloudflare dashboard, go to **SSL/TLS** and ensure the mode is set to **Full (strict)**.

## Step 6: Verify the live site

Check the following:

- [ ] Homepage loads at `https://www.notafintech.co`
- [ ] All guide pages render correctly
- [ ] Google Sheets iframes load on model and docs pages
- [ ] Sidebar navigation works
- [ ] Search works (type in the search box)
- [ ] Footer shows CC0 license and Totavi credit
- [ ] `https://www.notafintech.co/sitemap-index.xml` returns the sitemap
- [ ] `https://www.notafintech.co/robots.txt` is correct
- [ ] OG image loads when sharing a link (test with https://www.opengraph.xyz/)
- [ ] Plausible dashboard shows traffic
- [ ] Google Analytics real-time view shows activity
- [ ] Mobile layout works

## Step 7: Clean up GitHub repo settings

1. Remove any GitHub Pages-specific settings (custom domain field, branch source).
2. Delete the old `CNAME` file from the repo if still present (Cloudflare doesn't use it).
3. Update the repo description/website URL if it points to the GitHub Pages URL.

## Rollback plan

If something goes wrong after cutover:

1. Re-enable GitHub Pages in the repo settings, pointing to `main`.
2. The old Jekyll site is still available in git history. To restore it:
   ```bash
   git log --oneline  # Find the last Jekyll commit hash
   git checkout <hash> -- .
   ```
3. Revert DNS changes at your registrar if nameservers were moved.

## Post-migration cleanup

Once the new site is live and verified:

- Remove `public/CNAME` from the repo (GitHub Pages artifact)
- Delete this file (`MIGRATION.md`) if no longer needed
- Update `CHANGELOG.md` with the migration date

---

## Migration from Starlight to Custom Astro + Tailwind (May 2026)

After the initial Jekyll → Astro migration (February 2026), the site was redesigned off Starlight and onto a custom Astro + Tailwind v4 layout with a fresh editorial visual identity.

### Approach

- Implemented in an isolated git worktree (`astro-tailwind-migration` branch)
- Single PR with all changes: new components, styling, content structure, and removal of Starlight dependencies
- No content URLs changed — all internal links, redirects, and SEO structure remained intact
- Pagefind search retained via a custom Preact modal UI

### Key Changes

- Replaced `@astrojs/starlight` with custom page templates (Article, SectionIndex, Model, Tool)
- Renamed content collection from `docs` to `pages` with extended frontmatter
- Added Tailwind v4 styling and custom Fraunces/Inter fonts
- Integrated Preact for the first interactive island (SearchModal)
- Added light/dark theme toggle with localStorage persistence
- Replaced sidebar generation with a component-based sidebar that queries the `pages` collection
- Added new editorial visual identity (Paper/Ink palette, oxblood accent, Fraunces display)
- Added Tools section as a stub for upcoming Preact calculators

### Verification

- Deployment was tested on Cloudflare Pages preview
- All 18 pages render correctly in both light and dark themes
- All 301 redirects remain functional
- Search works via the custom modal
- Lighthouse and accessibility audits meet baseline targets
