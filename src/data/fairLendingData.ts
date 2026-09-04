import { ProtectedCharacteristicAudit } from '../types';

export const PROTECTED_CHARACTERISTICS_AUDIT: ProtectedCharacteristicAudit[] = [
  {
    attribute: 'Gender & Gender Identity',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Gender has zero statistical causal relationship to true operational cash flow reliability and is illegal to evaluate under fair lending standards.',
    fairLendingStandard: 'Equal Credit Opportunity Act (ECOA) & RBI Fair Lending Directive',
  },
  {
    attribute: 'Race, Ethnicity, Caste & Tribal Status',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Demographic backgrounds and social identity indicators are completely omitted from algorithmic models to prevent systemic historical bias.',
    fairLendingStandard: 'Non-Discrimination Financial Framework ISO/IEC TR 24028',
  },
  {
    attribute: 'Religion & Faith Practices',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Religious beliefs, community affiliations, and places of worship data are entirely blacklisted and never ingested.',
    fairLendingStandard: 'Universal Declaration of Human Rights Article 2',
  },
  {
    attribute: 'Marital Status & Family Size',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Individual repayment capacity is based purely on verified individual cash flow surplus, not marital dependency.',
    fairLendingStandard: 'Consumer Credit Fairness Protocol',
  },
  {
    attribute: 'Pin Code / Residential Neighborhood (Redlining Guard)',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Geographic location markers are decoupled to eliminate modern algorithmic redlining of low-income postal districts.',
    fairLendingStandard: 'Anti-Redlining Algorithmic Compliance Mandate',
  },
  {
    attribute: 'Disability & Health Status',
    weight: 0,
    status: 'Strictly Excluded',
    rationale: 'Medical records, health status, and accessibility requirements are strictly private health data and never requested.',
    fairLendingStandard: 'Digital Personal Data Protection (DPDP) Act 2023',
  },
];
