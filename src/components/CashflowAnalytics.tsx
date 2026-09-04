import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Zap,
  PlusCircle,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, CashflowEntry } from '../types';

interface CashflowAnalyticsProps {
  profile: UserProfile;
  onAddTransaction: (entry: Omit<CashflowEntry, 'id'>) => void;
}

export const CashflowAnalytics: React.FC<CashflowAnalyticsProps> = ({
  profile,
  onAddTransaction,
}) => {
  const [savingsRatePercent, setSavingsRatePercent] = useState<number>(75);
  const [activeStressScenario, setActiveStressScenario] = useState<'none' | 'income-drop' | 'medical-shock'>('none');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Form State for new entry
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'inflow' | 'outflow'>('inflow');
  const [newCategory, setNewCategory] = useState('General');

  // Baseline figures
  const baselineInflow = profile.monthlyInflow;
  const baselineOutflow = profile.monthlyOutflow;
  const baselineSurplus = baselineInflow - baselineOutflow;

  // Stress-tested figures
  let effectiveInflow = baselineInflow;
  let effectiveOutflow = baselineOutflow;

  if (activeStressScenario === 'income-drop') {
    effectiveInflow = Math.round(baselineInflow * 0.80); // 20% decline
  } else if (activeStressScenario === 'medical-shock') {
    effectiveOutflow = baselineOutflow + 5000; // Sudden ₹5,000 shock
  }

  const effectiveSurplus = effectiveInflow - effectiveOutflow;
  const monthlySavingsAllocated = Math.max(0, Math.round((effectiveSurplus * savingsRatePercent) / 100));

  // Months to reach user's goal with non-credit savings
  const targetGoalAmount = profile.fundingNeed.amount;
  const monthsToGoalDebtFree = monthlySavingsAllocated > 0 
    ? (targetGoalAmount / monthlySavingsAllocated).toFixed(1) 
    : '∞';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      type: newType,
      category: newCategory,
      amount: Number(newAmount),
      isRecurring: true,
      isConsentedData: true,
    });

    setNewTitle('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const filteredTransactions = profile.cashflowTransactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Cash Flow & Savings Capacity Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 leading-relaxed max-w-3xl">
            Real-time analysis of consented income velocity, fixed commitments, and safe surplus capacity.
          </p>
        </div>

        <button
          id="btn-add-cashflow-record"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold self-start sm:self-auto transition-colors shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Consented Transaction</span>
        </button>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Monthly Inflow */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
            <span>Consented Monthly Inflow</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{effectiveInflow.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-blue-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified via UPI / Gig Statement</span>
          </div>
        </div>

        {/* Monthly Outflow */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
            <span>Essential Monthly Burn</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{effectiveOutflow.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">
            Fixed rent, utilities & living costs
          </div>
        </div>

        {/* Net Operating Surplus */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
            <span>Net Operating Surplus</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${effectiveSurplus >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            ₹{effectiveSurplus.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">
            Margin: {Math.round((effectiveSurplus / effectiveInflow) * 100)}% of total income
          </div>
        </div>

        {/* Liquid Emergency Buffer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
            <span>Emergency Reserve Fund</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{profile.emergencyFund.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-300 font-medium">
            Covers {(profile.emergencyFund / effectiveOutflow).toFixed(1)} months of burn
          </div>
        </div>

      </div>

      {/* Middle Section: Safe Savings Capacity Planner & Stress-Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Safe Savings Capacity Goal Simulator */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Debt-Free Savings Capacity Planner</h3>
                <p className="text-xs sm:text-sm text-slate-400">How quickly you can self-fund your goal without taking high-interest debt</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              0% Interest
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Current Target Goal:</span>
              <span className="text-white font-bold">{profile.fundingNeed.purpose}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Required Capital Amount:</span>
              <span className="text-blue-400 font-bold text-sm sm:text-base">₹{targetGoalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Allocation Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor="savings-capacity-slider" className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                Monthly Surplus Allocation to Goal:
              </label>
              <span className="text-blue-400 font-bold text-sm bg-slate-800 px-2.5 py-1 rounded-lg">
                {savingsRatePercent}% (₹{monthlySavingsAllocated.toLocaleString('en-IN')}/mo)
              </span>
            </div>
            <input
              id="savings-capacity-slider"
              type="range"
              min="25"
              max="100"
              step="5"
              value={savingsRatePercent}
              onChange={(e) => setSavingsRatePercent(Number(e.target.value))}
              aria-label="Monthly Surplus Allocation to Goal Percentage"
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Conservative (25%)</span>
              <span>Balanced (50%)</span>
              <span>Disciplined (75%)</span>
              <span>Max Sprint (100%)</span>
            </div>
          </div>

          {/* Forecast Result Box */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-950 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Debt-Free Milestone Timeline</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {monthsToGoalDebtFree} Months
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Saving ₹{monthlySavingsAllocated.toLocaleString('en-IN')} / month achieves ₹{targetGoalAmount.toLocaleString('en-IN')} in full.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-700/40 text-center shrink-0">
              <span className="text-xs text-blue-300 font-semibold block">Interest & Fees Saved</span>
              <span className="text-base sm:text-lg font-extrabold text-blue-300">
                ₹{Math.round(targetGoalAmount * 0.18).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">vs Commercial 24% Loan</span>
            </div>
          </div>
        </div>

        {/* Stress-Testing Shock Engine */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Cashflow Resilience Stress-Test</h3>
              <p className="text-xs sm:text-sm text-slate-400">Simulate financial disruptions before committing to any payment plans</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">Select a Stress Scenario:</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button
                id="btn-stress-none"
                onClick={() => setActiveStressScenario('none')}
                className={`p-3.5 rounded-xl border text-left transition-all text-xs sm:text-sm cursor-pointer ${
                  activeStressScenario === 'none'
                    ? 'bg-slate-800 border-blue-500/50 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Baseline Normal Flow</span>
                  <span className="text-xs text-blue-400 font-semibold">Surplus: ₹{baselineSurplus.toLocaleString('en-IN')}</span>
                </div>
              </button>

              <button
                id="btn-stress-income-drop"
                onClick={() => setActiveStressScenario('income-drop')}
                className={`p-3.5 rounded-xl border text-left transition-all text-xs sm:text-sm cursor-pointer ${
                  activeStressScenario === 'income-drop'
                    ? 'bg-amber-950/30 border-amber-500/50 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>20% Gig Inflow / Revenue Drop</span>
                  <span className="text-xs text-amber-400 font-semibold">-₹{Math.round(baselineInflow * 0.2).toLocaleString('en-IN')}/mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simulates seasonal downturns, client contract pauses, or gig slow weeks.
                </p>
              </button>

              <button
                id="btn-stress-medical"
                onClick={() => setActiveStressScenario('medical-shock')}
                className={`p-3.5 rounded-xl border text-left transition-all text-xs sm:text-sm cursor-pointer ${
                  activeStressScenario === 'medical-shock'
                    ? 'bg-rose-950/30 border-rose-500/50 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Sudden Expense Shock (₹5,000)</span>
                  <span className="text-xs text-rose-400 font-semibold">+₹5,000 Outflow</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simulates emergency vehicle repair, medical prescription, or device breakdown.
                </p>
              </button>
            </div>
          </div>

          {/* Stress Result Diagnostic */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs sm:text-sm">
            <span className="font-semibold text-slate-200 block">Stress Simulation Diagnostic:</span>
            {effectiveSurplus > 2000 ? (
              <p className="text-blue-300 leading-relaxed">
                Resilient! Even under this shock, your cash flow maintains a positive surplus of <strong>₹{effectiveSurplus.toLocaleString('en-IN')}</strong>.
              </p>
            ) : effectiveSurplus >= 0 ? (
              <p className="text-amber-300 leading-relaxed">
                Tight margin. Surplus drops to <strong>₹{effectiveSurplus.toLocaleString('en-IN')}</strong>. Do NOT take any debt with fixed monthly EMIs!
              </p>
            ) : (
              <p className="text-rose-300 leading-relaxed">
                Negative Cashflow Warning! Deficit of <strong>₹{Math.abs(effectiveSurplus).toLocaleString('en-IN')}</strong>. Use your emergency reserve and activate non-credit aid immediately.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Consented Transaction Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Consented Cashflow Ledger</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Granular transaction items securely shared via consented Account Aggregator & receipt tokens.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({profile.cashflowTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('inflow')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filterType === 'inflow' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inflows
            </button>
            <button
              onClick={() => setFilterType('outflow')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filterType === 'outflow' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outflows
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-850/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  tx.type === 'inflow' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {tx.type === 'inflow' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-semibold text-white">{tx.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">{tx.date} • Consented Source</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-sm sm:text-base font-bold ${
                  tx.type === 'inflow' ? 'text-blue-400' : 'text-slate-200'
                }`}>
                  {tx.type === 'inflow' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">
                  {tx.isRecurring ? 'Recurring' : 'One-time'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Record Consented Cashflow Entry</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Add a verified transaction, stipend payout, utility settlement, or client advance.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5 text-xs sm:text-sm">Transaction Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freelance Web App Milestone"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs sm:text-sm">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 8500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs sm:text-sm">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="inflow">Inflow (Earnings/Stipend)</option>
                    <option value="outflow">Outflow (Expense/Bill)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1.5 text-xs sm:text-sm">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Retail Sales, Tutoring, Software"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Save Consented Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
