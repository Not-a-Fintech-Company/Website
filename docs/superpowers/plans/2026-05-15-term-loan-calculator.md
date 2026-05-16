# Term Loan Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-15-term-loan-calculator-design.md`

**Goal:** Ship a lender-side **Term Loan Unit Economics** calculator at `/tools/term-loan/`, plus "Coming soon" stub pages for the two follow-on calculators (`/tools/bank-account/`, `/tools/credit-card/`), and a richer `/tools/` index — all in this PR.

**Architecture:** Pure financial-math functions in a separate TypeScript module (`src/lib/term-loan.ts`). Single Preact island (`TermLoanCalculator.tsx`) owns all UI state via `useState`, derives results via `useMemo`. Three small presentational Preact components (`NumberField`, `ResultBlock`, `BreakdownRow`) keep the island file focused. Calculator is mounted into a new named `<slot name="tool" />` in `ToolLayout.astro` by the dynamic router when the entry slug matches `tools/term-loan`.

**Tech Stack:** Astro 6 + Tailwind v4 + Preact (already configured). No new dependencies.

**Verification approach:** This project has no test framework. Each task that touches code is verified via `npm run check` + `npm run build` + a manual functional check described in-step. Math correctness is verified once in Task 2 against hand-calculated expected values for the default scenario.

**Prerequisite:** Already in the `redesign` worktree branch. Working tree clean at `968263a` or later (the typeset + bolder design pass). All prior migration commits intact.

---

## File Structure (final state)

```
src/
  lib/
    term-loan.ts                       # NEW — pure math: amortization, unit economics
  components/
    tools/                             # NEW directory
      NumberField.tsx                  # NEW — labeled numeric input with suffix
      ResultBlock.tsx                  # NEW — large display number + caption
      BreakdownRow.tsx                 # NEW — revenue/cost line item
      TermLoanCalculator.tsx           # NEW — the Preact island (single state owner)
  content/
    pages/
      tools/
        index.md                       # MODIFIED — richer intro
        term-loan.md                   # NEW — calculator content page (frontmatter + caveats)
        bank-account.md                # NEW — coming-soon stub
        credit-card.md                 # NEW — coming-soon stub
  layouts/
    ToolLayout.astro                   # MODIFIED — add <slot name="tool" />
  pages/
    [...slug].astro                    # MODIFIED — mount TermLoanCalculator for tools/term-loan slug

docs/superpowers/
  specs/2026-05-15-term-loan-calculator-design.md
  plans/2026-05-15-term-loan-calculator.md   # this file
```

Nothing is deleted. No package.json change. No global CSS change.

---

## Phase 1 — Math and content

### Task 1: Math module `src/lib/term-loan.ts`

**Files:**
- Create: `src/lib/term-loan.ts`

- [ ] **Step 1: Create the directory and file with the full math module**

Write `src/lib/term-loan.ts` with exactly this content:

```ts
// src/lib/term-loan.ts
//
// Pure financial-math functions for lender-side term-loan unit economics.
// No dependencies. Safe to import anywhere. Exported helpers are intended
// to be reusable for the upcoming Bank Account and Credit Card calculators.

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

export interface AmortRow {
  month: number;
  interest: number;
  principal: number;
  balance: number; // end-of-month balance
}

const ZERO_RESULTS: TermLoanResults = {
  monthlyPayment: 0,
  totalInterestRevenue: 0,
  originationFeeRevenue: 0,
  avgOutstandingBalance: 0,
  totalCostOfFunds: 0,
  expectedLosses: 0,
  totalServicing: 0,
  totalRevenue: 0,
  totalCosts: 0,
  netProfit: 0,
  roaPct: 0,
};

/**
 * Computes a full amortization schedule for a fixed-rate term loan.
 * `monthlyRate` is the periodic rate as a decimal (e.g. 0.015 for 1.5%/month).
 * Returns one row per month with that month's interest, principal, and end balance.
 *
 * Handles the zero-rate edge case (equal principal payments).
 * Returns an empty array if loanAmount <= 0 or termMonths <= 0.
 */
export function amortizationSchedule(
  loanAmount: number,
  monthlyRate: number,
  termMonths: number,
): AmortRow[] {
  if (loanAmount <= 0 || termMonths <= 0) return [];

  const payment =
    monthlyRate === 0
      ? loanAmount / termMonths
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  const rows: AmortRow[] = [];
  let balance = loanAmount;
  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: m, interest, principal, balance });
  }
  return rows;
}

/**
 * Computes lender-side unit economics for a single term loan over its life.
 * Returns all-zero results for non-positive loan amount or term.
 */
export function computeTermLoan(inputs: TermLoanInputs): TermLoanResults {
  const {
    loanAmount,
    aprPct,
    termMonths,
    originationFeePct,
    costOfFundsPct,
    servicingMonthly,
    annualLossRatePct,
    cac,
  } = inputs;

  if (loanAmount <= 0 || termMonths <= 0) return ZERO_RESULTS;

  const monthlyRate = aprPct / 100 / 12;
  const schedule = amortizationSchedule(loanAmount, monthlyRate, termMonths);

  // First row contains the monthly payment as interest + principal.
  const monthlyPayment =
    schedule.length > 0 ? schedule[0].interest + schedule[0].principal : 0;

  // Average outstanding balance = mean of start-of-month balances.
  // Month 1's start = loanAmount; subsequent months' start = previous month's end.
  let sumStartBalances = loanAmount;
  for (let i = 0; i < schedule.length - 1; i++) {
    sumStartBalances += schedule[i].balance;
  }
  const avgOutstandingBalance = sumStartBalances / termMonths;

  const totalPaid = monthlyPayment * termMonths;
  const totalInterestRevenue = totalPaid - loanAmount;
  const originationFeeRevenue = (loanAmount * originationFeePct) / 100;
  const yearsOnBook = termMonths / 12;
  const totalCostOfFunds =
    (costOfFundsPct / 100) * avgOutstandingBalance * yearsOnBook;
  const expectedLosses =
    (annualLossRatePct / 100) * avgOutstandingBalance * yearsOnBook;
  const totalServicing = servicingMonthly * termMonths;

  const totalRevenue = totalInterestRevenue + originationFeeRevenue;
  const totalCosts = totalCostOfFunds + expectedLosses + totalServicing + cac;
  const netProfit = totalRevenue - totalCosts;
  const roaPct =
    avgOutstandingBalance > 0 ? (netProfit / avgOutstandingBalance) * 100 : 0;

  return {
    monthlyPayment,
    totalInterestRevenue,
    originationFeeRevenue,
    avgOutstandingBalance,
    totalCostOfFunds,
    expectedLosses,
    totalServicing,
    totalRevenue,
    totalCosts,
    netProfit,
    roaPct,
  };
}
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: 0 errors, 0 warnings. Hints may stay at 12.

- [ ] **Step 3: Commit**

```bash
git add src/lib/term-loan.ts
git commit -m "feat(tools): add term-loan math module with amortization + unit economics"
```

---

### Task 2: Math correctness verification

**Files:** none

Math has to match the existing Google Sheet within $1 / 0.01% per the spec's success criterion 5. We verify by computing the default scenario by hand and confirming against the module's output.

- [ ] **Step 1: Write a one-shot verification script (do not commit)**

Create `/tmp/verify-term-loan.mjs` with:

```js
import { computeTermLoan } from '/Users/matthew/dev/Website/.claude/worktrees/astro-tailwind-migration/src/lib/term-loan.ts';

const r = computeTermLoan({
  loanAmount: 10000,
  aprPct: 18.0,
  termMonths: 36,
  originationFeePct: 3.0,
  costOfFundsPct: 5.5,
  servicingMonthly: 4.50,
  annualLossRatePct: 4.0,
  cac: 75,
});
console.log(JSON.stringify(r, null, 2));
```

Run it via `npx tsx /tmp/verify-term-loan.mjs` from the project root.

- [ ] **Step 2: Confirm the outputs against hand-calculation**

Expected (computed by hand from standard amortization for a $10,000 36-month loan at 18% APR):

| Field | Expected (approx) | Tolerance |
|---|---|---|
| `monthlyPayment` | ~$361.52 | ±$0.10 |
| `totalInterestRevenue` | ~$3,014.70 | ±$1 |
| `originationFeeRevenue` | $300.00 | ±$0.01 |
| `avgOutstandingBalance` | ~$5,200 | ±$10 |
| `totalCostOfFunds` | ~$858 | ±$5 |
| `expectedLosses` | ~$624 | ±$5 |
| `totalServicing` | $162.00 | exact |
| `netProfit` | ~$1,596 | ±$10 |
| `roaPct` | ~30.7% (per-loan, life-of-loan) | ±0.5% |

If any field is off by more than its tolerance, STOP and debug the math module before continuing.

- [ ] **Step 3: Delete the verification script**

```bash
rm /tmp/verify-term-loan.mjs
```

No commit needed for this task.

---

### Task 3: Update Tools section index intro

**Files:**
- Modify: `src/content/pages/tools/index.md`

- [ ] **Step 1: Replace the file's body with the richer intro**

```markdown
---
title: Tools
description: Interactive financial calculators for fintech founders.
section: tools
template: section-index
---

Open-source calculators for evaluating fintech product economics. Each tool computes a different dimension of a financial product — change the inputs, see the math respond.

All formulas are public; the underlying spreadsheet models live under [Models](/models/).
```

(Frontmatter is unchanged; only the body text is updated.)

- [ ] **Step 2: Commit**

```bash
git add src/content/pages/tools/index.md
git commit -m "content(tools): richer intro for the tools section index"
```

---

### Task 4: Term Loan calculator content page

**Files:**
- Create: `src/content/pages/tools/term-loan.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Term Loan Unit Economics
description: Model the profitability of a single fixed-term consumer loan from the lender's side — revenue, cost of funds, servicing, losses, and net profit per loan.
section: tools
template: tool
hideSidebar: true
---

## Modeling assumptions

* Loss rate is treated as a constant annual rate applied to average outstanding balance. Real-world charge-offs follow vintage curves — losses are heavier in months 6–24 — so this is a smoothed approximation.
* No prepayment modeling. The loan is assumed to run full term.
* CAC is treated as a one-time origination cost, not amortized over the life of the loan.
* All figures are nominal — no time-value-of-money discounting. To analyze NPV, IRR, or capital deployment, use the [full economics model](/models/term-loan/).
* ROA is computed per-loan over the life of the loan, not annualized. To compare loans of different terms, divide ROA by `term / 12`.

The underlying [Google Sheets model](/models/term-loan/) covers a broader portfolio view including portfolio-level revenue ramp, charge-off timing, and capital deployment.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/pages/tools/term-loan.md
git commit -m "content(tools): add term-loan calculator page with modeling caveats"
```

---

### Task 5: Bank Account stub page

**Files:**
- Create: `src/content/pages/tools/bank-account.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Bank Account Unit Economics
description: Model the profitability of a single deposit account — net interest income, servicing costs, fee revenue. Coming soon.
section: tools
template: tool
hideSidebar: true
---

## Coming soon

Interactive bank account unit economics is on the roadmap.

In the meantime, the [Google Sheets model](/models/bank-account/) covers the full bank account economics — net interest income on deposit balances, monthly servicing costs, fee revenue (interchange, overdraft, monthly fees), and balance dynamics across savings and debit accounts.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/pages/tools/bank-account.md
git commit -m "content(tools): add coming-soon stub for bank account calculator"
```

---

### Task 6: Credit Card stub page

**Files:**
- Create: `src/content/pages/tools/credit-card.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Credit Card Unit Economics
description: Model the profitability of a single credit card account — interchange, interest, late fees, cost of funds, losses. Coming soon.
section: tools
template: tool
hideSidebar: true
---

## Coming soon

Interactive credit card unit economics is on the roadmap.

In the meantime, the [Google Sheets model](/models/credit-card/) covers the full credit card economics — interchange revenue, interest income on revolving balances, fee income, cost of funds, expected losses, and rewards costs across credit and charge card products.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/pages/tools/credit-card.md
git commit -m "content(tools): add coming-soon stub for credit card calculator"
```

---

## Phase 2 — Preact UI components

### Task 7: `NumberField.tsx` input component

**Files:**
- Create: `src/components/tools/NumberField.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/tools/NumberField.tsx
//
// Labeled numeric input with right-aligned suffix (e.g. "$", "%", "months").
// Used by TermLoanCalculator and reusable for the upcoming calculators.
//
// Emits `number` for any valid finite input, `''` for cleared field.
// Validation (clamping to min/max, format checks) lives in the parent.

interface Props {
  label: string;
  id: string;
  value: number | '';
  onChange: (v: number | '') => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string | null;
}

export default function NumberField({
  label,
  id,
  value,
  onChange,
  suffix,
  min,
  max,
  step = 0.01,
  error,
}: Props) {
  const errorId = `${id}-error`;
  return (
    <div class="flex flex-col gap-1.5">
      <label for={id} class="text-sm font-medium text-ink">
        {label}
      </label>
      <div class="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === '' ? '' : String(value)}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            if (raw === '') {
              onChange('');
              return;
            }
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }}
          class="w-full px-3 py-2 pr-20 rounded-md border-2 border-rule bg-paper text-ink font-mono tabular-nums focus:outline-none focus:border-ink transition-colors"
        />
        {suffix && (
          <span class="absolute right-3 text-sm text-muted pointer-events-none font-mono">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} class="text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/NumberField.tsx
git commit -m "feat(tools): add NumberField Preact input component"
```

---

### Task 8: `ResultBlock.tsx` display component

**Files:**
- Create: `src/components/tools/ResultBlock.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/tools/ResultBlock.tsx
//
// Large display number with a small uppercase caption above. Used for hero
// results like "Net profit per loan" / "ROA". Color emphasis communicates
// positive/negative/neutral.

interface Props {
  label: string;
  value: string;
  emphasis?: 'positive' | 'negative' | 'neutral';
}

export default function ResultBlock({ label, value, emphasis = 'neutral' }: Props) {
  const colorClass =
    emphasis === 'positive'
      ? 'text-accent'
      : emphasis === 'negative'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-ink';

  return (
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-1.5">
        {label}
      </p>
      <p
        class={`font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] tabular-nums leading-[1.05] ${colorClass}`}
      >
        {value}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/ResultBlock.tsx
git commit -m "feat(tools): add ResultBlock display component"
```

---

### Task 9: `BreakdownRow.tsx` line-item component

**Files:**
- Create: `src/components/tools/BreakdownRow.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/tools/BreakdownRow.tsx
//
// One row in the per-loan breakdown table. Label on the left, formatted value
// on the right with optional +/- sign indicating revenue vs cost.

interface Props {
  label: string;
  value: string;
  sign?: '+' | '-' | '';
}

export default function BreakdownRow({ label, value, sign = '' }: Props) {
  const valueColor = sign === '-' ? 'text-muted' : 'text-ink';
  return (
    <div class="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span class="text-muted">{label}</span>
      <span class={`font-mono tabular-nums ${valueColor}`}>
        {sign && <span aria-hidden="true">{sign}&nbsp;</span>}
        {value}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/BreakdownRow.tsx
git commit -m "feat(tools): add BreakdownRow line-item component"
```

---

### Task 10: `TermLoanCalculator.tsx` main island

**Files:**
- Create: `src/components/tools/TermLoanCalculator.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/tools/TermLoanCalculator.tsx
//
// Preact island. Single state owner for all eight inputs; results derived via
// useMemo on every change. Two-column layout with sticky results on lg+.

import { useMemo, useState } from 'preact/hooks';
import NumberField from './NumberField';
import ResultBlock from './ResultBlock';
import BreakdownRow from './BreakdownRow';
import { computeTermLoan, type TermLoanInputs } from '../../lib/term-loan';

const DEFAULTS: TermLoanInputs = {
  loanAmount: 10000,
  aprPct: 18.0,
  termMonths: 36,
  originationFeePct: 3.0,
  costOfFundsPct: 5.5,
  servicingMonthly: 4.5,
  annualLossRatePct: 4.0,
  cac: 75,
};

const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtPct = (n: number) =>
  `${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;

export default function TermLoanCalculator() {
  const [inputs, setInputs] = useState<TermLoanInputs>(DEFAULTS);

  const results = useMemo(() => computeTermLoan(inputs), [inputs]);

  const update =
    <K extends keyof TermLoanInputs>(key: K) =>
    (v: number | '') => {
      setInputs((prev) => ({ ...prev, [key]: v === '' ? 0 : v }));
    };

  const reset = () => setInputs(DEFAULTS);

  return (
    <section class="mt-12 grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Inputs */}
      <form
        class="space-y-10"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Term loan unit economics inputs"
      >
        <fieldset class="space-y-4">
          <legend class="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3 w-full">
            Loan terms
          </legend>
          <NumberField
            id="loan-amount"
            label="Loan amount"
            value={inputs.loanAmount}
            onChange={update('loanAmount')}
            suffix="$"
            min={100}
            step={100}
          />
          <NumberField
            id="apr"
            label="APR"
            value={inputs.aprPct}
            onChange={update('aprPct')}
            suffix="%"
            min={0}
            max={100}
            step={0.1}
          />
          <NumberField
            id="term"
            label="Term"
            value={inputs.termMonths}
            onChange={update('termMonths')}
            suffix="months"
            min={1}
            max={360}
            step={1}
          />
          <NumberField
            id="orig-fee"
            label="Origination fee"
            value={inputs.originationFeePct}
            onChange={update('originationFeePct')}
            suffix="% of amount"
            min={0}
            max={10}
            step={0.25}
          />
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3 w-full">
            Lender economics
          </legend>
          <NumberField
            id="cof"
            label="Cost of funds"
            value={inputs.costOfFundsPct}
            onChange={update('costOfFundsPct')}
            suffix="% annual"
            min={0}
            max={25}
            step={0.1}
          />
          <NumberField
            id="servicing"
            label="Servicing cost"
            value={inputs.servicingMonthly}
            onChange={update('servicingMonthly')}
            suffix="$/month"
            min={0}
            step={0.5}
          />
          <NumberField
            id="loss-rate"
            label="Annual loss rate"
            value={inputs.annualLossRatePct}
            onChange={update('annualLossRatePct')}
            suffix="%"
            min={0}
            max={25}
            step={0.25}
          />
          <NumberField
            id="cac"
            label="CAC"
            value={inputs.cac}
            onChange={update('cac')}
            suffix="$ one-time"
            min={0}
            step={5}
          />
        </fieldset>

        <button
          type="button"
          onClick={reset}
          class="text-sm text-muted hover:text-accent underline decoration-1 decoration-[color:var(--color-rule)] underline-offset-[4px] hover:decoration-[color:var(--color-accent)] transition-colors"
        >
          Reset to defaults
        </button>
      </form>

      {/* Results */}
      <aside
        class="lg:sticky lg:top-24 lg:self-start"
        aria-live="polite"
        aria-atomic="false"
      >
        <div class="space-y-8 p-6 md:p-8 border-2 border-rule bg-surface rounded-lg">
          <ResultBlock
            label="Net profit per loan"
            value={fmtUsd(results.netProfit)}
            emphasis={results.netProfit >= 0 ? 'positive' : 'negative'}
          />
          <ResultBlock
            label="ROA · life-of-loan"
            value={fmtPct(results.roaPct)}
          />

          <div class="pt-6 border-t border-rule">
            <p class="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-3">
              Per-loan breakdown
            </p>
            <div class="divide-y divide-rule/60">
              <BreakdownRow label="Interest revenue" value={fmtUsd(results.totalInterestRevenue)} sign="+" />
              <BreakdownRow label="Origination revenue" value={fmtUsd(results.originationFeeRevenue)} sign="+" />
              <BreakdownRow label="Cost of funds" value={fmtUsd(results.totalCostOfFunds)} sign="-" />
              <BreakdownRow label="Expected losses" value={fmtUsd(results.expectedLosses)} sign="-" />
              <BreakdownRow label="Servicing" value={fmtUsd(results.totalServicing)} sign="-" />
              <BreakdownRow label="CAC" value={fmtUsd(inputs.cac)} sign="-" />
            </div>
          </div>

          <div class="pt-6 border-t border-rule">
            <p class="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-3">
              Borrower side
            </p>
            <div class="divide-y divide-rule/60">
              <BreakdownRow label="Monthly payment" value={fmtUsd(results.monthlyPayment)} />
              <BreakdownRow label="Avg outstanding" value={fmtUsd(results.avgOutstandingBalance)} />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: 0 errors. (Hints may stay at 12 — those are pre-existing Zod-deprecation noise.)

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/TermLoanCalculator.tsx
git commit -m "feat(tools): add TermLoanCalculator Preact island"
```

---

## Phase 3 — Layout + routing integration

### Task 11: Add `<slot name="tool" />` to `ToolLayout`

**Files:**
- Modify: `src/layouts/ToolLayout.astro`

- [ ] **Step 1: Read the current `ToolLayout.astro`**

Open the file. It currently has this `<main>` body:

```astro
  <main id="main" class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
    <Breadcrumbs crumbs={crumbs} />
    <h1 class="mt-4 font-display text-4xl md:text-6xl font-bold tracking-[-0.025em] text-ink leading-[1.05]">
      {title}
    </h1>
    {description && (
      <p class="mt-5 text-lg text-ink/80 max-w-prose leading-relaxed">{description}</p>
    )}

    <div class="mt-10">
      <Prose>
        <slot />
      </Prose>
    </div>
  </main>
```

- [ ] **Step 2: Replace the `<main>` body to inject a named tool slot**

```astro
  <main id="main" class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
    <Breadcrumbs crumbs={crumbs} />
    <h1 class="mt-4 font-display text-4xl md:text-6xl font-bold tracking-[-0.025em] text-ink leading-[1.05]">
      {title}
    </h1>
    {description && (
      <p class="mt-5 text-lg text-ink/80 max-w-prose leading-relaxed">{description}</p>
    )}

    {/* Mount point for interactive tool islands. Filled by the dynamic
        router for specific slugs (e.g. tools/term-loan); empty for stubs. */}
    <slot name="tool" />

    <div class="mt-12">
      <Prose>
        <slot />
      </Prose>
    </div>
  </main>
```

The only changes: insert `<slot name="tool" />` and bump the prose-wrapper margin from `mt-10` to `mt-12`.

- [ ] **Step 3: Type-check + build**

```bash
npm run check && npm run build
```

Expected: 0 errors. Build produces 21 pages (the 18 existing + 3 new tool pages).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ToolLayout.astro
git commit -m "feat(layout): add named tool slot to ToolLayout"
```

---

### Task 12: Mount `TermLoanCalculator` from the dynamic router

**Files:**
- Modify: `src/pages/[...slug].astro`

- [ ] **Step 1: Read the current file**

Open `src/pages/[...slug].astro`. Note the imports near the top and the `template === 'tool'` block.

- [ ] **Step 2: Add the calculator import near the other layout imports**

```astro
import TermLoanCalculator from '../components/tools/TermLoanCalculator';
```

- [ ] **Step 3: Compute an entry-slug local that's easier to match against**

Right after `const data = entry.data;` and `const template = data.template ?? 'article';`, add:

```astro
const entrySlug = entry.id.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
```

- [ ] **Step 4: Mount the calculator inside the `template === 'tool'` branch**

Replace the existing tool branch:

```astro
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
```

with:

```astro
{template === 'tool' && (
  <ToolLayout
    title={data.title}
    description={data.description}
    section={data.section}
    ogImage={data.ogImage}
  >
    {entrySlug === 'tools/term-loan' && (
      <TermLoanCalculator client:load slot="tool" />
    )}
    <Content />
  </ToolLayout>
)}
```

The slug map is hardcoded (one calculator only). When Bank Account and Credit Card calculators ship, this conditional grows; abstracting to a map happens in their spec.

- [ ] **Step 5: Type-check + build**

```bash
npm run check && npm run build
```

Expected: 0 errors. Build succeeds. Pagefind indexes 21 pages.

- [ ] **Step 6: Commit**

```bash
git add src/pages/[...slug].astro
git commit -m "feat(routing): mount TermLoanCalculator for the tools/term-loan slug"
```

---

## Phase 4 — Verification

### Task 13: Functional smoke test

**Files:** none

- [ ] **Step 1: Start preview server**

```bash
npm run preview > /tmp/prev.log 2>&1 &
sleep 4
PORT=$(grep -oE 'localhost:[0-9]+' /tmp/prev.log | head -1 | cut -d: -f2)
echo "Preview on port $PORT"
```

- [ ] **Step 2: Confirm all three tool URLs return 200**

```bash
for path in /tools/ /tools/term-loan/ /tools/bank-account/ /tools/credit-card/; do
  rc=$(/usr/bin/curl -sI -o /dev/null -w '%{http_code}' "http://localhost:$PORT$path")
  echo "  $rc  $path"
done
```

Expected: all four return `200`.

- [ ] **Step 3: Confirm the Tools index lists all three calculators**

```bash
/usr/bin/curl -s "http://localhost:$PORT/tools/" | /usr/bin/grep -oE 'Term Loan Unit Economics|Bank Account Unit Economics|Credit Card Unit Economics'
```

Expected output: three lines, one per calculator name.

- [ ] **Step 4: Confirm the calculator island markup ships on the term-loan page**

```bash
/usr/bin/curl -s "http://localhost:$PORT/tools/term-loan/" | /usr/bin/grep -oE 'TermLoanCalculator|astro-island|Loan amount|Net profit per loan' | sort -u
```

Expected: lines including `astro-island`, `Loan amount`, `Net profit per loan` (the SSR'd default content of the island).

- [ ] **Step 5: Confirm stub pages render their coming-soon prose**

```bash
/usr/bin/curl -s "http://localhost:$PORT/tools/bank-account/" | /usr/bin/grep -oE 'Coming soon|Google Sheets model'
/usr/bin/curl -s "http://localhost:$PORT/tools/credit-card/" | /usr/bin/grep -oE 'Coming soon|Google Sheets model'
```

Expected: each command emits at least the "Coming soon" line and the "Google Sheets model" link text.

- [ ] **Step 6: Stop preview server**

```bash
pkill -f "astro preview" 2>/dev/null
wait 2>/dev/null
```

No commit needed for this task.

---

### Task 14: Manual visual check + push

**Files:** none

- [ ] **Step 1: Run `npm run dev` and open the calculator in your browser**

```bash
npm run dev
```

In the browser at `http://localhost:4321/tools/term-loan/`:

- Default inputs are populated.
- Net profit shows a positive number (~$1,596 at defaults).
- ROA shows ~30.7% (life-of-loan).
- Monthly payment shows ~$361.52.
- Editing any field updates the results within one frame.
- Reset button restores defaults.
- Layout is two-column on wide viewports, stacked on narrow viewports.
- Toggle dark mode (header button) — all numbers and inputs remain legible.
- No console errors.

Then visit `/tools/`, `/tools/bank-account/`, `/tools/credit-card/` and confirm they render with the coming-soon copy.

Stop the dev server when done.

- [ ] **Step 2: Push the branch**

```bash
git push origin redesign
```

- [ ] **Step 3: Confirm Cloudflare Pages build succeeded**

After ~60 seconds:

```bash
gh pr view 21 --json statusCheckRollup | /usr/bin/python3 -c "import sys, json; d=json.loads(sys.stdin.read()); [print(c.get('name','?'), '->', c.get('conclusion','?') or c.get('status','?')) for c in d.get('statusCheckRollup',[])]"
```

Expected: `Cloudflare Pages -> SUCCESS`.

- [ ] **Step 4: Test the calculator on the preview deploy**

```bash
/usr/bin/curl -sI https://redesign.notafintech.pages.dev/tools/term-loan/ | /usr/bin/awk 'NR==1'
```

Expected: `HTTP/2 200`.

Open the URL in a browser and confirm the calculator hydrates and is interactive on the live preview.

No commit needed for this task.

---

## Out-of-band notes

### What's intentionally NOT here

- **No unit-test framework added.** Math correctness is verified once in Task 2 against hand-calculated values. If the math needs more rigor later, a vitest-based test suite belongs in its own spec.
- **No URL state encoding** for shareable scenarios. Deferred.
- **No localStorage persistence** of last-used inputs. Deferred.
- **No charts.** All output is text.
- **No abstraction across calculators.** When the next two calculators ship, the dynamic router's `entrySlug === 'tools/term-loan'` will grow to a `switch` or a slug-to-component map; that refactor belongs in the spec that adds the second calculator (avoids designing for two when we have one).

### Risks tracked

| Risk | Mitigation |
|---|---|
| Math output differs from the Google Sheet's model | Task 2 verifies hand-calc; spec's tolerance is $1 / 0.01% |
| Live updating feels janky | `useMemo` runs once per input change in <100µs; safe |
| ToolLayout slot change breaks Model pages (which also use ToolLayout via copy) | They use ModelLayout, not ToolLayout — separate file, unaffected |
| `client:load` hydration delays first paint | Preact + Astro paint the SSR'd default state immediately; hydration only enables interactivity. No layout shift. |
| Stub pages confuse search / Pagefind | Pagefind indexes them — the "Coming soon" content is useful as a search hit pointing users to the Sheets model |
