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
