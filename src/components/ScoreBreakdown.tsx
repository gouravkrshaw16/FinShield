import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  ArrowRight, 
  Info, 
  RotateCcw,
  Sparkles,
  Lock,
  FileCheck2,
  Edit3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Target,
  Lightbulb,
  Check,
  ChevronRight,
  Zap,
  Scale,
  Building2
} from 'lucide-react';
import { UserProfile, ScorePillar } from '../types';
import { PROTECTED_CHARACTERISTICS_AUDIT } from '../data/fairLendingData';
import { calculateOverallScore } from '../data/mockProfiles';

interface ScoreBreakdownProps {
  profile: UserProfile;
  onOpenDispute: (pillar: ScorePillar, metricName?: string) => void;
  onExplainWithAi: () => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenAssessment?: () => void;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  profile,
  onOpenDispute,
  onExplainWithAi,
  onNavigateToTab,
  onOpenAssessment,
}) => {
  const [showFairLendingAudit, setShowFairLendingAudit] = useState(false);
  const [expandedPillarId, setExpandedPillarId] = useState<string | null>('p-cashflow');

  const overallScore = calculateOverallScore(profile.scorePillars);
  const monthlySurplus = Math.max(0, profile.monthlyInflow - profile.monthlyOutflow);
  const surplusPct = profile.monthlyInflow > 0 ? Math.round((monthlySurplus / profile.monthlyInflow) * 100) : 0;
  const expensePct = profile.monthlyInflow > 0 ? Math.round((profile.monthlyOutflow / profile.monthlyInflow) * 100) : 0;
  const emergencyCoverageMonths = profile.monthlyOutflow > 0 ? (profile.emergencyFund / profile.monthlyOutflow).toFixed(1) : '0';

  // Dynamic Time of Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getScoreBand = (score: number) => {
    if (score >= 80) return { label: 'Healthy & Prime Readiness', shortLabel: 'Healthy', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (score >= 65) return { label: 'Moderate (Recommend Non-Credit First)', shortLabel: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { label: 'Needs Emergency Buffer', shortLabel: 'Needs Attention', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const scoreBand = getScoreBand(overallScore);

  // Dynamic "Why is my score [X]?" reasoning
  const getScoreReasoning = () => {
    if (overallScore >= 80) {
      return `Your financial health is strong at ${overallScore}/100. You maintain a solid monthly savings capacity of ₹${monthlySurplus.toLocaleString('en-IN')} (${surplusPct}% of income) with zero high-interest debt and reliable bill payment consistency. This qualifies you for 0% interest non-credit alternatives and subsidized government schemes.`;
    } else if (overallScore >= 65) {
      return `Your financial health is moderate at ${overallScore}/100. While your cash flow generates a ₹${monthlySurplus.toLocaleString('en-IN')}/mo surplus, your liquid emergency reserve currently covers ${emergencyCoverageMonths} months of expenses. Building this to 2-3 months will significantly raise your score and protect against unexpected financial shocks.`;
    } else {
      return `Your financial health is at ${overallScore}/100. High expense ratio (${expensePct}%) and limited emergency runway (${emergencyCoverageMonths} months) increase vulnerability to debt traps. Prioritize budget optimizations before taking on any new borrowing.`;
    }
  };

  // Dynamic "What can I improve?" recommendations
  const getImprovementSteps = () => {
    const steps = [];
    if (Number(emergencyCoverageMonths) < 2) {
      steps.push({
        title: 'Build Emergency Buffer to 2+ Months',
        desc: `Allocate ₹${Math.round(monthlySurplus * 0.4).toLocaleString('en-IN')}/mo into a liquid reserve to reach ₹${Math.round(profile.monthlyOutflow * 2).toLocaleString('en-IN')}.`,
        impact: '+8 to +12 Score points',
        actionTab: 'cashflow',
        actionLabel: 'Adjust Savings Goal →'
      });
    }
    if (profile.existingDebtObligations === 0) {
      steps.push({
        title: 'Maintain 0% Commercial Debt Exposure',
        desc: `Avoid high-APR instant loan apps for your ₹${profile.fundingNeed.amount.toLocaleString('en-IN')} ${profile.fundingNeed.purpose}. Use 0% peer savings or public subsidies.`,
        impact: 'Protects against debt spiral',
        actionTab: 'borrowing',
        actionLabel: 'Simulate Loan Impact →'
      });
    }
    steps.push({
      title: 'Explore Subsidized Welfare & Grants',
      desc: `You qualify for subsidized government interest rates (~7% p.a. vs 36% commercial apps) and 0% non-credit milestone terms.`,
      impact: `Saves up to ₹${Math.round(profile.fundingNeed.amount * 0.25).toLocaleString('en-IN')} in interest`,
      actionTab: 'schemes',
      actionLabel: 'View Matched Schemes →'
    });
    return steps;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. HERO SECTION: Welcome Greeting & Financial Health Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden transition-colors">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-800/80">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Consent-Based Alternative Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight break-words">
              {getGreeting()}, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Understand your financial health, non-credit readiness, and safety buffers before taking on debt.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap min-w-0">
            {onOpenAssessment && (
              <button
                onClick={onOpenAssessment}
                className="flex-1 sm:flex-none min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                title="Update your income and financial numbers to recalculate your score"
              >
                <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Update Financial Data</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToTab('borrowing')}
              className="flex-1 sm:flex-none min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Borrowing Simulator</span>
            </button>
            <button
              onClick={onExplainWithAi}
              className="flex-1 sm:flex-none min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-100 shrink-0" />
              <span>AI Health Breakdown</span>
            </button>
          </div>
        </div>

        {/* Central Financial Health Score & 4 Key Metrics Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-5 sm:pt-6 items-stretch">
          
          {/* Main Health Score Dial */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 sm:p-6 bg-slate-950/70 border border-slate-800/90 rounded-2xl min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Financial Health Score
            </span>
            
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              {/* Circular Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="stroke-blue-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 - (301.59 * overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{overallScore}</span>
                <span className="text-xs font-semibold text-slate-400">out of 100</span>
              </div>
            </div>

            <div className="mt-3 text-center space-y-1">
              <span className={`inline-block text-xs sm:text-sm font-bold px-3 py-1 rounded-full border ${scoreBand.bg} ${scoreBand.color} ${scoreBand.border}`}>
                {scoreBand.label}
              </span>
              <p className="text-xs text-slate-400 pt-0.5">
                Calculated from 5 verified alternative data pillars
              </p>
            </div>
          </div>

          {/* 4 Key Metrics Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
            
            {/* Metric 1: Monthly Income */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between min-w-0">
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">Monthly Inflow</span>
                <div className="text-xl sm:text-2xl font-bold text-white truncate leading-tight">
                  ₹{profile.monthlyInflow.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Verified regular inflows</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2: Monthly Expenses */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between min-w-0">
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">Monthly Expenses</span>
                <div className="text-xl sm:text-2xl font-bold text-white truncate leading-tight">
                  ₹{profile.monthlyOutflow.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 font-medium truncate">
                  <span>{expensePct}% of monthly income</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3: Savings Capacity */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between min-w-0">
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">Savings Capacity</span>
                <div className="text-xl sm:text-2xl font-bold text-blue-400 truncate leading-tight">
                  ₹{monthlySurplus.toLocaleString('en-IN')} <span className="text-xs sm:text-sm text-slate-400 font-normal">/ mo</span>
                </div>
                <div className="text-xs text-blue-400 font-semibold truncate">
                  <span>{surplusPct}% retained surplus cushion</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 4: Existing EMI & Debt */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between min-w-0">
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">Existing Loan EMI</span>
                <div className="text-xl sm:text-2xl font-bold text-white truncate leading-tight">
                  ₹{profile.existingDebtObligations.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-blue-400 font-semibold truncate">
                  <span>0% debt burden (Clean Slate)</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>

          </div>

        </div>

        {/* Stated Need Banner & View Detailed Analysis CTA */}
        <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 block leading-tight">Target Financial Goal:</span>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                ₹{profile.fundingNeed.amount.toLocaleString('en-IN')} for {profile.fundingNeed.purpose}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('financial-health')}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>View Detailed Financial Health Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 2. EXPLAINABLE REASONING & WHAT TO IMPROVE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Why is my score [X]? */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Why is my score {overallScore}/100?</h2>
              <p className="text-xs sm:text-sm text-slate-400">Plain-language explanation based on your verified data</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-slate-800">
            {getScoreReasoning()}
          </p>

          <div className="space-y-2.5 pt-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-300">Core Diagnostic Factors:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-400 block mb-0.5">Cash Flow Regularity:</span>
                <p className="text-blue-400 font-bold text-sm sm:text-base">18 days/month active</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-400 block mb-0.5">Bill Settlement Rate:</span>
                <p className="text-blue-400 font-bold text-sm sm:text-base">100% on-time records</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-400 block mb-0.5">Debt-to-Income:</span>
                <p className="text-blue-400 font-bold text-sm sm:text-base">0.0% (Clean Slate)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-400 block mb-0.5">Emergency Cushion:</span>
                <p className="text-amber-400 font-bold text-sm sm:text-base">{emergencyCoverageMonths} Months Runway</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: What can I improve? */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">What can I improve?</h2>
                <p className="text-xs sm:text-sm text-slate-400">Prioritized, high-impact actions</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              3 Recommendations
            </span>
          </div>

          <div className="space-y-3">
            {getImprovementSteps().map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{item.title}</span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800 whitespace-nowrap">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                <div className="pt-1.5">
                  <button
                    onClick={() => onNavigateToTab(item.actionTab)}
                    className="text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. 5 EXPLAINABLE CREDIT-READINESS PILLARS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">5 Explainable Credit & Financial Health Pillars</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Transparent, mathematical, and directly correctable if you notice discrepancies.
            </p>
          </div>
          <button
            id="btn-toggle-fair-lending"
            onClick={() => setShowFairLendingAudit(!showFairLendingAudit)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-blue-500/30 text-xs sm:text-sm font-semibold text-blue-300 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Lock className="w-4 h-4 text-blue-400" />
            <span>{showFairLendingAudit ? 'Hide Anti-Bias Audit' : 'Verify Zero-Bias (0%)'}</span>
          </button>
        </div>

        {/* Collapsible Fair Lending Audit Box */}
        {showFairLendingAudit && (
          <div className="bg-slate-900 border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Fair Lending Anti-Bias Verification Certificate</h3>
                  <p className="text-xs text-slate-400">
                    Proof of Zero Ingestion of Protected Demographic & Geographic Characteristics
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                ECOA & DPDP Compliant
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-slate-800">
              In accordance with Fair Lending standards, all demographic attributes (gender, caste, religion, pin code, photo ID) are assigned <strong>exactly 0.00% statistical weight</strong>. Your score is derived purely from consented behavioral cash flow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {PROTECTED_CHARACTERISTICS_AUDIT.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-white">{item.attribute}</span>
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                      0.0% Weight
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pillars List */}
        <div className="grid grid-cols-1 gap-4">
          {profile.scorePillars.map((pillar) => {
            const isExpanded = expandedPillarId === pillar.id;
            return (
              <div
                key={pillar.id}
                id={`pillar-card-${pillar.id}`}
                className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
                  isExpanded ? 'border-blue-500/40 bg-slate-900/95 shadow-md' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg sm:text-xl font-extrabold text-blue-400">{pillar.score}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">/ 100</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white">{pillar.name}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                          Weight: {Math.round(pillar.weight * 100)}%
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          pillar.grade === 'Excellent' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {pillar.grade}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{pillar.summary}</p>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      id={`btn-dispute-${pillar.id}`}
                      onClick={() => onOpenDispute(pillar)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      title="Dispute or submit updated proof for this metric"
                    >
                      <Edit3 className="w-4 h-4 text-blue-400" />
                      <span>Dispute / Correct</span>
                    </button>

                    <button
                      onClick={() => setExpandedPillarId(isExpanded ? null : pillar.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>

                {/* Expanded Contributing Factors */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-3.5 animate-in fade-in duration-150">
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs sm:text-sm">
                      <span className="font-semibold text-slate-200">Benchmark Standard:</span>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">{pillar.benchmark}</p>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">Verified Contributing Factors:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pillar.factors.map((factor, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold text-white">{factor.label}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{factor.description}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-300 shrink-0 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                              {factor.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM QUICK NAVIGATION MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
        <button
          id="btn-nav-borrowing"
          onClick={() => onNavigateToTab('borrowing')}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-sm font-bold text-white group-hover:text-rose-300">
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-400" />
              Borrowing & Debt Simulator
            </span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
            Compare Before vs After impact of loan EMIs on your savings cushion and health score.
          </p>
        </button>

        <button
          id="btn-nav-alternatives"
          onClick={() => onNavigateToTab('alternatives')}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-sm font-bold text-white group-hover:text-blue-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Non-Credit Alternatives
            </span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
            Peer savings circles (0% interest), emergency savings sprints, and supplier terms.
          </p>
        </button>

        <button
          id="btn-nav-schemes"
          onClick={() => onNavigateToTab('schemes')}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-sm font-bold text-white group-hover:text-amber-300">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Matched Public Schemes
            </span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
            Discover PM SVANidhi, Vidyalaxmi CSIS, and MUDRA government welfare facilities.
          </p>
        </button>
      </div>

    </div>
  );
};
