---
title: Bank Account Unit Economics
description: Model the profitability of a single deposit account — net interest income, servicing costs, fee revenue. Coming soon.
section: tools
template: tool
hideSidebar: true
publishedAt: 2026-05-15
updatedAt: 2026-05-16
---

## Coming soon

An interactive calculator for deposit account unit economics is on the roadmap. The eventual tool will let you stress-test a single account from the issuer's side.

## What this tool will model

Bank account economics turn on three numbers most decks gloss over: the **yield the bank earns on the deposit balance**, the **fee and interchange revenue per active month**, and the **fully-loaded servicing cost per account**. Get those three right and the rest is arithmetic.

Inputs will include:

* Average deposit balance per account
* Yield earned on deposits (typically Fed funds or a short-duration asset yield)
* APY paid to the customer, if any
* Debit interchange revenue (transactions/month × average ticket × interchange rate)
* Monthly account fees and overdraft revenue
* Per-account servicing cost — card issuance, fraud, customer support, compliance, hosting

Outputs will surface per-account annual revenue, fully-loaded cost, net profit, and the **breakeven balance threshold** below which the account is unprofitable. Once you know that breakeven, you can reason about who you're actually trying to acquire.

## Use the full model in the meantime

The [Google Sheets bank account model](/models/bank-account/) covers the same economics at portfolio scale, including balance dynamics across savings and debit accounts and the impact of inactive accounts on blended profitability.
