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
