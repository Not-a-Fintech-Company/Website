---
title: How to launch a card product?
---

# Introduction

> "Only trillion dollar industry where nothing is written down" - T.P.

Welcome to the wild world of card issuing. With 100s of millions of cards issued in the US and more internationally, its one of the most ubiquitous products around, but also incredibly complex.  The industry operates on the shoulders of giants who have existed for decades and I suggest for those looking for history of cards to read one of the fabulous books that have been written previously on the topic.  This goal of this guide is to provide tactical and strategic advice in how to bring a card to market.

One of the hardest parts of bringing a card to market is solving for each businesses unique order of operations to bring all disparate components together.  That includes bank partners, networks, technology vendors, marketing assets and plans, risk and servicing organizations, compliance programs, debt funding, and more all at once to launch a card.  While some of these pieces can be built in-house, others are much better solved via partnerships, and ultimately take time and money to pull off expediently.  Additionally not all components can be brought onboard in parallel, but need to happen serially. All of this is to say that bringing a card to market is a task with many branching codependent processes.

## Table of Contents

- [Product](#product)
- [Technology](#technology)
- [Compliance](#compliance)
- [Risk](#risk)
  - Fraud
  - Credit Underwriting
- [Debt & Capital Requirements](#debt--capital-requirements)
- [Banks](#banks)
- [Networks](#networks)
  - Majors
  - Debit
- [Servicing](#servicing)
- [Marketing](#marketing)
- [Resources](#resources)

# Product

Defining the card product you want to launch is the first important decision you will need to make in order bring a product to market.  Some features only apply to certain product types (i.e. APR for credit cards), while others apply across all card types.  There are numerous decisions in what it takes to launch a card product, more than can be explicitly written out, so a non-exhaustive list is included below with some definitions. 

## Card Product Decisions

|   Name   | Examples     | Questions to be answered     |
| ---- | ---- | ---- |
|  Card Type    | Credit, Debit, Prepaid, Charge     | What type of underlying product are you offering?     |
|  Fee Structure    | Monthly/Annual, FX, Disbursement, Fee, APR     | What fees or interest rates are you charging your customers for using your product? |
|  Card Design    | What branding will go on the physical card     | What will the card and packaging look like? |
|  Network Partner    | Visa, Mastercard, Amex, Discover     | What major network will you ride? |
|  Alternative Network    | Maestro, Interlink, Star, AllPoint     | For debit cards a secondary network is necessary for ATM and PIN transactions, per regulations |
|  Rewards    | Will the card have a rewards program for use of the card?     | Money Printer goes BRRRR |
|  Additional Features    | Pay, Virtual Cards, P2P, Remote Deposit Capture, Early Direct Deposit     | Is there anything else you want to enable on your product? |

Depending on the product decisions one makes, will impact the documentation and product features presented to the users.  

# Technology

When it comes to the technology side of the industry, modernization is always about 10 years behind, if that, but luckily there are many different ways to compose the technology stack to bring your product to market.  

## Issuing systems

| Name                     | Description                                                  | Examples                                                     |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Pass-thru Gateway        | Provides single or multiple network access points via one access point, but almost no other services | FIS, Fiserv, STAR, DPS                                            |
| Issuing Gateway          | Authorizes and settles transactions, and manage card states, but typically doesn't include core banking and payments. Originally built to sit on top of Core Banking Systems | Marqeta, Stripe                                              |
| Core Processor           | Connects to the network, authorizes and settles transactions, processes payments, and handles all core accounting requirements | Galileo, CoreCard, i2c, Privacy.com, DPS                          |
| Core Banking             | Not connected to the network, but able to handle all account and accounting requirements.  With a issuing gateway on top it's how many banks initially brought debit cards to market | Profile, Phoenix, Finacle, Finxact                           |
| General Service Provider | Bundles together core processing with bank relationship and servicing organization. Ala carte pricing on top of basic relationship | Deserve, Cardworks, TCW, Unit, Synapse, Treasury Prime, Cascade |

# Compliance

An alphabet soup of regulations apply to any product you may want to launch, but given the work of countless others its easier now than ever.

### Primary Documents

- Cardholder agreement - [CFPB template Card Agreement](https://www.consumerfinance.gov/data-research/credit-card-data/know-you-owe-credit-cards/)
- Privacy Policy
- Terms of Service
- Schedule of Fees - debit
- [Schumer Box - credit](https://en.wikipedia.org/wiki/Schumer_box)
- Annual privacy notice
- Data sharing / marketing agreement

### Regulations

Here is a non-exhaustive list of regulations that need to be addressed as one builds and launches a card program:

* [Truth in Lending Act / Reg Z](https://en.wikipedia.org/wiki/Truth_in_Lending_Act)
* [Truth in Savings Act / Reg DD](https://en.wikipedia.org/wiki/Truth_in_Savings_Act)
* [Fair Credit Reporting Act](https://en.wikipedia.org/wiki/Fair_Credit_Reporting_Act)
* [Fair Debt Collection Practices Act](https://en.wikipedia.org/wiki/Fair_Debt_Collection_Practices_Act)
* [Equal Credit Opportunity Act / Reg B](https://en.wikipedia.org/wiki/Equal_Credit_Opportunity_Act)
* [Card Act](https://en.wikipedia.org/wiki/Credit_CARD_Act_of_2009)
* [Dodd-Frank as applies to UDAAP](https://en.wikipedia.org/wiki/Dodd%E2%80%93Frank_Wall_Street_Reform_and_Consumer_Protection_Act)

# Risk

One of the most complex and key components of running any program is understanding and managing risk. This needs to be considered continuously during a live program, and also analyzed at critical points of customer interactions lifecycle.

## Customer lifecycle events

- On-boarding & Marketing channels
- Application
- Account Activation
- Card Activation
- Transaction Usage
- Customer Service Interactions

## Fraud

### Identity

There are many types of identity theft: stolen, family, synthetic, and **more.**  Each has its own patterns for how it manifests itselfs for your product.

### Transactional

Transactional fraud refers to fraud that occurs at spend time.  It has the potential for a large custoemr impact as if fraud is suspected and an account blocked temporarily while investigaged, it prevents the user from being able use one of the primary features of the proudct.

There are constantly evolving patterns of transactional fraud, and the controls necessary to prevent it require heuristics around spend patterns, spend velocity, account age, as well as leveraging models built around overall fraud trends per MCC and Merchant.

Some of the controls you would configure include things like:
* Transactions in last 5 minutes
* Transactions in last N hours
* Amount spent in last N hours
* Amount spent at merchant across all accounts
* Spend threshold based upon age of account
* Spend thresholding based upon type of transaction (e.g., ATM, POS, Originated ACH Debit, etc.)

Upon crossing any control threshold, or triggering any hard flags, there are a few ways to handle an account. Primarily these consist of a allowlist, blocklist, and graylist, with other subtleties around soft blocking versus hard blocking.


### Account Takeover

## Credit

### Underwriting

### Collections

# Debt & Capital Requirements

For credit programs, debt is what will fuel your ability to grow.  The business will require different tiers of capital at different price points/costs of funds as it scales.  See Rohit's blog post for a strong outline of one path to scaling debt capital: [https://mittalrohit.com/lessons-in-raising-debt-capital-for-lending-company-founders-7caececc34c](https://mittalrohit.com/lessons-in-raising-debt-capital-for-lending-company-founders-7caececc34c)

> For revolving credit programs, a heuristic that is useful in figuring out what percentage of your customers and receivable will be revolving, and using that as a multiple of your APR to find your break even point on your debt.   
>
> So if your cost of funds is 8% and 15% of your customers revolve monthly, that ends of up being roughly 30% of your receivables at the end of the month.  This leads you to an approximate cost of funds of 26.67%. While not an exact number, this is an approximate APR where you will break even on the portfolio at large.
>

# Banks

Choosing a bank partner is the most critical of all partnership decisions.   A lot of the advice can be boiled down to a piece of advice from an unnamed industry veteran: "if this is how they are when you're dating, then imagine how it will be once you're married."   A separate guide for this exists [here](/guides/how-to-select-a-bank-partner).

# Networks

## Major Networks

Issuing cards is dominated by two players at the network level, Visa and Mastercard.  Choosing a network is a dependent on a bunch of variables including bank partner membership, processor network integrations, card printer certifications, and cobranded volume incentives.

Currently the major differences between the two networks are laid out below in a simple pro/cons list.

| Network    | Pros                               | Cons                        |
| ---------- | ---------------------------------- | --------------------------- |
| Visa       | Higher Acceptance (Notably Costco) | Typically Lower Interchange |
| Mastercard | Typically Higher Interchange       | Lower Acceptance            |

## Other Networks

### Closed Loop

In recent years, both the alternative major networks, American Express (Amex) and Discover, have started to enable others to issue cards on top of their networks.  For them this brings in more network revenue due to the increased transaction volume, and some additional fees. While both typically charge higher interchange rates to merchants, beware that both Amex and Discover do not have as high merchant acceptance rates as the other two major networks, Visa and Mastercard.

Besides acceptance, the one main drawback of these two networks is customer perception. Given their long histories and massive marketing spends on brand, each is thought of as a standalone card issuer, so some customer confusion, and also brand perception issues may be encountered. 

### Debit and ATM Networks

While not a major differentiator anymore, debit networks are a requirement for all debit cards issued inside the US due to the Durbin Amendment. For most major banks in the US, dual routing (the Durbin Requirement) is usually done by the major networks wholly owned debit networks (Visa -> Interlink, Mastercard -> Maestro).  For NeoBanks, a common ATM network provider is AllPoint, which is provides \~40,000 ATMs throught the us.  There are other Interbank or Pin Debit networks that proivde ATM access and a list can be found on the this Wikipedia [page](https://en.wikipedia.org/wiki/Interbank_network#United_States).

# Servicing

The servicing segment of the business consists primarily of 2 major components. The self service capabilities provided to consumers (Mobile, Web and Phone), and the back office servicing organization that runs the operations for the business.

## Self Service

The goal of self-service is to provide customers the ability to access account information and perform certain transactions without the need to interact with back office personnel. This keeps the cost of servicing low and allows consumers to be self sufficient in getting the information they need without human interaction. This information and transactions are relatively low-risk, typically:

* Initial sign-up and application
* Balance inquiry
* Recent transaction list
* Statement retrieval
* Make account payment (for credit)
* Transfer funds to/from accounts (primarily for deposit accounts)
* Display Account Detail (APY/APR, minimum payment, last payment, account/routing numbers, etc.)
* ATM Locator

Higher risk transactions, such as changing customer address, and lower frequency transactions, such as dispute handling, are typically best handled through direct contact with back office staff.

## Back Office

The back office component of servicing nowadays includes everything from email to text to live phone agent to IVR.  When managing a servicing organiziation for a card product, its important to understand and drive customer interaction patterns to the most efficient means of resolution. Card businesses work hard to ensure that their economies of scale don't break down at scale by having too many costly customer interaction touchpoints.  This is why for a long time, and even today, IVR dominates a lot of initial customer inquiry calls to reduce the cost to the organziation.  *Nowadays focusing on making useful and highly functional self service applications is a high priority as it drives customer happiness and also keeps cost low for the business*.

There is a laundry list of the things a back office might need to accomplish for the customer, a abridged list is below of the incidents that might need to be handled, and one goal of this project is to include a procedure manual for each of them.

* Account Balance Inquiry
* Close Account Request
* Credit Limit Increase
* Change Address Request
* Change Name Request
* Change Phone Number Request
* New Card Request
* Report Lost Card
* Account Locked Request
* Fraud Report Request
* Application Followup Inquiry
* General Product Inquiry (non-customer)
* Fee Waiver Request
* Interest Calculation Questions
* Report Unauthorized Transaction
* Change PIN Request
* Statement Error Inquiry

# Marketing

Finding product marketing fit is never easy in this industry. With incumbents having 100s of millions of dollars at their disposal for acquisition, its always an uphill battle to break through the noise, so focusing on niches and truely understanding your customer acquisition cost are key.


ToDos
* Notes on marketing and making sure to not run afoul of UDAAP & FTC

# Resources

* [Bank Account Model](/models/bank-account) - Supports debit card as well
* [Credit Card Model](/models/credit-card) - Supports charge card as well
