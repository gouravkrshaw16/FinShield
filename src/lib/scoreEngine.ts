import { UserProfile, ScorePillar, ConsentSource, CashflowEntry, PersonaType } from '../types';

export interface FinancialIntakeData {
  name: string;
  personaType: PersonaType;
  title: string;
  location: string;
  monthlyInflow: number;
  monthlyOutflow: number;
  emergencyFund: number;
  existingDebtObligations: number;
  billOnTimePercent: number; // e.g. 100, 90, 80
  inflowFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  academicOrVintageInfo: string;
  fundingAmount: number;
  fundingPurpose: string;
  targetTimelineMonths: number;
  selectedConsents: string[];
}

export function generatePersonalizedProfile(data: FinancialIntakeData, customId?: string): UserProfile {
  const profileId = customId || `user-custom-${Date.now()}`;
  const netMargin = data.monthlyInflow > 0 
    ? ((data.monthlyInflow - data.monthlyOutflow) / data.monthlyInflow) * 100 
    : 0;
  const netSurplus = Math.max(data.monthlyInflow - data.monthlyOutflow, 0);
  const expenseRunwayMonths = data.monthlyOutflow > 0 
    ? (data.emergencyFund / data.monthlyOutflow) 
    : 0;
  const debtToIncomeRatio = data.monthlyInflow > 0 
    ? (data.existingDebtObligations / data.monthlyInflow) * 100 
    : 0;

  // 1. Cashflow Inflow Consistency & Velocity Pillar (30% weight)
  let cashflowScore = 70;
  if (netMargin > 35) cashflowScore += 18;
  else if (netMargin > 20) cashflowScore += 12;
  else if (netMargin > 5) cashflowScore += 5;
  else cashflowScore -= 15;

  if (data.inflowFrequency === 'daily' || data.inflowFrequency === 'weekly') cashflowScore += 8;
  else if (data.inflowFrequency === 'bi-weekly') cashflowScore += 5;
  cashflowScore = Math.min(Math.max(cashflowScore, 35), 98);

  const cashflowPillar: ScorePillar = {
    id: 'p-cashflow',
    name: 'Cashflow Inflow Consistency & Velocity',
    score: cashflowScore,
    weight: 0.30,
    grade: cashflowScore >= 80 ? 'Excellent' : cashflowScore >= 65 ? 'Good' : 'Fair',
    summary: `Net operating margin is ${netMargin >= 0 ? '+' : ''}${netMargin.toFixed(1)}% with ${data.inflowFrequency} earning cycle.`,
    benchmark: `Retains ₹${netSurplus.toLocaleString('en-IN')} surplus each month after ₹${data.monthlyOutflow.toLocaleString('en-IN')} essential expenses.`,
    factors: [
      {
        label: 'Operating Surplus Margin',
        value: `${netMargin >= 0 ? '+' : ''}${netMargin.toFixed(1)}%`,
        impact: netMargin >= 20 ? 'positive' : netMargin >= 5 ? 'neutral' : 'negative',
        description: `Retaining ₹${netSurplus.toLocaleString('en-IN')} monthly disposable cushion.`
      },
      {
        label: 'Inflow Velocity',
        value: `${data.inflowFrequency.toUpperCase()} Inflow Pattern`,
        impact: 'positive',
        description: 'Consistent recurring payment arrival reduces single-point liquidity failure.'
      }
    ]
  };

  // 2. Recurring Commitment & Bill Reliability (25% weight)
  let billScore = Math.round(data.billOnTimePercent * 0.9);
  if (data.billOnTimePercent >= 98) billScore = 92;
  billScore = Math.min(Math.max(billScore, 40), 96);

  const billPillar: ScorePillar = {
    id: 'p-bills',
    name: 'Recurring Commitment & Bill Reliability',
    score: billScore,
    weight: 0.25,
    grade: billScore >= 85 ? 'Excellent' : billScore >= 70 ? 'Good' : 'Fair',
    summary: `${data.billOnTimePercent}% verified on-time record across utility, telecom, and subscription commitments.`,
    benchmark: `${data.billOnTimePercent}% digital invoice settlement consistency.`,
    factors: [
      {
        label: 'Utility & Telecom Discipline',
        value: `${data.billOnTimePercent}% On-Time`,
        impact: data.billOnTimePercent >= 90 ? 'positive' : 'neutral',
        description: 'Verified via consented telecom and digital billing streams.'
      },
      {
        label: 'Default & Overdue Risk',
        value: data.billOnTimePercent >= 95 ? 'Zero Overdue' : 'Minor Delays Managed',
        impact: data.billOnTimePercent >= 95 ? 'positive' : 'neutral',
        description: 'Payment discipline provides strong alternative proxy to traditional credit bureau scores.'
      }
    ]
  };

  // 3. Savings Discipline & Liquid Cushion (20% weight)
  let savingsScore = 50;
  if (expenseRunwayMonths >= 3) savingsScore = 90;
  else if (expenseRunwayMonths >= 2) savingsScore = 82;
  else if (expenseRunwayMonths >= 1) savingsScore = 72;
  else if (expenseRunwayMonths >= 0.5) savingsScore = 60;
  else savingsScore = 45;

  const savingsPillar: ScorePillar = {
    id: 'p-savings',
    name: 'Savings Discipline & Liquid Cushion',
    score: savingsScore,
    weight: 0.20,
    grade: savingsScore >= 80 ? 'Excellent' : savingsScore >= 65 ? 'Good' : 'Needs Attention',
    summary: `Liquid emergency buffer covers ${expenseRunwayMonths.toFixed(1)} months of baseline living/operating burn.`,
    benchmark: `₹${data.emergencyFund.toLocaleString('en-IN')} emergency reserve vs ₹${data.monthlyOutflow.toLocaleString('en-IN')} monthly outflow.`,
    factors: [
      {
        label: 'Emergency Runway',
        value: `${expenseRunwayMonths.toFixed(1)} Months`,
        impact: expenseRunwayMonths >= 1 ? 'positive' : 'neutral',
        description: expenseRunwayMonths >= 2 
          ? 'Exceptional cushion to absorb revenue seasonality.' 
          : 'Building towards 2-3 months buffer is recommended before seeking loans.'
      },
      {
        label: 'Liquid Capital Reserves',
        value: `₹${data.emergencyFund.toLocaleString('en-IN')}`,
        impact: data.emergencyFund > 10000 ? 'positive' : 'neutral',
        description: 'Directly available for unexpected repairs or urgent cash requirements.'
      }
    ]
  };

  // 4. Leverage Vulnerability & Debt-to-Income (15% weight)
  let debtScore = 95;
  if (debtToIncomeRatio > 40) debtScore = 40;
  else if (debtToIncomeRatio > 25) debtScore = 60;
  else if (debtToIncomeRatio > 10) debtScore = 78;
  else if (debtToIncomeRatio > 0) debtScore = 88;

  const debtPillar: ScorePillar = {
    id: 'p-leverage',
    name: 'Leverage Vulnerability & Debt-to-Income',
    score: debtScore,
    weight: 0.15,
    grade: debtScore >= 85 ? 'Excellent' : debtScore >= 70 ? 'Good' : 'Needs Attention',
    summary: data.existingDebtObligations === 0 
      ? 'Clean slate with 0% income consumed by debt service obligations.' 
      : `${debtToIncomeRatio.toFixed(1)}% of income allocated to active debt service.`,
    benchmark: `Debt Service Ratio is ${debtToIncomeRatio.toFixed(1)}% (Safe ceiling is <25%).`,
    factors: [
      {
        label: 'Monthly Debt Obligation',
        value: `₹${data.existingDebtObligations.toLocaleString('en-IN')} / mo`,
        impact: data.existingDebtObligations === 0 ? 'positive' : debtToIncomeRatio < 25 ? 'neutral' : 'negative',
        description: data.existingDebtObligations === 0 
          ? 'Zero predatory payday loan or high-interest EMI exposure.' 
          : 'Active repayments monitored for debt trap prevention.'
      },
      {
        label: 'Debt-to-Income Ratio',
        value: `${debtToIncomeRatio.toFixed(1)}% DTI`,
        impact: debtToIncomeRatio < 15 ? 'positive' : 'neutral',
        description: 'Remaining borrowing headroom is healthy and non-leveraged.'
      }
    ]
  };

  // 5. Professional & Continuity Standing (10% weight)
  const continuityScore = data.personaType === 'student' ? 88 : data.personaType === 'micro-entrepreneur' ? 86 : 82;
  const continuityPillar: ScorePillar = {
    id: 'p-continuity',
    name: 'Academic & Professional Continuity',
    score: continuityScore,
    weight: 0.10,
    grade: 'Excellent',
    summary: data.academicOrVintageInfo || 'Verified continuous operations and accredited profile credentials.',
    benchmark: 'Continuous active track record across verified platforms and repositories.',
    factors: [
      {
        label: 'Professional Record',
        value: 'Verified Active Standing',
        impact: 'positive',
        description: data.academicOrVintageInfo || 'Strong continuity signals long-term stability.'
      },
      {
        label: 'Identity Security',
        value: 'Zero-Knowledge Verified',
        impact: 'positive',
        description: '100% fair lending compliant with zero demographic harvesting.'
      }
    ]
  };

  // Generate Consented Sources based on user selection or defaults
  const consentSources: ConsentSource[] = [
    {
      id: `cs-upi-${profileId}`,
      name: 'UPI Inflow & Transaction Aggregate',
      category: 'banking',
      icon: 'Smartphone',
      description: 'Calculates monthly cash flow regularity without revealing private personal merchant spends.',
      status: data.selectedConsents.includes('banking') || data.selectedConsents.length === 0 ? 'active' : 'revoked',
      lastSynced: 'Just now',
      expiresInDays: 90,
      dataPoints: ['Monthly Total Inflow Volume', 'Inflow Velocity', 'Net Surplus Ratio'],
      purpose: 'Establish non-traditional cashflow stability for alternative credit readiness score.',
      encryptionStandard: 'AES-256 GCM + RBI Account Aggregator Standard',
    },
    {
      id: `cs-telecom-${profileId}`,
      name: 'Telecom & Broadband Bill History',
      category: 'telecom',
      icon: 'Wifi',
      description: 'Analyzes recurring broadband and postpaid recharge consistency.',
      status: data.selectedConsents.includes('telecom') || data.selectedConsents.length === 0 ? 'active' : 'revoked',
      lastSynced: 'Today',
      expiresInDays: 120,
      dataPoints: ['Bill Due Dates vs Payment Dates', 'Recharge Continuity', 'Tenure of Connection'],
      purpose: 'Verify bill payment discipline as an alternative to traditional credit bureau scores.',
      encryptionStandard: 'TLS 1.3 End-to-End Encrypted',
    },
    {
      id: `cs-academic-${profileId}`,
      name: data.personaType === 'student' ? 'National Academic Depository (NAD)' : 'MSME / Professional Registry',
      category: 'academics',
      icon: data.personaType === 'student' ? 'GraduationCap' : 'Award',
      description: data.personaType === 'student' 
        ? 'Verifies university student enrollment status and fee payment receipts.'
        : 'Validates enterprise registration and vocational licensing.',
      status: 'active',
      lastSynced: 'Today',
      expiresInDays: 365,
      dataPoints: ['Enrollment / Registration ID', 'Clearance Receipts', 'Accreditation'],
      purpose: 'Qualify user for government welfare interest subsidies, grants, and public schemes.',
      encryptionStandard: 'DigiLocker Certified OAuth 2.0 Token',
    }
  ];

  // Generate realistic initial cashflow transactions
  const cashflowTransactions: CashflowEntry[] = [
    {
      id: `tx-in-1-${profileId}`,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      title: `${data.personaType === 'student' ? 'Stipend & Freelance Inflow' : data.personaType === 'micro-entrepreneur' ? 'Customer Merchant Collections' : 'Platform Payout'}`,
      type: 'inflow',
      category: 'Primary Income',
      amount: Math.round(data.monthlyInflow * 0.45),
      isRecurring: true,
      isConsentedData: true
    },
    {
      id: `tx-in-2-${profileId}`,
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      title: 'Secondary Receipt / Milestone Settlement',
      type: 'inflow',
      category: 'Operating Inflow',
      amount: Math.round(data.monthlyInflow * 0.35),
      isRecurring: true,
      isConsentedData: true
    },
    {
      id: `tx-out-1-${profileId}`,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      title: 'Living / Operational Base Rent & Space',
      type: 'outflow',
      category: 'Housing & Space',
      amount: Math.round(data.monthlyOutflow * 0.45),
      isRecurring: true,
      isConsentedData: true
    },
    {
      id: `tx-out-2-${profileId}`,
      date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      title: 'Essential Utilities, Telecom & Connectivity',
      type: 'outflow',
      category: 'Utilities',
      amount: Math.round(Math.min(data.monthlyOutflow * 0.12, 2500)),
      isRecurring: true,
      isConsentedData: true
    },
    {
      id: `tx-out-3-${profileId}`,
      date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      title: 'Emergency Cushion Automated Deposit',
      type: 'outflow',
      category: 'Savings Reserve',
      amount: Math.round(Math.max(netSurplus * 0.3, 1000)),
      isRecurring: true,
      isConsentedData: true
    }
  ];

  return {
    id: profileId,
    name: data.name.trim() || 'Valued User',
    personaType: data.personaType,
    title: data.title.trim() || `${data.personaType === 'student' ? 'University Scholar' : data.personaType === 'micro-entrepreneur' ? 'Small Enterprise Owner' : 'Independent Professional'}`,
    location: data.location.trim() || 'India',
    monthlyInflow: data.monthlyInflow,
    monthlyOutflow: data.monthlyOutflow,
    emergencyFund: data.emergencyFund,
    existingDebtObligations: data.existingDebtObligations,
    fundingNeed: {
      amount: data.fundingAmount || 25000,
      purpose: data.fundingPurpose || 'Productivity & Growth Capital',
      targetDateMonths: data.targetTimelineMonths || 2,
    },
    scorePillars: [cashflowPillar, billPillar, savingsPillar, debtPillar, continuityPillar],
    consentSources,
    cashflowTransactions,
    disputes: [],
  };
}
