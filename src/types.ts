export type PersonaType = 'student' | 'micro-entrepreneur' | 'gig-worker' | 'custom';

export interface ConsentSource {
  id: string;
  name: string;
  category: 'banking' | 'telecom' | 'academics' | 'commerce' | 'gig';
  icon: string;
  description: string;
  status: 'active' | 'revoked' | 'pending';
  lastSynced: string;
  expiresInDays: number;
  dataPoints: string[];
  purpose: string;
  encryptionStandard: string;
  isCustomUploaded?: boolean;
}

export interface ScorePillar {
  id: string;
  name: string;
  score: number; // 0 to 100
  weight: number; // 0.0 to 1.0 (sums to 1.0)
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  summary: string;
  benchmark: string;
  factors: {
    label: string;
    value: string;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  }[];
}

export interface ProtectedCharacteristicAudit {
  attribute: string;
  weight: number; // strictly 0%
  status: 'Strictly Excluded' | 'Zero Weight Verified';
  rationale: string;
  fairLendingStandard: string;
}

export interface CashflowEntry {
  id: string;
  date: string;
  title: string;
  type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  isRecurring: boolean;
  isConsentedData: boolean;
}

export interface DisputeRecord {
  id: string;
  pillarId: string;
  metricName: string;
  previousValue: string;
  claimedValue: string;
  reason: string;
  supportingDocNote: string;
  status: 'resolved' | 'under-review' | 'submitted';
  date: string;
  scoreImpactDelta: number;
}

export interface PublicScheme {
  id: string;
  title: string;
  tagline: string;
  target: 'student' | 'micro-entrepreneur' | 'all';
  category: 'collateral-free-credit' | 'interest-subsidy' | 'direct-grant' | 'scholarship' | 'working-capital';
  maxBenefit: string;
  interestRate: string;
  subsidyRate?: string;
  eligibility: string[];
  documentsRequired: string[];
  applicationPortal: string;
  officialAgency: string;
  processingTime: string;
  repaymentFlexibility: string;
}

export interface NonCreditOption {
  id: string;
  title: string;
  tag: 'Peer Savings' | 'Budget Optimization' | 'Emergency Aid' | 'Trade Credit' | 'Grant';
  targetAudience: string;
  savingsVsCommercialLoan: string;
  timeline: string;
  implementationEase: 'Instant' | '1-3 Days' | '1-2 Weeks';
  summary: string;
  steps: string[];
  cautionNote?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  personaType: PersonaType;
  title: string;
  location: string;
  monthlyInflow: number;
  monthlyOutflow: number;
  emergencyFund: number;
  existingDebtObligations: number;
  fundingNeed: {
    amount: number;
    purpose: string;
    targetDateMonths: number;
  };
  scorePillars: ScorePillar[];
  consentSources: ConsentSource[];
  cashflowTransactions: CashflowEntry[];
  disputes: DisputeRecord[];
}
