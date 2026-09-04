import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  FileCheck, 
  Clock, 
  Award, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserProfile, PublicScheme } from '../types';
import { PUBLIC_SCHEMES } from '../data/publicSchemes';

interface PublicSchemesDirectoryProps {
  profile: UserProfile;
  onOpenAiCoach: (schemeTitle: string) => void;
}

export const PublicSchemesDirectory: React.FC<PublicSchemesDirectoryProps> = ({
  profile,
  onOpenAiCoach,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSchemeModal, setActiveSchemeModal] = useState<PublicScheme | null>(null);

  const filteredSchemes = PUBLIC_SCHEMES.filter((scheme) => {
    const matchesTarget = selectedTarget === 'all' || scheme.target === selectedTarget || scheme.target === 'all';
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.officialAgency.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTarget && matchesSearch;
  });

  const getEligibilityScore = (scheme: PublicScheme) => {
    if (scheme.target === profile.personaType || scheme.target === 'all') return 95;
    if (profile.personaType === 'gig-worker' && scheme.target === 'micro-entrepreneur') return 88;
    return 70;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2.5">
            <Building2 className="w-4 h-4" />
            <span>Government Welfare & Subsidized Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Public Welfare Schemes & Subsidies
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 leading-relaxed max-w-3xl">
            Access genuine government credit guarantee, interest subvention (0%-7%), and non-repayable grants.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes (e.g. SVANidhi, MUDRA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Target Audience Filters */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Schemes' },
          { id: 'student', label: 'Student & Education Subsidies' },
          { id: 'micro-entrepreneur', label: 'Micro-Enterprise & Street Vendor' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedTarget(filter.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedTarget === filter.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => {
          const matchPct = getEligibilityScore(scheme);
          const isHighMatch = matchPct >= 85;

          return (
            <div
              key={scheme.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    {scheme.officialAgency}
                  </span>
                  
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    isHighMatch
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{matchPct}% Profile Match</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {scheme.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {scheme.tagline}
                </p>

                {/* Key Benefits Pill Matrix */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block font-medium">Max Benefit Amount:</span>
                    <span className="font-bold text-white text-sm sm:text-base">{scheme.maxBenefit}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block font-medium">Subsidized Interest:</span>
                    <span className="font-bold text-blue-400 text-sm sm:text-base">{scheme.interestRate}</span>
                  </div>
                </div>

                {scheme.subsidyRate && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs sm:text-sm text-amber-200 leading-relaxed">
                    ✨ <strong>Subsidy Advantage:</strong> {scheme.subsidyRate}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-800">
                <button
                  onClick={() => setActiveSchemeModal(scheme)}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Check Eligibility</span>
                </button>

                <a
                  href={scheme.applicationPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Official Portal</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheme Detail & Checklist Modal */}
      {activeSchemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800">
                  {activeSchemeModal.officialAgency}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">{activeSchemeModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveSchemeModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {activeSchemeModal.tagline}
            </p>

            {/* Eligibility Requirements */}
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Eligibility Criteria Checklist:
              </h4>
              <div className="space-y-2">
                {activeSchemeModal.eligibility.map((req, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed">
                    <span className="text-blue-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Required Documentation:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSchemeModal.documentsRequired.map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <span>📄</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Timeline & Repayment Flexibility */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Turnaround:</span>
                <span className="text-white font-semibold">{activeSchemeModal.processingTime}</span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
                <strong className="text-slate-300">Repayment Terms:</strong> {activeSchemeModal.repaymentFlexibility}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenAiCoach(`Guide me step-by-step through applying for ${activeSchemeModal.title}`);
                  setActiveSchemeModal(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Application Assistant</span>
              </button>
              
              <a
                href={activeSchemeModal.applicationPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Go to Government Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
