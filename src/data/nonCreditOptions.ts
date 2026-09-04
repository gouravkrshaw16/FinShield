import { NonCreditOption } from '../types';

export const NON_CREDIT_OPTIONS: NonCreditOption[] = [
  {
    id: 'opt-peer-savings',
    title: 'Peer Micro-Savings Circle (Digital ROSCA / Committee)',
    tag: 'Peer Savings',
    targetAudience: 'Students & Micro-Entrepreneurs',
    savingsVsCommercialLoan: '100% Interest Free — Saves ₹3,000 to ₹8,000 in loan interest & processing fees',
    timeline: '1 - 2 weeks payout turn',
    implementationEase: 'Instant',
    summary: 'A trusted group of 5 to 10 verified peers pool a fixed amount (e.g. ₹2,000 each per month). One member receives the lump sum pot each round with zero interest or middleman cuts.',
    steps: [
      'Form or join a 5-member circle among college peers or neighborhood merchant group',
      'Agree on fixed monthly contribution (e.g. ₹2,500/month)',
      'Assign payout lottery or prioritized rotation based on immediate equipment/inventory urgency',
      'Track all contributions transparently in a shared digital ledger'
    ],
    cautionNote: 'Form circles only with verified peers with trusted social or institutional ties.'
  },
  {
    id: 'opt-emergency-buffer-sprint',
    title: '52-Week Micro-Savings Sprint (₹100/day Automation)',
    tag: 'Budget Optimization',
    targetAudience: 'College Students & Gig Workers',
    savingsVsCommercialLoan: 'Builds ₹36,500 cash buffer instead of borrowing from emergency payday apps',
    timeline: 'Ongoing (First ₹3,000 accumulated in 30 days)',
    implementationEase: 'Instant',
    summary: 'Automate a small daily micro-transfer of ₹50 - ₹150 into a dedicated high-yield liquid recurring deposit or zero-fee digital piggybank before discretionary spending begins.',
    steps: [
      'Activate auto-sweep or daily recurring UPI mandate of ₹100 right after daily earnings',
      'Categorize this account as "Strictly Non-Negotiable Emergency Reserve"',
      'Lock access with dual-step withdrawal friction to avoid impulsive spends'
    ]
  },
  {
    id: 'opt-supplier-milestone',
    title: 'Supplier 50/50 Consignment & Staggered Milestone Terms',
    tag: 'Trade Credit',
    targetAudience: 'Micro-Retailers, Artisans & Small Workshops',
    savingsVsCommercialLoan: 'Avoids 36% APR working capital debt by negotiating supplier payment cycles',
    timeline: '1 - 3 Days negotiation',
    implementationEase: '1-3 Days',
    summary: 'Instead of borrowing money to purchase bulk stock upfront, negotiate paying 30-50% advance upon dispatch and the balance 50% after selling the stock within 21 days.',
    steps: [
      'Provide supplier with verified proof of consistent on-time past transactions from your CrediConsent report',
      'Offer a formal post-dated commitment backed by digital invoicing',
      'Start with small inventory batches to establish mutual trust'
    ]
  },
  {
    id: 'opt-campus-emergency-aid',
    title: 'University / Institute Student Hardship & Work-Study Grant',
    tag: 'Emergency Aid',
    targetAudience: 'College & University Students',
    savingsVsCommercialLoan: '100% Non-Repayable Grant + Paid on-campus hourly work experience',
    timeline: '3 - 7 working days',
    implementationEase: '1-3 Days',
    summary: 'Most accredited universities maintain a Dean of Student Welfare Hardship Fund and campus department work-study positions (Library Assistant, Lab Proctor, Tech Lab Intern) paying ₹5,000 - ₹10,000/month.',
    steps: [
      'Visit the Dean of Student Affairs / Financial Aid office on campus',
      'Submit enrollment proof, student ID, and semester fee receipt',
      'Apply for accredited Work-Study shifts (10 hrs/week) to cover monthly laptop EMI / living allowance'
    ]
  },
  {
    id: 'opt-equipment-subscription',
    title: 'Pay-As-You-Earn Equipment Rental / Refurbished Lease',
    tag: 'Budget Optimization',
    targetAudience: 'Designers, Developers, Food Kiosks & Creators',
    savingsVsCommercialLoan: 'Cuts initial capital outflow by 80% compared to purchasing new on high-interest EMI',
    timeline: 'Same-day turnaround',
    implementationEase: 'Instant',
    summary: 'Rent necessary commercial appliances, cameras, laptops, or POS machines for 3-6 months. Pay out of monthly operating profits without taking 24-month consumer credit debt.',
    steps: [
      'Compare reputable certified leasing/rental platforms for your required machine',
      'Verify that maintenance and hardware replacement is included in monthly rental',
      'Transition to ownership (Rent-to-own) once monthly cashflow exceeds 3x rental fee'
    ]
  }
];
