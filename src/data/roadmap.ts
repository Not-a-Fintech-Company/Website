// src/data/roadmap.ts
export type Status = 'published' | 'drafting' | 'planned' | 'external';

export interface RoadmapItem {
  label: string;
  href?: string;
  status: Status;
}

export interface RoadmapCategory {
  title: string;
  items: RoadmapItem[];
}

export interface RoadmapSection {
  title: string;
  categories: RoadmapCategory[];
}

export const roadmap: RoadmapSection[] = [
  {
    title: 'Guides',
    categories: [
      {
        title: 'Foundations',
        items: [
          { label: 'How to select a bank partner', href: '/guides/how-to-select-a-bank-partner/', status: 'published' },
          { label: 'MTL vs MSB vs National Trust bank charter vs National Charter', status: 'planned' },
          { label: 'How to launch a card product', href: '/guides/how-to-launch-a-card-product/', status: 'published' },
          { label: 'Credit card vs Charge Card vs Debit Card', status: 'planned' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Financial crime prevention and compliance partner selection', status: 'planned' },
          { label: 'Card product operational preparation', status: 'planned' },
          { label: 'Managing cards/payments/compliance vendors and sponsor bank relationships', status: 'planned' },
          { label: 'Financial Crime compliance roles, responsibilities, and alerts', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Models',
    categories: [
      {
        title: 'Identity & Fraud',
        items: [
          { label: 'Financial Crime risk assessment', status: 'planned' },
          { label: 'Origination Fraud', status: 'planned' },
          { label: 'KYC & Identity Fraud', status: 'planned' },
          { label: 'Transactional Fraud', status: 'planned' },
          { label: 'Synthetic Fraud', status: 'planned' },
        ],
      },
      {
        title: 'Financial Product',
        items: [
          { label: 'Bank Accounts (debit & savings)', href: '/models/bank-account/', status: 'published' },
          { label: 'Term Loans (installment, mortgage, student)', href: '/models/term-loan/', status: 'published' },
          { label: 'Credit Cards (credit & charge)', href: '/models/credit-card/', status: 'published' },
          { label: 'Debit cards', status: 'planned' },
          { label: 'Insurance', status: 'planned' },
          { label: 'Brokerage Accounts', status: 'planned' },
        ],
      },
      {
        title: 'Underwriting',
        items: [
          { label: 'Credit Risk (Mortgage, Credit Card, Installment, Auto, Payday)', status: 'planned' },
          { label: 'ACH Risk', status: 'planned' },
          { label: 'Wire Risk', status: 'planned' },
        ],
      },
      {
        title: 'People',
        items: [
          { label: 'Customer Operations', status: 'planned' },
          { label: 'Financial Crime Operations', status: 'planned' },
          { label: 'Product', status: 'planned' },
          { label: 'Engineering', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Disclosures & Agreements',
    categories: [
      {
        title: 'Credit Card',
        items: [
          { label: 'Schumer Box', href: 'https://en.wikipedia.org/wiki/Schumer_box', status: 'external' },
          { label: 'Credit Cardholder Agreement — CFPB template', href: 'https://www.consumerfinance.gov/data-research/credit-card-data/know-you-owe-credit-cards/', status: 'external' },
          { label: 'Statement Disclosure', status: 'planned' },
        ],
      },
      {
        title: 'Bank Account',
        items: [
          { label: 'Deposit Account Agreement', status: 'planned' },
          { label: 'Saving Account Agreement', status: 'planned' },
          { label: 'Automatic Savings Account Agreement', status: 'planned' },
        ],
      },
      {
        title: 'General',
        items: [
          { label: 'Electronic Communications Agreement', status: 'planned' },
          { label: 'eSign Agreement', status: 'planned' },
          { label: 'Terms and Conditions', status: 'planned' },
          { label: 'Company Privacy Policy', status: 'planned' },
        ],
      },
    ],
  },
  {
    title: 'Policies',
    categories: [
      {
        title: 'Compliance & Risk',
        items: [
          { label: 'Bank Secrecy Act / AML / OFAC Policy', href: '/docs/bsa/', status: 'published' },
          { label: 'Fraud prevention policy', status: 'planned' },
          { label: 'Collections Policy', status: 'planned' },
          { label: 'Credit Bureau Reporting', status: 'planned' },
          { label: 'Third Party Vendor Management', status: 'planned' },
          { label: 'Information Security Program and Policies', href: 'https://docs.google.com/document/d/19b9vL85524hHLElJ3O5xnEOrgvgRKbgQxjiM89196Fo/edit?usp=sharing', status: 'external' },
          { label: 'Business Continuity / Disaster Recovery', href: 'https://docs.google.com/document/d/1-dRk6RjxaT1jUWssw_6kgek8YPIjU0egLmPew_Q3cZQ/edit?usp=sharing', status: 'external' },
        ],
      },
    ],
  },
  {
    title: 'Procedures',
    categories: [
      {
        title: 'Operations',
        items: [
          { label: 'Customer Service Manual', status: 'planned' },
          { label: 'SAR Filing Process', status: 'planned' },
          { label: 'OFAC Procedure', status: 'planned' },
          { label: 'Financial Crime prevention manual', status: 'planned' },
        ],
      },
    ],
  },
];
