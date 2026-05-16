---
title: Credit Card Unit Economics
description: Model the profitability of a single credit card account — interchange, interest, late fees, cost of funds, losses. Coming soon.
section: tools
template: tool
hideSidebar: true
publishedAt: 2026-05-15
updatedAt: 2026-05-16
---

## Coming soon

An interactive calculator for credit card unit economics is on the roadmap. The eventual tool will let you stress-test a single account across the levers that actually move portfolio profitability.

## What this tool will model

Credit card economics are deceptively layered: revenue arrives from at least four streams (interchange, interest, late fees, annual fees) while costs accumulate across funding, losses, rewards, and servicing. A small change in **revolve rate** or **net charge-off rate** can flip an account from profitable to underwater.

Inputs will include:

* Average outstanding balance and revolve rate (% of balance carrying month-to-month vs. paid in full)
* APR and effective annual yield on revolving balances
* Net interchange rate (after rewards funding cost)
* Annual fee and late fee revenue per account
* Annual gross charge-off rate and recovery rate
* Cost of funds — the rate at which you fund the receivable
* Rewards earn rate and redemption cost
* Per-account servicing cost — issuance, fraud, customer support, compliance

Outputs will surface per-account annual revenue, fully-loaded cost, **net profit per account**, **breakeven revolve rate**, and sensitivity to the two biggest swing factors: charge-offs and cost of funds.

## Use the full model in the meantime

The [Google Sheets credit card model](/models/credit-card/) covers the same economics with broader portfolio assumptions including charge card economics (no revolve, interchange-only revenue) and the revenue ramp across a portfolio's first 24 months.
