import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Percent, 
  ArrowRight, 
  Coins, 
  Zap, 
  Scale, 
  TrendingUp, 
  Sparkles,
  TrendingDown,
  Info,
  Lightbulb,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateOverallScore } from '../data/mockProfiles';

interface DebtSimulatorProps {
  profile: UserProfile;
  onNavigateToTab: (tabId: string) => void;
}

export const DebtSimulator: React.FC<DebtSimulatorProps> = ({
  profile,
  onNavigateToTab,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(profile.fundingNeed.amount || 35000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [commercialApr, setCommercialApr] = useState<number>(36); // e.g. Instant loan app / BNPL rate
  const [processingFeePct, setProcessingFeePct] = useState<number>(3.5);

  const baselineScore = calculateOverallScore(profile.scorePillars);
  const monthlySurplus = Math.max(0, profile.monthlyInflow - profile.monthlyOutflow);

  // Financial Math Helper: Monthly EMI calculation
  const calculateEmi = (principal: number, annualRatePct: number, months: number) => {
    if (annualRatePct === 0) return principal / months;
    const monthlyRate = annualRatePct / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  // Option 1: Commercial / Instant Loan App (High APR)
  const commercialEmi = calculateEmi(loanAmount, commercialApr, tenureMonths);
  const commercialTotalRepayment = commercialEmi * tenureMonths;
  const commercialUpfrontFee = Math.round((loanAmount * processingFeePct) / 100);
  const commercialTotalCost = (commercialTotalRepayment - loanAmount) + commercialUpfrontFee;
  const commercialInHandDisbursal = loanAmount - commercialUpfrontFee;

  // Remaining savings capacity after commercial loan EMI
  const remainingSavingsWithLoan = Math.max(0, monthlySurplus - commercialEmi);
  const savingsReductionPct = monthlySurplus > 0 ? Math.round(((monthlySurplus - remainingSavingsWithLoan) / monthlySurplus) * 100) : 100;

  // Option 2: Subsidized Public Scheme (e.g. PM SVANidhi / Mudra ~7% effective rate)
  const subsidizedApr = 7.0;
  const subsidizedEmi = calculateEmi(loanAmount, subsidizedApr, tenureMonths);
  const subsidizedTotalRepayment = subsidizedEmi * tenureMonths;
  const subsidizedTotalCost = subsidizedTotalRepayment - loanAmount;

  // Option 3: Non-Credit Peer Savings / Buffer Plan (0% Interest, 0% Fees)
  const nonCreditEmi = Math.round(loanAmount / tenureMonths);
  const nonCreditTotalCost = 0;

  // Debt Burden Ratio (EMI as % of monthly surplus)
  const commercialDebtBurdenRatio = monthlySurplus > 0 ? (commercialEmi / monthlySurplus) * 100 : 100;

  // Calculate Projected Financial Health Score with New Loan
  const calculateProjectedScore = () => {
    let penalty = 0;
    if (commercialDebtBurdenRatio > 50) penalty = 26;
    else if (commercialDebtBurdenRatio > 35) penalty = 18;
    else if (commercialDebtBurdenRatio > 20) penalty = 10;
    else penalty = 4;
    return Math.max(35, baselineScore - penalty);
  };

  const projectedScore = calculateProjectedScore();
  const scoreDrop = baselineScore - projectedScore;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Predatory Debt Safeguard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Responsible Borrowing & Debt Trap Simulator
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 leading-relaxed max-w-3xl">
            Compare Before vs After scenarios to see how a new loan directly impacts your savings capacity and health score.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('alternatives')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-md shadow-blue-950/50 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Explore 0% Non-Credit Options</span>
        </button>
      </div>

      {/* Simulator Interactive Control Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Interactive Loan Parameter Controls</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Adjust amount, tenure, and APR to see real-time impact</p>
          </div>
          <span className="text-xs sm:text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 font-semibold hidden sm:inline-block">
            Live Math Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Slider 1: Loan Amount */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="loan-amount-range" className="text-slate-200 font-semibold">Funding Need / Loan Amount:</label>
              <span className="text-blue-400 font-bold text-sm sm:text-base bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                ₹{loanAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              id="loan-amount-range"
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              aria-label="Funding Need or Loan Amount"
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>₹5,000 (Micro)</span>
              <span>₹50,000 (Mid)</span>
              <span>₹1.5 Lakhs (Max)</span>
            </div>
          </div>

          {/* Slider 2: Tenure Months */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="tenure-months-range" className="text-slate-200 font-semibold">Repayment Period:</label>
              <span className="text-indigo-400 font-bold text-sm sm:text-base bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {tenureMonths} Months
              </span>
            </div>
            <input
              id="tenure-months-range"
              type="range"
              min="3"
              max="24"
              step="3"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              aria-label="Repayment Horizon in Months"
              className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>3 Mos</span>
              <span>6 Mos</span>
              <span>12 Mos</span>
              <span>24 Mos</span>
            </div>
          </div>

          {/* Slider 3: Commercial Loan APR */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="commercial-apr-range" className="text-slate-200 font-semibold">Lender APR Rate:</label>
              <span className="text-rose-400 font-bold text-sm sm:text-base bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {commercialApr}% p.a.
              </span>
            </div>
            <input
              id="commercial-apr-range"
              type="range"
              min="12"
              max="48"
              step="2"
              value={commercialApr}
              onChange={(e) => setCommercialApr(Number(e.target.value))}
              aria-label="Instant Loan or App APR Percentage"
              className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>12% (Bank)</span>
              <span>24% (NBFC)</span>
              <span>36%-48% (Instant App)</span>
            </div>
          </div>

        </div>

        {/* 1. VISUAL BEFORE VS AFTER COMPARISON CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Card A: WITHOUT NEW LOAN */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border-2 border-blue-500/40 space-y-5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                ✓ Current State: WITHOUT NEW LOAN
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-400">Score: {baselineScore}/100</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Monthly Savings Capacity:</span>
                <span className="font-bold text-blue-400 text-sm sm:text-base">₹{monthlySurplus.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Debt Service Burden:</span>
                <span className="font-bold text-blue-400">0.0% (Safe Cushion)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Financial Health Status:</span>
                <span className="font-bold text-blue-300">Healthy & Unburdened</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Vulnerability to Penalties:</span>
                <span className="font-semibold text-slate-300">Zero Default Risk</span>
              </div>
            </div>
          </div>

          {/* Card B: WITH NEW LOAN */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border-2 border-rose-500/40 space-y-5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                ⚠️ Projected State: WITH NEW LOAN
              </span>
              <span className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                Score: {projectedScore}/100 (-{scoreDrop} pts)
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Estimated Monthly EMI:</span>
                <span className="font-bold text-rose-400 text-sm sm:text-base">₹{commercialEmi.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Remaining Savings Cushion:</span>
                <span className="font-bold text-amber-300">₹{remainingSavingsWithLoan.toLocaleString('en-IN')} / mo (-{savingsReductionPct}%)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Debt Burden on Surplus:</span>
                <span className={`font-bold ${commercialDebtBurdenRatio > 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {commercialDebtBurdenRatio.toFixed(1)}% of Surplus Eaten
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Total Interest & Fees Paid:</span>
                <span className="font-bold text-rose-300">₹{commercialTotalCost.toLocaleString('en-IN')} out-of-pocket</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2. FINSHIELD AI FINANCIAL INSIGHT CARD */}
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">FinShield Analysis & Recommendation</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Automated diagnostic based on your monthly cash flow metrics</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Ethical Diagnostic
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            Based on your current monthly income of ₹{profile.monthlyInflow.toLocaleString('en-IN')} and monthly expenses of ₹{profile.monthlyOutflow.toLocaleString('en-IN')}, taking this ₹{loanAmount.toLocaleString('en-IN')} loan at {commercialApr}% APR will reduce your estimated monthly savings capacity by <strong>{savingsReductionPct}%</strong> (from ₹{monthlySurplus.toLocaleString('en-IN')} down to ₹{remainingSavingsWithLoan.toLocaleString('en-IN')}/mo).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Why This Matters */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Why this matters:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                An EMI of ₹{commercialEmi.toLocaleString('en-IN')} consumes {commercialDebtBurdenRatio.toFixed(1)}% of your monthly buffer. If a minor income fluctuation occurs, you risk trigger penalties and high late fees.
              </p>
            </div>

            {/* Recommended Next Steps */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-blue-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Recommended next steps:
              </span>
              <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Opt for 0% interest non-credit peer savings circle.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Apply for matched subsidized scheme (~7% p.a.).</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Stagger payment milestones to avoid taking debt.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 3-WAY SIDE-BY-SIDE COMPARISON MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Commercial / Instant Loan App */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/40 space-y-5 relative flex flex-col justify-between shadow-lg transition-colors">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Commercial / Instant Loan App
              </span>
              <span className="text-xs sm:text-sm font-bold text-rose-400">{commercialApr}% APR</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">Commercial Debt Option</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              High interest rates + upfront {processingFeePct}% processing fee deducted from disbursal.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Monthly EMI Payment:</span>
                <span className="font-bold text-rose-400 text-sm sm:text-base">₹{commercialEmi.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Upfront Deductions (Fees):</span>
                <span className="text-slate-300 font-medium">₹{commercialUpfrontFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Actual In-Hand Received:</span>
                <span className="text-slate-300 font-semibold">₹{commercialInHandDisbursal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Interest & Fees Paid:</span>
                <span className="font-bold text-rose-300 text-sm sm:text-base">₹{commercialTotalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
                <span className="text-white">Total Out-of-Pocket Outflow:</span>
                <span className="text-white text-sm sm:text-base">₹{(commercialTotalRepayment + commercialUpfrontFee).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300 leading-relaxed">
              ⚠️ <strong>Hidden Trap:</strong> Missed due date triggers ₹500/day bounce fee + 48% compound penalty.
            </div>
          </div>
        </div>

        {/* Card 2: Subsidized Government Scheme */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 space-y-5 relative flex flex-col justify-between shadow-lg transition-colors">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Subsidized Public Scheme
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">~7% Effective APR</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">Government Welfare Scheme</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              PM SVANidhi, MUDRA Shishu, or Vidyalaxmi CSIS with interest subvention.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Monthly EMI Payment:</span>
                <span className="font-bold text-amber-300 text-sm sm:text-base">₹{subsidizedEmi.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Upfront Processing Fee:</span>
                <span className="text-blue-400 font-semibold">₹0 (Zero Charges)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Actual In-Hand Received:</span>
                <span className="text-slate-300 font-semibold">₹{loanAmount.toLocaleString('en-IN')} (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Interest Paid:</span>
                <span className="font-bold text-amber-300 text-sm sm:text-base">₹{subsidizedTotalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
                <span className="text-white">Savings vs Commercial Loan:</span>
                <span className="text-blue-400 text-sm sm:text-base">Saves ₹{(commercialTotalCost - subsidizedTotalCost).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateToTab('schemes')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Matched Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: Non-Credit Alternative */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-500/60 space-y-5 relative flex flex-col justify-between shadow-xl transition-colors">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                ⭐ Recommended Non-Credit
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-400">0% Interest • ₹0 Debt</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">Peer Savings & Cashflow Sprint</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Peer micro-savings circle (ROSCA), staggered supplier milestone terms, or emergency grant.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Monthly Contribution / Save:</span>
                <span className="font-bold text-blue-300 text-sm sm:text-base">₹{nonCreditEmi.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Interest / Hidden Fees:</span>
                <span className="text-blue-400 font-bold">₹0.00 (Zero)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Capital Accumulated:</span>
                <span className="text-white font-bold">₹{loanAmount.toLocaleString('en-IN')} (100% Asset)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Default & Legal Risk:</span>
                <span className="text-blue-400 font-semibold">Zero Credit Risk</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
                <span className="text-white">Total Savings vs Loan:</span>
                <span className="text-blue-400 text-base sm:text-lg font-extrabold">+₹{commercialTotalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateToTab('alternatives')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-950/50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Activate Non-Credit Plan</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
