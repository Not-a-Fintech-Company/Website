# Term Loan Unit Economics Calculator — Design Spec

**Date:** 2026-05-15
**Status:** Approved for implementation planning
**Author:** Matthew Goldman (with Claude)
**Parent migration spec:** `docs/superpowers/specs/2026-05-12-astro-tailwind-migration-design.md`

---

## 1. Context

The Astro+Tailwind migration shipped with a stub `/tools/` page ("calculators coming"). The decision was made to ship at least one real working calculator before merging to `main` so the section isn't blank on launch. This spec covers that first calculator: **Term Loan Unit Economics**.

This is the proof-of-concept for the future Tools section. The framework it establishes (file structure, math module pattern, Preact island shape, UI layout) is intended to be reused for the next two calculators (Bank Account, Credit Card) which remain out of scope for this PR.

## 2. Decisions Locked

| Topic | Decision |
|---|---|
| Calculator type | **Lender-side economics** (mirrors existing `/models/term-loan/` Sheet), not borrower-side payment calculator |
| Math fidelity | **Lean MVP**: 8 inputs, 6 outputs, no charts, no amortization table preview, no NPV/IRR |
| UI shape | Two-column with sticky results panel on desktop; stacked on mobile |
| Update behavior | Live (every input change). No "Calculate" button. |
| State persistence | None (no URL state, no localStorage) — deferred to future spec |
| Hydration | `client:load` (calculator is the page's primary interactive element) |
| Math location | Pure functions in `src/lib/term-loan.ts` — testable, reusable for follow-on calculators |
| Other two tools | Create stub pages (`tools/bank-account.md`, `tools/credit-card.md`) with "Coming soon" content + link to the existing Google Sheets at `/models/*` |

## 3. What the Calculator Computes

### Inputs

Eight numeric fields, each with a default value, suffix, and validation range:

| Field | Suffix | Default | Min | Max |
|---|---|---|---|---|
| Loan amount | `$` | 10,000 | 100 | (no max) |
| APR | `%` | 18.0 | 0 | 100 |
| Term | `months` | 36 | 1 | 360 |
| Origination fee | `%` of amount | 3.0 | 0 | 10 |
| Cost of funds | `%` annual | 5.5 | 0 | 25 |
| Servicing cost | `$/month` | 4.50 | 0 | (no max) |
| Annual loss rate | `%` | 4.0 | 0 | 25 |
| CAC | `$` one-time | 75 | 0 | (no max) |

Invalid input (empty, non-numeric, out of range) keeps the last valid value internally and surfaces an inline error chip near the field. The result panel keeps displaying numbers from the last valid state.

### Outputs

Six computed values; two are featured ("hero" numbers) and four are line items in a breakdown.

**Featured (large display):**
| Result | Computed from |
|---|---|
| Net profit per loan | revenue − all costs |
| ROA | `net_profit / avg_outstanding_balance` |

**Breakdown rows:**
| Result | Computed from |
|---|---|
| Monthly payment (to borrower) | Standard amortization formula |
| Total interest revenue | `monthlyPayment × termMonths − loanAmount` |
| Origination fee revenue | `loanAmount × originationFeePct` |
| Total cost of funds | `costOfFundsAnnual × avgOutstandingBalance × (termMonths / 12)` |
| Expected losses | `annualLossRate × avgOutstandingBalance × (termMonths / 12)` |
| Total servicing | `servicingMonthly × termMonths` |

### Formulas

**Monthly payment** (standard amortization):

```
r = APR / 12 / 100
P = (loanAmount · r) / (1 − (1 + r)^−termMonths)
```

If `r === 0` (zero APR): `P = loanAmount / termMonths`.

**Average outstanding balance** is computed exactly by running the amortization schedule and averaging the per-month outstanding balance, not approximated as `loanAmount / 2`.

**Net profit per loan:**

```
revenue = totalInterestRevenue + originationFeeRevenue
costs = totalCostOfFunds + expectedLosses + totalServicing + cac
netProfit = revenue − costs
roaPct = (netProfit / avgOutstandingBalance) × 100
```

### Caveats (rendered as prose under the calculator)

- Loss rate is treated as a constant annual rate applied to average outstanding balance — does not model timing of charge-offs, recoveries, or vintage curves.
- No prepayment modeling — assumes the loan runs full term.
- CAC is a one-time origination cost, not amortized.
- All figures are nominal (no time-value-of-money discounting). Use `/models/term-loan/` for NPV/IRR analysis.

## 4. UI Shape

### Page structure

```
<ToolLayout title="Term Loan Unit Economics" description="…" section="tools" hideSidebar>
  Breadcrumbs: Home › Tools › Term Loan
  Eyebrow: TOOL
  H1: Term Loan Unit Economics
  Lede (description)

  <TermLoanCalculator client:load />

  <Prose>
    [Markdown body: caveats + link to /models/term-loan/]
  </Prose>
</ToolLayout>
```

### Calculator island layout

Two columns on `lg:` and up, stacked on smaller viewports.

**Left column (inputs, ~40%):**

- Stacked vertical form, NumberField components.
- Two soft group headings (editorial small-caps):
  - "Loan terms" — loan amount, APR, term, origination fee
  - "Lender economics" — cost of funds, servicing, loss rate, CAC
- "Reset to defaults" text button at the bottom.

**Right column (results, ~60%, `sticky top-24` on lg+):**

- **Hero numbers** (largest type, `JetBrains Mono` for tabular figures):
  - Net profit per loan
  - ROA %
- **Per-loan breakdown** (table-like list):
  - Interest revenue (+)
  - Origination revenue (+)
  - Cost of funds (−)
  - Expected losses (−)
  - Servicing (−)
  - CAC (−)
  - Divider
  - Monthly payment (borrower) — separate, informational
- Negative values prefixed with `−` and `text-muted`.
- Net profit is `text-accent` if positive, `text-rose-700` (dark mode `text-rose-300`) if negative.

### Visual style

- Inputs use the existing editorial style — single-line labels above field, `border border-rule` on focus thickens to `border-ink`.
- Hero result numbers use `EB Garamond Variable` at `text-5xl md:text-6xl font-bold` with tight tracking and `tabular-nums`.
- Breakdown rows use `JetBrains Mono` at `text-sm`. Labels left, values right-aligned.
- All-caps section labels match the site's `.section-intro h2` eyebrow style.

### Mobile (`< lg`)

- Single column. Inputs first, results second.
- Results un-sticks.
- Result panel still uses the same component, just unstacked.
- No horizontal scroll on 375px width.

### Accessibility

- All inputs have visible `<label for>` + accessible name.
- Each field has `aria-describedby` pointing at the error chip (when present).
- Reset button has clear text ("Reset to defaults").
- The math result panel uses `aria-live="polite"` so screen readers announce material changes on input.

## 5. Architecture & File Structure

### New files

| Path | Purpose |
|---|---|
| `src/lib/term-loan.ts` | Pure financial-math functions. No dependencies. |
| `src/components/tools/TermLoanCalculator.tsx` | Preact island. Single state owner. |
| `src/components/tools/NumberField.tsx` | Preact: labeled numeric input with suffix + validation. |
| `src/components/tools/ResultBlock.tsx` | Astro/Preact: large display number + tiny caption. |
| `src/components/tools/BreakdownRow.tsx` | Astro/Preact: revenue/cost line item with sign + color. |
| `src/content/pages/tools/term-loan.md` | Frontmatter + caveats markdown. |
| `src/content/pages/tools/bank-account.md` | Stub: "Coming soon" + link to `/models/bank-account/`. |
| `src/content/pages/tools/credit-card.md` | Stub: "Coming soon" + link to `/models/credit-card/`. |

### Modified files

- `src/content/pages/tools/index.md` — rewritten intro text describing the section.
- `src/layouts/ToolLayout.astro` — adds a named `<slot name="tool" />` between the lede and the prose block.
- `src/pages/[...slug].astro` — when `template === 'tool'` and slug is `tools/term-loan`, mount `<TermLoanCalculator client:load slot="tool" />` inside `<ToolLayout>`. Hardcode the slug→component mapping for now (only one calculator).

### Math module API (`src/lib/term-loan.ts`)

```ts
export interface TermLoanInputs {
  loanAmount: number;
  aprPct: number;
  termMonths: number;
  originationFeePct: number;
  costOfFundsPct: number;
  servicingMonthly: number;
  annualLossRatePct: number;
  cac: number;
}

export interface TermLoanResults {
  monthlyPayment: number;
  totalInterestRevenue: number;
  originationFeeRevenue: number;
  avgOutstandingBalance: number;
  totalCostOfFunds: number;
  expectedLosses: number;
  totalServicing: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roaPct: number;
}

export function computeTermLoan(inputs: TermLoanInputs): TermLoanResults;

// Helper, also exported so future calculators can reuse:
export function amortizationSchedule(
  loanAmount: number,
  monthlyRatePct: number,  // decimal, e.g. 0.015 for 1.5%/mo
  termMonths: number,
): Array<{ month: number; interest: number; principal: number; balance: number }>;
```

Edge cases handled in `computeTermLoan`:
- `monthlyRate === 0` → payment is `loanAmount / termMonths`
- `termMonths === 0` → returns NaN-safe zeros (UI prevents this)
- `loanAmount === 0` → all zeros
- `avgOutstandingBalance === 0` → ROA returns 0 (avoid divide-by-zero)

### Component state

`TermLoanCalculator.tsx` owns all input state via a single `useState<TermLoanInputs>` initialized to the defaults from §3. A `useMemo` derives `TermLoanResults` from inputs on every change. No effects, no async, no fetches.

A separate `useState<Record<keyof TermLoanInputs, string | null>>` tracks current-error messages per field; cleared when the user enters a valid value.

### Tools index integration

The `SectionIndexLayout` already auto-lists content pages in the same `section:`. Creating the three `tools/*.md` files automatically populates the `/tools/` index cards. The intro markdown in `tools/index.md` is rewritten to set context.

## 6. Out of Scope

This spec explicitly does NOT include:

- Charts or data visualization (no histograms, no bars, no sparklines)
- Amortization schedule preview (the schedule is computed internally but not rendered)
- URL state encoding for shareable scenarios
- localStorage persistence of last inputs
- Comparison mode (two scenarios side by side)
- NPV / IRR / payback period
- Sensitivity table (APR ± 1%, loss rate ± 0.5%)
- Bank Account calculator (stub only)
- Credit Card calculator (stub only)
- Unit tests (TS strict + manual sanity checks against the existing Google Sheet's outputs are the verification approach for MVP)

These belong in follow-on specs.

## 7. Success Criteria

Definition of done:

1. Build green (`npm run check && npm run build`).
2. `/tools/` index lists three items: Term Loan (live), Bank Account (coming soon), Credit Card (coming soon).
3. `/tools/term-loan/` renders the calculator with default values populated. Net profit shows a positive number with default inputs.
4. Editing any input updates results within one paint frame.
5. Results match the existing `/models/term-loan/` Google Sheet within $1 / 0.01% for at least one verification scenario (defaults).
6. Invalid input (empty, negative, > max) keeps the last valid result displayed and surfaces an inline error chip.
7. Mobile (375px width): no horizontal scroll, both columns stacked.
8. Dark mode: all components render correctly with token-driven colors.
9. Existing Lighthouse / axe quality holds (no regression on Accessibility, Best Practices).

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Math output doesn't match the existing Sheet's results | Verify with at least one scenario (defaults) before opening PR; if material discrepancy, surface in PR description for review |
| Live updating on every keystroke feels janky with very large numbers / heavy compute | The math runs in <100µs for amortization schedules up to 360 months; safe under any reasonable input |
| Preact island bundle size grows | `compat: false` already configured in `astro.config.mjs`; Preact is ~3KB gzip. Calculator code itself is <5KB. |
| Stub pages for Bank Account / Credit Card feel underwhelming | They link out to the existing Google Sheets and explicitly say "Coming soon" with a date-free promise. Better than blank cards. |
| User mis-types and sees confusing zeros | All inputs clamp on blur; defaults exist; the math module is NaN-safe |

## 9. Open Items Deferred

- Final hex color for "negative net profit" indicator (proposed `text-rose-700` light / `text-rose-300` dark) — TBD during implementation if it clashes with the warm palette.
- Exact preset values for the two upcoming calculators' stubs (whether they appear with example inputs or just descriptive copy) — defer to their own specs.
