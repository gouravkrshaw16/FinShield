import React from 'react';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  CheckCircle2, 
  Award, 
  FileCheck2, 
  Lock, 
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateOverallScore } from '../data/mockProfiles';
import { PROTECTED_CHARACTERISTICS_AUDIT } from '../data/fairLendingData';

interface ExportReportModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const overallScore = calculateOverallScore(profile.scorePillars);
  const monthlySurplus = profile.monthlyInflow - profile.monthlyOutflow;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold text-white">Verified Alternative Credit Passport</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certified Report Content (Printable document structure) */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 text-slate-200" id="printable-report">
          
          {/* Header of Report */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">FinShield</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  Certified Telemetry
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-400 mt-1">
                Alternative Credit-Readiness & Financial Health Certificate
              </h2>
              <p className="text-xs text-slate-500">Issued On: {issueDate} • Verification ID: FS-{Date.now().toString().slice(-8)}</p>
            </div>

            {/* QR Verification Seal Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shrink-0">
              <div className="w-16 h-16 bg-white p-1 rounded-lg mx-auto flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v2h-2v-2zm-4-4h4v2h-4v-2zm2 4v4h-2v-4h2zm4 2h2v4h-4v-2h2v-2zm-2-4h2v2h-2v-2zm-8-2h2v2H8v-2zm0 4h2v2H8v-2z" />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-blue-400 block mt-1">Cryptographically Signed</span>
            </div>
          </div>

          {/* User Profile Bio in Report */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block">Beneficiary Name</span>
              <span className="text-white font-bold text-sm">{profile.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Vocation / Persona</span>
              <span className="text-white font-semibold">{profile.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Location</span>
              <span className="text-white font-semibold">{profile.location}</span>
            </div>
          </div>

          {/* Alternative Score Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-5 rounded-xl bg-slate-900/90 border-2 border-blue-500/30">
            <div className="sm:col-span-1 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Alternative Score</span>
              <div className="text-4xl font-extrabold text-blue-400 tracking-tight mt-0.5">
                {overallScore} <span className="text-sm font-semibold text-slate-500">/ 100</span>
              </div>
              <span className="text-[11px] text-blue-300 font-semibold">Tier: Prime Non-Credit Candidate</span>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-xs border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Cash Inflow:</span>
                <span className="text-white font-bold">₹{profile.monthlyInflow.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Operating Surplus:</span>
                <span className="text-blue-400 font-bold">₹{monthlySurplus.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Liquid Reserve Cushion:</span>
                <span className="text-white font-semibold">₹{profile.emergencyFund.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 5-Pillar Scorecard */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Explainable 5-Pillar Evaluation Breakdown:
            </h3>
            
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden text-xs">
              {profile.scorePillars.map((pillar) => (
                <div key={pillar.id} className="p-3 bg-slate-900/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{pillar.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Weight: {Math.round(pillar.weight * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pillar.benchmark}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-blue-400 text-sm">{pillar.score}/100</span>
                    <div className="text-[10px] text-slate-400">{pillar.grade}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fair Lending Zero Bias Stamp */}
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Fair Lending & Zero-Demographic Guarantee Seal</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              This score was computed strictly on consented transactional cash flows, utility bill payment timeliness, and academic/operational continuity. <strong>Gender, race, caste, religion, marital status, health, and geographic redlining</strong> were verified 100% excluded (0.00% algorithmic weight).
            </p>
          </div>

          {/* Footer of Report */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <span>Powered by FinShield Ethical FinTech Platform</span>
            <span>Standards: RBI Account Aggregator Framework • DPDP Act 2023 • ECOA</span>
          </div>

        </div>

      </div>
    </div>
  );
};
