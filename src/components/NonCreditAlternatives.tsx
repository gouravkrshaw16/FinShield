import React, { useState } from 'react';
import { 
  Users, 
  PiggyBank, 
  Handshake, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertCircle,
  FileText,
  Clock,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, NonCreditOption } from '../types';
import { NON_CREDIT_OPTIONS } from '../data/nonCreditOptions';

interface NonCreditAlternativesProps {
  profile: UserProfile;
  onOpenAiCoach: (initialPrompt?: string) => void;
}

export const NonCreditAlternatives: React.FC<NonCreditAlternativesProps> = ({
  profile,
  onOpenAiCoach,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeOption, setActiveOption] = useState<NonCreditOption | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [aiCustomRecommendations, setAiCustomRecommendations] = useState<any[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeCommitment, setActiveCommitment] = useState<string | null>(null);

  const tags = ['All', 'Peer Savings', 'Budget Optimization', 'Trade Credit', 'Emergency Aid'];

  const filteredOptions = NON_CREDIT_OPTIONS.filter((opt) => {
    if (selectedTag === 'All') return true;
    return opt.tag === selectedTag;
  });

  const triggerCelebration = (title: string) => {
    setActiveCommitment(title);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#6366F1']
    });
  };

  const generateAiAlternatives = async () => {
    setIsLoadingAi(true);
    try {
      const surplus = profile.monthlyInflow - profile.monthlyOutflow;
      const res = await fetch('/api/ai/recommend-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundingNeedAmount: profile.fundingNeed.amount,
          purpose: profile.fundingNeed.purpose,
          personaType: profile.personaType,
          monthlySurplus: surplus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiCustomRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const copySupplierScript = () => {
    const script = `Hello [Supplier Name], 
I am writing regarding our raw material / inventory order. Over the past [X] months, our business has maintained a 100% on-time settlement track record (verified via FinShield). 
To optimize cash flow for this seasonal lot, we propose a 50/50 staggered term: 50% advance on dispatch, and the remaining 50% balance cleared within 21 days from sales proceeds. 
This enables us to scale order volume with you continuously. Looking forward to your confirmation.`;
    navigator.clipboard.writeText(script);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2.5">
            <Sparkles className="w-4 h-4" />
            <span>Ethical Non-Debt Alternatives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Non-Credit Solutions & Smart Budgeting
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 leading-relaxed max-w-3xl">
            Proven strategies to fulfill funding needs of ₹{profile.fundingNeed.amount.toLocaleString('en-IN')} without borrowing high-interest loans.
          </p>
        </div>

        <button
          id="btn-generate-ai-alternatives"
          onClick={generateAiAlternatives}
          disabled={isLoadingAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-indigo-200 animate-spin" style={{ animationDuration: isLoadingAi ? '1s' : '0s' }} />
          <span>{isLoadingAi ? 'Synthesizing AI Options...' : 'Generate AI Custom Alternatives'}</span>
        </button>
      </div>

      {/* AI Custom Generated Section (If active) */}
      {aiCustomRecommendations.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">AI-Tailored Alternatives for Your Cashflow</h2>
            </div>
            <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
              Personalized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiCustomRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-white">{rec.title}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300">
                    {rec.feasibility}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{rec.description}</p>
                <div className="pt-2.5 border-t border-slate-800 text-xs sm:text-sm text-blue-400 font-semibold flex items-center justify-between">
                  <span>{rec.savingsVsLoan}</span>
                  <span className="text-slate-400">{rec.estimatedTimeline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedTag === tag
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid of Non-Credit Alternatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOptions.map((opt) => {
          const isCommitted = activeCommitment === opt.title;
          return (
            <div
              key={opt.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                    {opt.tag}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {opt.timeline}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {opt.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {opt.summary}
                </p>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-blue-400 font-semibold">
                  💰 {opt.savingsVsCommercialLoan}
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setActiveOption(opt)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Step-by-Step Action Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => triggerCelebration(opt.title)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCommitted
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {isCommitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Committed to this Plan!</span>
                    </>
                  ) : (
                    <span>Commit to this Alternative</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Practical Action Modal (When User Clicks Step-by-Step Action Plan) */}
      {activeOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                  {activeOption.tag}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{activeOption.title}</h3>
              </div>
              <button
                onClick={() => setActiveOption(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {activeOption.summary}
            </p>

            {/* Steps Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">Execution Steps:</h4>
              <div className="space-y-2.5">
                {activeOption.steps.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Copyable Script for Supplier Trade Credit */}
            {activeOption.tag === 'Trade Credit' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Supplier Negotiation Message Script:
                  </span>
                  <button
                    onClick={copySupplierScript}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTemplate ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  "Hello [Supplier], based on our verified on-time history in FinShield, we propose a 50% advance on dispatch, with balance 50% cleared in 21 days from sales..."
                </p>
              </div>
            )}

            {/* Caution Note */}
            {activeOption.cautionNote && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs sm:text-sm text-amber-300 flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{activeOption.cautionNote}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenAiCoach(`Give me a detailed action plan to execute: ${activeOption.title}`);
                  setActiveOption(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Coach Me on This Step</span>
              </button>
              <button
                onClick={() => {
                  triggerCelebration(activeOption.title);
                  setActiveOption(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm"
              >
                Adopt this Solution
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
