import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Coins, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  Store, 
  Bike,
  Building2,
  Lock,
  FileCheck2,
  RotateCcw
} from 'lucide-react';
import { PersonaType, UserProfile } from '../types';
import { FinancialIntakeData, generatePersonalizedProfile } from '../lib/scoreEngine';
import { dbService } from '../lib/databaseService';

interface FinancialIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (newProfile: UserProfile) => void;
  initialPersona?: PersonaType;
  existingProfile?: UserProfile | null;
  currentUser?: any;
}

export const FinancialIntakeModal: React.FC<FinancialIntakeModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
  initialPersona = 'student',
  existingProfile = null,
  currentUser = null,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<FinancialIntakeData>({
    name: '',
    personaType: initialPersona,
    title: '',
    location: 'Bengaluru, India',
    monthlyInflow: 25000,
    monthlyOutflow: 15000,
    emergencyFund: 10000,
    existingDebtObligations: 0,
    billOnTimePercent: 95,
    inflowFrequency: 'bi-weekly',
    academicOrVintageInfo: 'Degree program / Registered micro-operation',
    fundingAmount: 30000,
    fundingPurpose: 'Laptop / Business Inventory / Professional Tools',
    targetTimelineMonths: 2,
    selectedConsents: ['banking', 'telecom', 'academics'],
  });

  // Pre-fill form data from existing saved profile or user authentication whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const isDemo = existingProfile && ['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(existingProfile.id);
      
      const defaultName = (!isDemo && existingProfile?.name) 
        ? existingProfile.name 
        : currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : '');

      const billsScore = existingProfile?.scorePillars?.find((p) => p.id === 'p-bills')?.score;
      const estimatedBillPct = billsScore ? Math.min(100, Math.max(60, Math.round(billsScore / 0.9))) : 95;

      setFormData({
        name: defaultName,
        personaType: existingProfile?.personaType || initialPersona,
        title: (!isDemo && existingProfile?.title) ? existingProfile.title : '',
        location: existingProfile?.location || 'Bengaluru, India',
        monthlyInflow: existingProfile?.monthlyInflow ?? 25000,
        monthlyOutflow: existingProfile?.monthlyOutflow ?? 15000,
        emergencyFund: existingProfile?.emergencyFund ?? 10000,
        existingDebtObligations: existingProfile?.existingDebtObligations ?? 0,
        billOnTimePercent: estimatedBillPct,
        inflowFrequency: (existingProfile?.cashflowTransactions && existingProfile.cashflowTransactions.length > 5 ? 'weekly' : 'bi-weekly') as any,
        academicOrVintageInfo: existingProfile?.scorePillars?.find((p) => p.id === 'p-vintage')?.summary || 'Degree program / Registered micro-operation',
        fundingAmount: existingProfile?.fundingNeed?.amount ?? 30000,
        fundingPurpose: existingProfile?.fundingNeed?.purpose || 'Laptop / Business Inventory / Professional Tools',
        targetTimelineMonths: existingProfile?.fundingNeed?.targetDateMonths ?? 2,
        selectedConsents: existingProfile?.consentSources && existingProfile.consentSources.length > 0
          ? existingProfile.consentSources.map((s) => s.category)
          : ['banking', 'telecom', 'academics'],
      });
    }
  }, [isOpen, existingProfile, currentUser, initialPersona]);

  if (!isOpen) return null;

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine canonical profile ID
      let targetProfileId: string | undefined = undefined;
      const isDemo = existingProfile && ['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(existingProfile.id);
      
      if (existingProfile?.id && !isDemo) {
        targetProfileId = existingProfile.id;
      } else if (currentUser && !currentUser.isAnonymous) {
        targetProfileId = `user_${currentUser.uid}`;
      }

      // 1. Generate the personalizedProfile immediately using the user's actual entered formData and canonical ID
      const personalizedProfile = generatePersonalizedProfile(formData, targetProfileId);
      
      // 2. Immediately call onProfileCreated and close the modal so dashboard displays with zero delay
      onProfileCreated(personalizedProfile);
      onClose();

      // 3 & 4. Save to Firebase and log audit asynchronously in the background if authenticated or in guest mode
      (async () => {
        try {
          const uid = dbService.getUserId();
          if (uid) {
            await Promise.all([
              dbService.saveUserProfile(personalizedProfile),
              dbService.logAudit({
                userId: uid,
                action: 'SCORE_GENERATED',
                details: `Personalized alternative credit assessment generated for ${personalizedProfile.name}`,
                targetEntity: personalizedProfile.id,
                timestamp: new Date(),
                zeroDemographicVerified: true,
              })
            ]);
          }
        } catch (bgError) {
          // Gracefully log background persistence error without disrupting user experience
          console.warn('Background Firestore save after intake:', bgError);
        }
      })();
    } catch (error) {
      console.error('Error generating financial assessment:', error);
      const fallbackProfile = generatePersonalizedProfile(formData);
      onProfileCreated(fallbackProfile);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConsent = (consentKey: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedConsents: prev.selectedConsents.includes(consentKey)
        ? prev.selectedConsents.filter((c) => c !== consentKey)
        : [...prev.selectedConsents, consentKey],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                Personalized Financial Health & Credit Intake
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Step {step} of 4 • 100% Zero Demographic Bias Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2 cursor-pointer"
            aria-label="Close intake"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/50 text-xs shrink-0">
          {[
            { num: 1, label: '1. Identity & Role' },
            { num: 2, label: '2. Cashflow & Income' },
            { num: 3, label: '3. Expenses & Savings' },
            { num: 4, label: '4. Capital & Consent' },
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2 px-3 text-center font-semibold border-b-2 transition-all ${
                step === s.num
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : step > s.num
                  ? 'border-slate-600 text-slate-300'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* STEP 1: Identity & Persona */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name or Display Moniker
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma or Rajesh Kumar"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Your Financial Persona Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: 'student', title: 'College Student', desc: 'Stipends, part-time & education goals', icon: GraduationCap },
                    { type: 'micro-entrepreneur', title: 'Micro-Entrepreneur', desc: 'Shop owner, merchant QR & inventory', icon: Store },
                    { type: 'gig-worker', title: 'Gig Worker / Freelancer', desc: 'Platform payouts & independent gigs', icon: Bike },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = formData.personaType === p.type;
                    return (
                      <button
                        type="button"
                        key={p.type}
                        onClick={() => setFormData({ ...formData, personaType: p.type as PersonaType })}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-950/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                            {p.title}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {p.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Professional Headline / Major
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={
                      formData.personaType === 'student'
                        ? 'e.g. B.Tech Computer Science (Final Year)'
                        : formData.personaType === 'micro-entrepreneur'
                        ? 'e.g. Apparel Boutique & Tailoring'
                        : 'e.g. Delivery Partner & Freelance Cook'
                    }
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cash Inflow & Velocity */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 text-xs text-slate-300 space-y-1">
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Cashflow Inflow Analysis
                </span>
                <p>
                  FinShield analyzes your real earning velocity and regular deposit intervals instead of relying on outdated bureaucratic credit scores.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Average Monthly Inflow (₹)
                  </label>
                  <span className="text-sm font-bold text-blue-400 font-mono">
                    ₹{Number(formData.monthlyInflow || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={formData.monthlyInflow}
                  onChange={(e) => setFormData({ ...formData, monthlyInflow: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Inflow Arrival Frequency & Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'daily', label: 'Daily (QR/Sales)' },
                    { id: 'weekly', label: 'Weekly (Gig)' },
                    { id: 'bi-weekly', label: 'Bi-Weekly (Milestones)' },
                    { id: 'monthly', label: 'Monthly (Stipend)' },
                  ].map((freq) => (
                    <button
                      type="button"
                      key={freq.id}
                      onClick={() => setFormData({ ...formData, inflowFrequency: freq.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                        formData.inflowFrequency === freq.id
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Accreditation / Platform Vintage Note
                </label>
                <input
                  type="text"
                  value={formData.academicOrVintageInfo}
                  onChange={(e) => setFormData({ ...formData, academicOrVintageInfo: e.target.value })}
                  placeholder="e.g. 8.2 CGPA in Engineering or 3+ years active shop on Udyam"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Expenses, Obligations & Savings */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Monthly Baseline Outflow / Expenses (₹)
                    </label>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      ₹{Number(formData.monthlyOutflow || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={formData.monthlyOutflow}
                    onChange={(e) => setFormData({ ...formData, monthlyOutflow: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Rent, materials, food, utilities, connectivity</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Existing Active EMIs / Loans (₹/mo)
                    </label>
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      ₹{Number(formData.existingDebtObligations || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formData.existingDebtObligations}
                    onChange={(e) => setFormData({ ...formData, existingDebtObligations: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Enter 0 if completely debt-free</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Current Liquid Emergency Savings Cushion (₹)
                  </label>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    ₹{Number(formData.emergencyFund || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={formData.emergencyFund}
                  onChange={(e) => setFormData({ ...formData, emergencyFund: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Cash in bank, micro-recurring deposit, digital gold</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telecom & Utility On-Time Bill Payment Record
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={60}
                    max={100}
                    value={formData.billOnTimePercent}
                    onChange={(e) => setFormData({ ...formData, billOnTimePercent: Number(e.target.value) })}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-400 font-mono w-14 text-right">
                    {formData.billOnTimePercent}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Occasional Delays (60%)</span>
                  <span>Flawless 100% On-Time</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Capital Requirement & Consented Data */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Funding Target Capital Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formData.fundingAmount}
                    onChange={(e) => setFormData({ ...formData, fundingAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Timeline
                  </label>
                  <select
                    value={formData.targetTimelineMonths}
                    onChange={(e) => setFormData({ ...formData, targetTimelineMonths: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Month (Urgent Requirement)</option>
                    <option value={2}>2 Months (Planned Upgrade)</option>
                    <option value={3}>3 Months (Seasonal Buffer)</option>
                    <option value={6}>6 Months (Long-Term Capital)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Capital Purpose / Objective
                </label>
                <input
                  type="text"
                  required
                  value={formData.fundingPurpose}
                  onChange={(e) => setFormData({ ...formData, fundingPurpose: e.target.value })}
                  placeholder="e.g. M2 Laptop for freelance dev work or Silk raw material lot"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Consented Alternative Data Verification Streams
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'banking', name: 'UPI & Inflow Cash Velocity', desc: 'RBI Account Aggregator tokenized stream' },
                    { id: 'telecom', name: 'Broadband & Postpaid Recharges', desc: 'Digital utility invoice verification' },
                    { id: 'academics', name: 'DigiLocker / Udyam Certificate', desc: 'Accredited enrollment or MSME registration' },
                  ].map((stream) => {
                    const isChecked = formData.selectedConsents.includes(stream.id);
                    return (
                      <div
                        key={stream.id}
                        onClick={() => toggleConsent(stream.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-950/30 border-blue-600/60 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="accent-blue-500 rounded"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-200">{stream.name}</span>
                            <p className="text-[11px] text-slate-400">{stream.desc}</p>
                          </div>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !formData.name.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-950/50 disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.fundingPurpose.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-950/80 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-blue-200 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Generating Your Profile...' : 'Generate Personalized Dashboard'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
