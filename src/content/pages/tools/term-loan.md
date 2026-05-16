---
title: Term Loan Unit Economics
description: Model the profitability of a single fixed-term consumer loan from the lender's side — revenue, cost of funds, servicing, losses, and net profit per loan.
section: tools
template: tool
hideSidebar: true
publishedAt: 2026-05-15
updatedAt: 2026-05-16
---

## Modeling assumptions

* Loss rate is treated as a constant annual rate applied to average outstanding balance. Real-world charge-offs follow vintage curves — losses are heavier in months 6–24 — so this is a smoothed approximation.
* No prepayment modeling. The loan is assumed to run full term.
* CAC is treated as a one-time origination cost, not amortized over the life of the loan.
* All figures are nominal — no time-value-of-money discounting. To analyze NPV, IRR, or capital deployment, use the [full economics model](/models/term-loan/).
* ROA is computed per-loan over the life of the loan, not annualized. To compare loans of different terms, divide ROA by `term / 12`.

The underlying [Google Sheets model](/models/term-loan/) covers a broader portfolio view including portfolio-level revenue ramp, charge-off timing, and capital deployment.
