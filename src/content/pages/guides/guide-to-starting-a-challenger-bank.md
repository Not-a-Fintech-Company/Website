---
title: Guide to starting a challenger bank
description: A comprehensive guide covering processors, bank partners, card partners, and product features for challenger banks.
---

## Table of Contents

1. [Components of a Challenger Bank](#the-components-of-a-challenger-bank)
1. [Working with a processor](#working-with-a-processor)
1. [Working with a bank partner](#working-with-a-bank-partner)
1. [Working with a card partner](#working-with-a-card-partner)
1. [Product Features](#product-features)
1. [Glossary](#glossary-of-terms)

## The components of a challenger bank

Challenger banks operate on many of the same principles and architecture as store credit cards. Much like Macy's, a challenger bank is a marketer of financial products.

In industry speak, a challenger bank is an "agent of the bank" or a "marketer". If the challenger bank in question is marketing a card product (ie. a Visa or Mastercard), and is contracted directly with the issuing bank, they are often referred to as a "program manager".

**In order to issue network-branded cards to customers, you will need the following partners:**

1. **Issuing bank** - in the US, only regulated financial institutions are licensed to issue Visa and Mastercard products (although there has been a decades long conversation about amending this rule)
2. **Card network** - challenger banks will typically sign an incentive agreement with Visa or Mastercard. This agreement provides a framework for using their respective trademarks as well as financial incentives to be used towards marketing your program.
3. **Issuer Processor** - think of your issuer processor as a node within the card networks. When a card is used, the merchant processor sends an authorization request to the card network, who in turn routes that request through to the processor. From there, the processor or the program manager authorizes or declines the transaction. I will outline the architecture further below.
4. **Card Provider (aka. Card manufacturer, emboss partner, perso facility)** - The card provider is licensed by the networks to manufacture cards in bulk and then personalize and ship them as they are ordered by cardholders.

## Working with a processor

Choosing your issuer processor is the most critical decision you will make about the architecture of your program. The processor is your primary technical integration and depending on your architecture will inherit some or all of their constraints. It is more difficult to switch your processor than it is to swap out any of the other partners listed above.

One of the first architecture decisions you will make is whether you, or your processor, will be the source of truth when it comes to customer balances. Said another way, "who manages the ledger?"

For most processors, the default setup is to manage the ledger for you. However, as more program managers choose to manage their own ledger, processors are adjusting their offerings.

When the program manages the ledger, you will hear this referred to as "being in the auth stream", or, "just in time funding". This simply means that the processor will route an authorization decision to you for response, instead of managing the ledger themselves.

### Here are some questions to ask a processor during the first few calls:

1. Which banks are they already integrated with? Are any programs live? Do those programs have similar requirements to yours (ie. is it just for card transactions, or do they also process ACH receiving and originating with that bank)
2. Is their pricing based on transactions or a share of interchange?
3. Which emboss partners are they integrated with for the card profile you are considering? *Note: The card profile is the specific configuration of the card you are issuing. It is the combination of network, product type (credit, debit, prepaid), chip used, and whether it is dual interface (contact and contactless) or not. In my experience it is unlikely that your processor and emboss partner have a product already encoded that meets your needs.  Even if they do, they will still need to perform a key exchange in order to get you set up.  This will take 4-6 weeks.*
4. Can you contract with your own KYC/AML vendor, or are you required to do this via the processor/their partner?

### Setup/Configuration

Your processor will have a list of configuration options that are largely static through the life of your card program. Most of these are related to the card limits (or "velocity"). Think of these as the high water mark for how you will allow customers to use your product. I recommend the following:

1. Get the list of configuration options/parameters from your processor
2. Review the card limits of a similar program. These are usually publicly available on their website. You've probably signed up for a bunch of similar programs by now so it should be easy to find.
3. Propose a set of limits that make sense for your target customer
4. When presenting your proposed limits, ask the processor and bank partner if there are any choices that would require additional levels of approval. Partner banks will usually have a card spend threshold, total balance threshold, etc. that requires board review and approval.  You want to avoid this where possible.

### Core Features

#### Card transaction processing

Each program is identified by a Bank Identification Number (BIN). This is the first 6-8 digits of all cards issued by your program. Furthermore, each card network can be identified by the first number (4 = Visa, 5 = Mastercard, 37 = AMEX, and so on). For example, Chase Sapphire cards start with 414720. That tells the merchant processor to send the transaction to the Visa network, who then recognizes the card as belonging to Chase Sapphire, and sends the transaction to Chase's processing system for an authorization decision.

#### Card management

This includes APIs and IVR (automated phone system) support for card activation, PIN-set / re-set, card locking, and re-issuing cards.

#### Card tokenization

This is primarily used for tokenizing PANs for use with digital wallets such as Apple Pay, Google Pay, and Samsung Pay.

#### ACH processing

There are four types of ACH transactions that you may need to handle for your customers.

1. ACH receiving
    1. Credits: Direct deposit of a pay check or from a payments processor
    2. Debit: A pre-authorized debit for your car payment
2. ACH originating
    1. Credit: using a third-party's  routing number and account number to send them funds
    2. Debit: using a third-party's  routing number and account number to withdraw funds from their account.  This is a fairly specialized and rare use case when it comes to program managers. Many partner banks will not originate ACH debits.

#### Customer Support

**IVR (Interactive Voice Response)**

Your processor will include their IVR service as part of your overall agreement. You will be able to customize the script, options, and customer journeys to your liking.

**Live customer support**

Your processor can provide live customer support by phone for your customers. I wouldn't recommend using this service except in circumstances where you require 24-hour live call centre staffing. Your customers will use a number of channels to interact with your team, and not all support cases will be specific to an individual customer account. Separating support duties between your own staff and your processors call centre will make the customer experience feel janky.

**Dispute resolution**

The notable exception to the above is if you want to use your processor to handle live customer enquiries and correspondence related to the filing and execution of transaction disputes. Still, I would recommend making most of this process asynchronous for your customer by encouraging them to file disputes and correspond with your team from within the app.

#### Risk and Fraud Support

1. Risk monitoring
    1. negative balance
2. Fraud detection
    1. Card transactions
        1. Networks have a scoring mechanism
    2. ACH receiving
        1. primarily name matching

#### Bill pay

1. Mastercard RPPS database

### Pricing

1. Per transaction pricing or interchange revenue share model
2. New account and/or monthly active account fee

Monthly minimums scaling from $5k-$25k over the first 36 months of your contract. Contract term of 3-5 years depending on your negotiating leverage.

## Working with a bank partner

### Setup

The growth and maturity of challenger banking means that most partner banks have experience with at least one wildly successful program manager. Each new program manager's potential is being measured against the Chime's and Square's of the world. The bank is investing scarce resources with each new partnership so you need to approach the conversation in the same way you approach investors.

#### Diligence

The bank will want to understand who you are, how fast you intend to grow, and why that's feasible (unique value + money in the bank). They will of course request your identification and information about the beneficial owners of your business.

#### Program Limits

The fraud risk associated with a program is partly determined by how much money flows through the system. What is the total balance you will allow customers to hold? What is their daily transaction limit? and so on. Your processor will provide a list of configuration options broken up into rolling periods (ie. 30 days) or day/week/month/year. The bank will use that information as part of their overall risk assessment for your program.

### Compliance

Most banks will ask a program manager to have a dedicated compliance officer with a history of successful compliance program management. It is possible to hire a consultant for this role.

#### Most relevant regulations

1. Reg E
2. Patriot Act Statement
3. Bank Secrecy Act
4. FinCen final rule on beneficial ownership (in the case of a program manager servicing legal entities)

#### Compliance Processes to outline

1. notifying the bank about customer complaints filed through regulatory bodies as well as any contact from regulatory bodies or law enforcement
2. clearing sanctions list hits that false-positives
3. filing suspicious activity reports (SARs)

#### Risk Policies

1. How do you segment accounts by risk profile
2. How do you assess the risk of individual transactions
3. How do you monitor for account takeover

#### Additional Policies and Procedures

1. AML training
2. Information security
3. Physical security

### Data sharing

In most circumstances you will not have a real-time technology interface with the bank. Most banks consume information from you and your processor as batch files via SFTP.

#### Transaction Data

Transaction data will come from your processor. This will arrive as a flat file, which contains aggregate money movement instructions, as well as the raw data which the bank can use to run their own risk checks.

For example, if a program issues a Visa card, and cardholders make $1000 in purchases today, the bank would see this and move $1000 from the Cardholder Funds Account to a Visa settlement account.

ACH and surcharge-free ATM network transaction data flows the same way. The program manager or processor sends a batch file, which then triggers money movement and compliance/risk procedures inside the bank.

#### Customer Data

In most cases you will share customer data directly with the bank.

### Funds Flow

The first thing to note is that your bank partner will not be setting up accounts for each of your individual customers. Customer balances will be held in a "Cardholder Funds Account" (aka. pooled funds account) that is *for the benefit of* (FBO) your cardholders. This account will hold the total sum of all available customer balances, although in more advanced architectures you can fund these balances "just in time", meaning that you can sweep funds to a separate interest bearing account at another institution.

In this setup, cardholders will still have access to a routing number and unique account number which can be used for direct deposit. The account number is set by your processor, and much like a BIN, will have a unique first few digits that correspond to your program. This way, the bank can easily route incoming funds to your cardholder funds account

### Deal Terms

#### Pricing

Your bank partner will want to be compensated using a combination of interchange revenue share, per transaction fees, and interest collected on deposits. In most cases, you can keep 100% of the interchange revenue but your bank partner won't pay interest on deposits. The bank will then charge a per transaction fee between $0.04-$0.09 per transaction (any money movement, including deposits, card spend, ACH's, etc.), with the low end corresponding to large volumes (hundreds of thousands of transactions per month).

The bank will also seek an implementation fee of about $25,000, and a minimum monthly fee scaling from about $10,000 to $50,000 over the first 36 months of your program. At $0.05 per transaction a challenger bank would need a run rate of 1,000,000 transactions per month to hit the $50k minimum. It's a volume game.

In addition, the bank may require that you pay monthly fees for compliance, audits, and other administrative tasks associated with the ongoing maintenance of your program. Some of these will be pass-through fees from the card network for everything from annual BIN fee (~$5k) to BIN change fees (ie. enable tokenization for digital wallets).

#### Program Manager Revenue

When a program manager collects 100% of the interchange revenue from the issuing bank, that means that they receive exactly what is outlined by [Visa](https://usa.visa.com/dam/VCOM/download/merchants/visa-usa-interchange-reimbursement-fees.pdf) and [Mastercard](https://www.mastercard.us/content/mccom/en-us/about-mastercard/what-we-do/interchange.html).

Interchange is determined by the card type (ie. debit vs. credit), whether the card was present (in-store) or not-present (ie. online), and in the case of debit cards the size of the financial institution (see Durbin amendment for more information about capped interchange rates for institutions with over $10b in assets).

In my experience, pre-Covid, you could expect about 60% of transactions to be card not-present (higher interchange!).

## Working with a card partner

### Designing your card and packaging

As soon as you stray from the old school raised numbers on front, you're in uncharted waters. Even if your card partner has done something similar to what you propose, there are at least a dozen decisions to make, each impacting the next. A well designed card will likely have a few layers of plastic glued around a radio antenna (contactless!), with a laser cut hole that needs to accommodate a chip oh so perfectly. Then on top you start to print layers of ink and UV coating, all while considering the placement and constraints of the card partner's personalization capabilities. Oh and all those layers need to exist within a 1mm thickness tolerance to ensure they fit into ATMs and POS machines.

And that's just the print product part of the equation. Before you even start to evaluate card partners you will have dreamed up this physical manifestation of your new digital "bank".

The card networks set the rules for what must, and what cannot, go on your card. However, as much as those rules exist, they are also made to be broken.

Design your card without constraint (except for physical size). There are cards without a signature panel (Wave), without a network logo (Square), and even without numbers (Apple). Most processors and your card partners lack imagination, and after all, it's easier to stay within the reef (remember that uncharted waters analogy above?). Design your card and pay particular attention to the print production processes you want to leverage. Then take that design to a few card partners and see who engages in a meaningful dialogue, vs. who just shrugs their shoulders or tells you "Visa won't let you do that".  In my experience, Visa will let you do that, you'll just need to have your Visa account manager run it up the chain for an exception.

The card provider can coordinate the printing/manufacture of your carrier (the piece of paper or packaging that holds the card) and envelope, however, these can also be purchased elsewhere and put in inventory at the card partner for personalization and shipping.

The card partner is highly specialized to manufacture and personalize secure payment cards. If you are looking for custom packaging (such as a box) you would be best to work directly with a packaging manufacturer and provide that product to the emboss partner.

Beware of specialized packaging though. Your card partner has automated their entire personalization and shipping process. If your packaging does not allow for automated personalization and shipping, the partner will require that you pay to have staff manually pull card and packaging off the line and assemble the package correctly. You will need to agree to a schedule and pay the full cost of those extra hands regardless of whether they're fully utilized. Even still, imagine a scenario where your volume spikes and the more time intensive packaging and shipping process hurts your ability to get cards out the door.

Every program manager starts off thinking about the opportunity to deliver a great unboxing. However, most end up sticking with packaging that can accommodate automation.

One final note on cards. Card partners ramp up for gift card season in early Fall.  Make sure you have enough card inventory to get through to the new year. It's unlikely the card partner will prioritize you over Walmart if you run out of stock.

## Product Features

1. Card transactions
    1. Data you will get from your processor
    2. How you can enrich that data
        1. Third-party data enrichment vendors
    3. Auths and Settles: Edge cases
        1. Expiring auths
            1. regular
            2. car rental
            3. hotels
        2. force post
        3. foreign currency
        4. refunds
            1. sometimes the mcc code for the original transaction and the refund transaction are different

2. Card Management
    1. Lock card
    2. Re-issue
        1. Lost
            1. What if the card hasn't arrived yet
        2. Stolen
    3. Add to Apple Pay, Google Pay, Samsung Pay
    4. Restricted spending
        1. by MCC
        2. by specific merchant
        3. by card-present vs. card not-present

    ACH transactions

    Money movement between customer accounts

**Check Deposit**

Giving customers the ability to deposit a check will require the ability to capture the check image, generate an image cash letter file "ICL" (aka X9.37 file)

You can license check capture SDKs from vendors like Mitek and UrbanFT for an annual fee.

You can generate the ICL yourself using the X9.37 standard. Moov has some open source tooling to help you do this.

You will need to transmit the ICL to your bank partner (the "bank of first deposit"), who will then process the deposit and credit the funds to your cardholder funds account.

1. ACH
2. Wire Transfer
3. Bill Pay

**ATM**

If you've chosen to issue your cards on the Visa or Mastercard network, they will work at 95%+ of ATMs. Those ATM operators will charge your customers a fee between $2.50-$3.50 per transaction.

If you want to offer surcharge-free ATM access you will need to join Moneypass, Allpoint, or both.  When you join a surcharge-free ATM network, you will pay a discounted fee directly to the network for each transaction.

**Moneypass**: owned by Fiserv. Most ATM locations are in community banks. Moneypass has lower transaction fees but the process for getting setup (legal, technical, etc.) seemed like it would be full of friction. I didn't move forward with Moneypass last time I had to make this decision so I'd be curious to hear from others who did.

**Allpoint**: owned by Cardtronics, it is the largest ATM network with the US with 55k ATMs. Most ATMs are located in retailers like Walgreens and Target. Allpoint transaction fees are more expensive than Moneypass, but setup is easy (4-6 weeks) and their location finder API works as advertised.

## Bonus Content

1. Be your own processor
1. Using multiple banks
1. Using multiple emboss partners

## Glossary of terms

ACH - [Automated clearing house](https://en.wikipedia.org/wiki/Automated_clearing_house)

RDFI - Receiving Depository Financial Institute

ODFI - Originating Depository Financial Institute

CIP - Customer Information Program

KYC - Know Your Customer

AML - Anti-Money Laundering


This document was originally copied from [here](https://www.notion.so/Guide-to-starting-a-challenger-bank-7a89941aca484d2ab094bc8afaa96c78).  Thanks to Jeremy Black for contributing it.
