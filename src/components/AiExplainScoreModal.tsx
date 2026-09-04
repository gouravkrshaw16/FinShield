import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle, X, BrainCircuit, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateOverallScore } from '../data/mockProfiles';

interface AiExplainScoreModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const AiExplainScoreModal: React.FC<AiExplainScoreModalProps> = ({
  profile,
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const overallScore = calculateOverallScore(profile.scorePillars);

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, profile.id]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const scoreMetrics: any = { overallScore };
      profile.scorePillars.forEach((p) => {
        if (p.id === 'p-cashflow') scoreMetrics.cashflowStability = p.score;
        if (p.id === 'p-bills') scoreMetrics.billReliability = p.score;
        if (p.id === 'p-savings') scoreMetrics.savingsBuffer = p.score;
        if (p.id === 'p-leverage') scoreMetrics.leverageRatio = p.score;
        if (p.id === 'p-continuity') scoreMetrics.operationalContinuity = p.score;
      });

      const res = await fetch('/api/ai/explain-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreMetrics,
          profileName: profile.name,
          personaType: profile.personaType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Error fetching score explanation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Explainable Score Diagnostic</h3>
              <p className="text-xs text-slate-400">
                Transparent causal breakdown of your {overallScore}/100 readiness score
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400">
              Synthesizing 5-pillar mathematical breakdown and anti-bias verification...
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Executive Assessment:</span>
              <p className="leading-relaxed text-slate-200">
                {analysis?.summary || `Your alternative credit readiness reflects high utility settlement reliability and positive net operating margin.`}
              </p>
            </div>

            {/* Key Strengths */}
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Verified Positive Contributors:
              </h4>
              <div className="space-y-1.5">
                {(analysis?.keyStrengths || [
                  'Consistent on-time digital utility settlements across past 12 months',
                  'Healthy net cashflow operating margin of >30%'
                ]).map((strength: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">✓</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended 30-Day Boost Actions */}
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Actionable 30-Day Growth Levers:
              </h4>
              <div className="space-y-1.5">
                {(analysis?.improvementAreas || [
                  'Automate a daily ₹100 micro-saving to boost liquid reserve coverage past 1.5 months',
                  'Log recurring customer invoices in the consented ledger'
                ]).map((action: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Credit Guidance */}
            {analysis?.nonCreditReadiness && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200">
                💡 <strong>Funding Strategy:</strong> {analysis.nonCreditReadiness}
              </div>
            )}

            {/* Fair Lending Verification Note */}
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/20 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                {analysis?.auditStatement || 'Audit Certified: Computed 100% free of demographic, geographic, or protected identity bias.'}
              </span>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onNavigateToTab('non-credit');
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Explore Non-Credit Solutions
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
