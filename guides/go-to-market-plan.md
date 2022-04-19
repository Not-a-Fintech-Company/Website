---
title: Go to market guide
---
The goal of this guide is to provide a list of questions to answer in order to launch a product within one year and hopefully start seeing signs of product market fit for a new fintech company. While not exhaustive on all questions, it should provide a good start on what you will need to plan to build vs. buy vs. rent to get a new product launched.

### Table of Contents
1. [Month 0](#month-0)
1. [Months 1-3](#months-1-3)
1. [Months 3-6](#months-3-6)
1. [Months 6-9+](#months-6-9)


## Month 0
*Goal: Figure out your target customer and product*

### Strategy Questions to Answer
* What problem exists for which there's no solution?
* What's the reason the solution does not exist?
    * too expensive to acquire customers for
    * not enough revenue
    * too much risk/fraud
    * not technically possible
* Who has previously tried to fix this problem? Who has tried to do it with this solution?
* What is technically possible now that wasn't possible before, and what emergent behavior does it enable? Why now?


### Product Questions to Answer
* What is the product you are launching?
    * Debit card and checking account?
    * Savings?
    * Brokerage?
    * Credit of some sort?
    * Crypto?
    * Thought another way: Transacting, Savings, Investing, Borrowing, Insuring
* Which segment of the target market are you targeting?
   * How are you segmenting your community?
      * Age/income?
      * Group Affinity?
      * Demographic
   * How do they bank currently?
   * What are the strongest pain points with their existing products?
   * Where do you think a wedge exists?
   * Who are their other trusted relationships that you can leverage?
* How can I provide a product that responds to these initial pain points? (e.g. if they are banking with Western Union and paying a ton of fees, offering them no fee product)
   * Example: Figure out if the ITIN set-up number a) useful b) feasible). If you can get the ITIN number, will that be enough to get someone to set-up an account?
* What is the functional appeal and what is the emotional appeal? What feeling do I want customers to feel when they use my product?
* What are the minimum features needed to make this work? (e.g. how are customers sending funds to their cards? Do they need a check deposit feature?)
* What do you think is the best way to get this product into consumers hands? Where will you find them? How do you build trust?


### Action Items
* Talk to customers to find target segment. Talk to customers. Talk to customers.
* Talk to other neo-bank founders to figure out what did and did not work
* Talk to prior similar products that have failed
   * Identify what they learned that did and did not work
   * Learn what has changed about the market timing

### Deliverables
* Have a document detailing the target customer profile, initial product, and how it’s going to ideally work and brand / how you think you’ll get to them


### What do people get wrong at this stage?
* Think target customer is bigger than it is
* Failure to pick a product
* Don’t talk to customers, or don’t talk to them enough. Figure out which of your assumptions are wrong. The quicker you can correct them the better off you'll be.
* Unit economics - way to aggressive - assume just savings
* Focus on marketing - there’s not a lot of benefit to focusing on marketing at this point. You can put up a landing page to test digital value props, but don’t worry about setting up a waitlist yet. Can’t give potential customers product yet!
* Focus on hiring a lot of people - you don’t need them yet :) As long as you have someone to do the user research and someone to build, you’re good!


### Other Notes
* It’s ok to pick the wrong product to start! Chris Britt at Chime started with a rewards product and then pivoted into the 2 day early deposit product, but if you don’t have a product, otherwise you can’t get to the next downstream decision
* You can “cheat” for a while by building on a BaaS provider (e.g. Unit, Treasury Prime, Synapse) - a number of players were built on top of Synapse, then went with someone like Galileo after things were working (e.g. Point, Empower, Dave). This movement is fairly well-documented too!  Some never leave the BaaS provider and just focus on product differentiation and scaling (Mercury)

***

## Months 1-3
*Goal: Build the fintech backend to the product you designed*


### Key Questions
* How am I going to launch this product (bank partners? MTL? Lending Licenses? BaaS/Issuing partner)?
* Have you raised enough capital to solve counter-party risk for the companies you will partner with?
* Which vendors am I going to use? Which banking partner?
* What will initial and scale unit economics look like? What pricing do I need to break-even as a result?  What pieces of unit economics can you fix later, what ones can you not?
* What does my regulatory roadmap look like? What can I do as an agent or licensee of another’s authorization to begin with, and what must I do myself? 



### Action Items
* Finalize secondary product features (e.g. do they need ATM network access?)
* Talk to the BaaS providers and the partner banks, [get price quotes](/guides/n-steps-to-closing-a-bank-partner/#example-fees-for-savings-product), negotiate for best fit and terms.
* Figure out compliance needs to launch.  Many times this involved finding a compliance consultant that can help you set-up compliance program(policies and procedures).  This will make you look more competent in the eyes of a bank (most banks want a dedicated compliance officer - you can use a consultant to start and then once things are up and running, you can hire in-house).
* Some of this will be dependent on the product you launch with, for example, if you’re issuing a credit product, you should start having conversation
* Build model for economics - [models](/models) can be found here
* Identify engineering needs, where to hire to get an MVP out the door, and what necessary for launch
* Read the regulatory handbooks and guides yourself to get familiar with what you are allowed to build and required to do to launch the product


### Deliverables
* Starting negotiating agreements with banking providers and other vendors. Different vendors and products will have different pricing models (revenue share versus a-la carte versus)
* Hire compliance consultant or compliance shop
* If building credit product, start looking for underwriting / credit lead


### Other Notes
* Some of this will feel circular (i.e. vendor selection might drive bank and vice versa - certain vendors/banks are a better fit for certain products and not others), so it might feel like it’s a bit up in the air
* Banks care about a few things:
    1. Is this worth their time? Will you drive meaningful revenue to them on your core product?
    2. Risk you are bringing them from a fraud, money laundering, compliance front.
    3. How fast you will grow? A customer acquisition model to project 3-5 year growth is a good start.
* Drawing out every functional component of your "stack" at this early stage and understanding the interplay between them can help you get it out of your head.


### What do people get wrong at this stage?
* Focus on optimizing partners rather than speed to launch
* Making assumptions that some elements are more important or long-term than they are. Assume everything will need to be rebuilt
* Not understanding how fintech infra works :) Don’t worry - we’re here for that! You should do references with other current customers, figure out how much they charge and run it by multiple people before signing anything. Compare your terms to similar card products / limits (e.g. credit limits, daily transaction limits, spend and balance threshold, ATM access)
* Not getting compliance right. This is *especially* important if your target customers might not be banked! You need to find a bank who is willing to work with you on this

***

## Months 3-6
*Goal: Start building the digital side of the bank*


### Key Questions to Figure Out
* What is my digital product going to look like? Will my partners approve of the brand I am building?
* How is it going to embody the brand I want to build?
* How am I going to work with my partner banks and vendors to make the process as smooth as possible for my customers?


### Action Items
* Start with best practices. Good artists borrow, great artists steal
* Test UX design, build UI
* Build back-end infrastructure (e.g. username/password, shadow ledger, account management, bank vendor integration, flow of funds reconciliation)
* Make sure compliance (e.g. PCI, PII) is complete, build out security stack (e.g. data leaks)
* Design the card, plan for how many cards you’ll need over year 1 (if printing cards)
* Come up with strategy around customer service - what software you’ll use and how you’ll staff it (e.g. Zendesk? have 24/7 WhatsApp support?)
* Start talking to potential senior marketing hires - want someone with experience talking to this segment and who can quickly iterate on strategies (doesn’t have to be a fintech expert!)


### Deliverables
* Have signed agreements with banking providers and other vendors - make sure you have a) issuing bank 2) card network 3) processor 4) card provider - much of this can be done by a BaaS provider to start
* Have working mobile app
* If building a credit product, have a underwriting / credit lead ready to hire
* Finalize compliance processes
    * How are you onboarding customers
    * How will you notify the banks of complaints
    * How will you apply sanctions list compliance and filing SARs
    * Finish a version of your compliance policies (e.g. how do you assess the risk of individual transactions? Account takeover?)
    * Make sure things like information security and physical security procedures process are also in place
* Hire lawyers to write up things like disclosures & agreements (depending on product starting with)
* Find a card printer if issuing a card


### Other Notes
* This process can be a lot easier with a BaaS platform, who can save months to launch


### What do people get wrong at this stage?
* Seamless onboarding. The most important thing (that is also hard!) is getting onboarding to be seamless and easy. That means not having people wait a week to use the product. The more time you can spend with the bank getting comfortable with your KYC procedures, the better.
* You most likely don’t need a general counsel yet! You might need additional legal help if you are doing novel things, but don’t bring in-house

***

## Months 6-9+
*Goal: Polish product for launch, get the marketing plan into action*


### Key Questions to Figure Out
* How am I going to get this product into customers' hands?
* What marketing strategies am I going to test? 
    * Offline?
    * Online?
    * Which digital channels?


### Action Items
   * Order cards (if doing physical) - lead times can be months depending on queue backlogs and quality of cards
   * Test secondary compliance / risk policy set-up (e.g. information security, AML training)
   * Start trying cards, make sure product works, identify edge cases and bugs
   * Identify beta test population
   * Set up launch page and waitlist

### Deliverables
   * Have a marketing plan with hypothesis and how you’re going to test each of them
   * Bring on senior marketing hire or test marketing channels


### Other Notes
   * Product marketing fit (finding scalable and durable marketing channels) is just as hard to find as product market fit in Fintech. You might have the right product for your segment, but if they never know you exist

### What do people get wrong at this stage?
   * Launching a poor experience - It’s hard to earn back trust - better to launch with a product that works and is a good experience, than get the product out quickly
   * Launching with influencers too early - make sure the beta is complete first. Feedback is critical - you want to know how people are using the product and what works and what doesn’t before going out with a bang. Thing about influencers as a way to *accelerate* growth, not launch for the first time
   * Offline marketing - It’s hard to get fast feedback on offline channels. It can be an expensive channel to test

Thanks to [Seema](https://twitter.com/seema_amble/) for the initial documentation and inspiration for this doc, and [Ayo](https://twitter.com/ay_o/), [Drew](https://twitter.com/drewrants) and [Nichole](https://twitter.com/nwischoff) for additional feedback.
