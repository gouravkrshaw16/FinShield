import React, { useState } from 'react';
import { ShieldCheck, Edit3, CheckCircle2, AlertCircle, X, FileText, ArrowRight } from 'lucide-react';
import { ScorePillar, DisputeRecord } from '../types';

interface DisputeModalProps {
  pillar: ScorePillar | null;
  metricName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (record: DisputeRecord, newScore: number) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  pillar,
  metricName,
  isOpen,
  onClose,
  onSubmitDispute,
}) => {
  const [selectedFactor, setSelectedFactor] = useState(metricName || (pillar?.factors[0]?.label || 'General Metric'));
  const [claimedCorrection, setClaimedCorrection] = useState('');
  const [reasonExplanation, setReasonExplanation] = useState('');
  const [documentNote, setDocumentNote] = useState('');

  if (!isOpen || !pillar) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedCorrection || !reasonExplanation) return;

    // Calculate updated score for this pillar (e.g. +6 points on successful proof adjustment, max 100)
    const updatedScore = Math.min(100, pillar.score + 6);

    const dispute: DisputeRecord = {
      id: `disp-${Date.now()}`,
      pillarId: pillar.id,
      metricName: selectedFactor,
      previousValue: `${pillar.score}/100`,
      claimedValue: `${updatedScore}/100 (${claimedCorrection})`,
      reason: reasonExplanation,
      supportingDocNote: documentNote || 'Verified Digital Receipt Attached',
      status: 'resolved',
      date: new Date().toISOString().split('T')[0],
      scoreImpactDelta: +6,
    };

    onSubmitDispute(dispute, updatedScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Correct / Dispute Consented Metric</h3>
              <p className="text-xs text-slate-400">
                Pillar: <strong className="text-blue-300">{pillar.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainability notice */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-blue-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Guaranteed Right to Rectification (DPDP & Fair Credit Mandate)
          </span>
          <p className="text-slate-400 leading-relaxed">
            If any utility bill, invoice clearance, or bank cash flow metric is out-of-date or miscalculated, submit your correction. Your alternative score will recalculate transparently.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Contributing Factor</label>
            <select
              value={selectedFactor}
              onChange={(e) => setSelectedFactor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pillar.factors.map((f, idx) => (
                <option key={idx} value={f.label}>
                  {f.label} (Current: {f.value})
                </option>
              ))}
              <option value="General Pillar Score">General Discrepancy / Recent Bank Record</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Corrected Value / Update</label>
            <input
              type="text"
              required
              placeholder="e.g. Cleared 100% on-time via UPI reference #98234723"
              value={claimedCorrection}
              onChange={(e) => setClaimedCorrection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Explanation / Supporting Context</label>
            <textarea
              required
              rows={2}
              placeholder="Explain why this metric should be updated..."
              value={reasonExplanation}
              onChange={(e) => setReasonExplanation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Supporting Document / Reference Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. DigiLocker Electricity Receipt ID #45920 or Bank Reference"
              value={documentNote}
              onChange={(e) => setDocumentNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 flex items-center justify-between">
            <span>Estimated Score Recalculation Impact:</span>
            <span className="font-bold text-white bg-blue-900 px-2 py-0.5 rounded">
              +{Math.round(pillar.weight * 6)} Points Overall
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Submit & Recalculate Score
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
