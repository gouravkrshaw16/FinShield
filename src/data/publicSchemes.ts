import { PublicScheme } from '../types';

export const PUBLIC_SCHEMES: PublicScheme[] = [
  {
    id: 'pm-svanidhi',
    title: 'PM SVANidhi (Micro-Credit for Street Vendors & Micro-Shops)',
    tagline: 'Collateral-free working capital loan with 7% interest subsidy & monthly digital cashback.',
    target: 'micro-entrepreneur',
    category: 'working-capital',
    maxBenefit: '₹10,000 (Tranche 1) up to ₹50,000 (Tranche 3)',
    interestRate: 'Subsidized effective 4%-7%',
    subsidyRate: '7% interest subsidy credited directly to bank account on timely repayment',
    eligibility: [
      'Street vendors, fruit/vegetable sellers, tea stalls, small artisans in urban/peri-urban areas',
      'Possession of Certificate of Vending or Urban Local Body (ULB) recommendation letter',
      'Active digital QR/UPI handle for receiving customer payments'
    ],
    documentsRequired: [
      'Aadhaar Card linked with mobile number',
      'Bank Account passbook or statement',
      'Vending ID / LOR from Municipal Body',
      'Basic KYC photograph'
    ],
    applicationPortal: 'https://pmsvanidhi.mohua.gov.in',
    officialAgency: 'Ministry of Housing and Urban Affairs & SIDBI',
    processingTime: '7 - 10 working days',
    repaymentFlexibility: '12-month tenure for Tranche 1 with zero foreclosure penalty and instant eligibility for Tranche 2 (₹20k) upon completion.'
  },
  {
    id: 'mudra-shishu',
    title: 'Pradhan Mantri MUDRA Yojana (PMMY) - Shishu & Kishore',
    tagline: 'Zero-collateral institutional credit for small trade, tailoring, food kiosks, and craft units.',
    target: 'micro-entrepreneur',
    category: 'collateral-free-credit',
    maxBenefit: 'Shishu: Up to ₹50,000 | Kishore: ₹50,000 to ₹5 Lakhs',
    interestRate: '8.5% - 11.5% p.a. (No processing charges for Shishu)',
    subsidyRate: 'Government Credit Guarantee Scheme (CGFMU) covers lender risk',
    eligibility: [
      'Non-corporate small business segment (proprietorship, partnership, cottage)',
      'Manufacturing, processing, trading, or service sector activity',
      'Satisfactory clean transaction track record without default on public debt'
    ],
    documentsRequired: [
      'Identity & Address Proof (Aadhaar / Voter ID)',
      'Bank statement for past 6 months',
      'Proof of business address (Electricity bill / Rent agreement)',
      'Quotations for machinery/inventory to be purchased'
    ],
    applicationPortal: 'https://www.udyamimitra.in',
    officialAgency: 'Department of Financial Services & National MUDRA Bank',
    processingTime: '10 - 15 working days',
    repaymentFlexibility: 'Tenure up to 3 to 5 years with moratorium of 3-6 months depending on cash flow cycle.'
  },
  {
    id: 'pm-vidyalaxmi-csis',
    title: 'Central Sector Interest Subsidy Scheme (CSIS) / PM Vidyalaxmi',
    tagline: '100% full interest subsidy during moratorium for students from economically weaker sections.',
    target: 'student',
    category: 'interest-subsidy',
    maxBenefit: 'Covers entire interest accrued during course + 1 year moratorium',
    interestRate: '0% effective during study period (Subsidized by Gov)',
    subsidyRate: 'Full interest waiver paid directly to lending bank by MoE',
    eligibility: [
      'Pursuing professional/technical accredited degree in India',
      'Annual family gross income from all sources ≤ ₹4.50 Lakhs (EWS category)',
      'Loan availed through IBA scheduled commercial bank under model education loan scheme'
    ],
    documentsRequired: [
      'Bonafide admission letter & fee schedule from university',
      'Income Certificate issued by competent state authority (Tehsildar/SDM)',
      'Class 10th, 12th & Graduation marks sheets',
      'Aadhaar and PAN of student & co-borrower'
    ],
    applicationPortal: 'https://www.vidyalakshmi.co.in',
    officialAgency: 'Ministry of Education & Canara Bank Nodal Cell',
    processingTime: '15 working days',
    repaymentFlexibility: 'Repayment starts 1 year after course completion or 6 months after securing employment.'
  },
  {
    id: 'nsp-merit-means',
    title: 'National Scholarship Portal (NSP) - Merit-cum-Means & Post-Matric',
    tagline: 'Direct benefit transfer (DBT) non-repayable grant for tuition, books, and living maintenance.',
    target: 'student',
    category: 'scholarship',
    maxBenefit: '₹20,000 to ₹75,000 per academic year (100% Non-Repayable)',
    interestRate: '0% (Direct Grant / Scholarship)',
    subsidyRate: 'Non-repayable grant credited directly to student Aadhaar-seeded bank account',
    eligibility: [
      'Minimum 50% marks in previous final examination',
      'Annual family income ceiling as per scheme criteria (₹1.5L - ₹2.5L)',
      'Enrolled in recognized diploma, undergraduate, or postgraduate degree'
    ],
    documentsRequired: [
      'Student photograph & Aadhaar verification',
      'Institution verification slip signed by Dean/Principal',
      'Current year fee receipt',
      'Caste/Income certificate (as applicable)'
    ],
    applicationPortal: 'https://scholarships.gov.in',
    officialAgency: 'Ministry of Minority Affairs & Ministry of Social Justice',
    processingTime: 'Annual disbursement cycle',
    repaymentFlexibility: 'Completely debt-free. Renewal on maintaining academic passing grade.'
  },
  {
    id: 'pm-vishwakarma',
    title: 'PM Vishwakarma Scheme (Support for Artisans & Craftspersons)',
    tagline: '₹15,000 tool kit incentive + ₹1 Lakh to ₹2 Lakh collateral-free loan at 5% interest rate.',
    target: 'micro-entrepreneur',
    category: 'working-capital',
    maxBenefit: '₹1 Lakh (1st Tranche) & ₹2 Lakhs (2nd Tranche) + ₹15k Skill Grant',
    interestRate: 'Concessional 5% p.a. (Gov subvention of 8%)',
    subsidyRate: 'Interest subvention of 8% with credit guarantee covered by MoMSME',
    eligibility: [
      'Traditional artisan/craftsperson working in 18 identified trades (tailor, cobbler, carpenter, pottery, blacksmith, etc.)',
      'Minimum age 18 years; engaged in family trade / hands-on craft',
      'No active loan default under PMEGP or MUDRA'
    ],
    documentsRequired: [
      'Aadhaar and Mobile OTP authentication',
      'Bank Account details',
      'Ration Card / Family registration',
      'Trade self-declaration'
    ],
    applicationPortal: 'https://pmvishwakarma.gov.in',
    officialAgency: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    processingTime: '10 - 14 working days post skill assessment',
    repaymentFlexibility: 'Tranche 1 tenure of 18 months, Tranche 2 tenure of 30 months.'
  },
  {
    id: 'standup-india',
    title: 'Stand-Up India Scheme for Women & SC/ST Entrepreneurs',
    tagline: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield trading or manufacturing.',
    target: 'micro-entrepreneur',
    category: 'collateral-free-credit',
    maxBenefit: '₹10 Lakhs to ₹1 Crore (Composite term loan & working capital)',
    interestRate: 'Lowest applicable rate of bank (MCLR + 3% + Tenor Premium)',
    subsidyRate: 'Covered under National Credit Guarantee Trustee Company (NCGTC)',
    eligibility: [
      'SC/ST and/or Woman entrepreneurs above 18 years of age',
      'Enterprise must be greenfield (first time venture)',
      'In non-individual enterprises, 51% shareholding & controlling stake must be held by SC/ST or woman'
    ],
    documentsRequired: [
      'Detailed Project Report (DPR) with cashflow projections',
      'Identity & Address Proof',
      'Company incorporation/registration Certificate',
      'Bank statement for 1 year'
    ],
    applicationPortal: 'https://www.standupmitra.in',
    officialAgency: 'SIDBI & Department of Financial Services',
    processingTime: '20 - 30 working days',
    repaymentFlexibility: 'Repayable in 7 years with maximum moratorium period of 18 months.'
  }
];
