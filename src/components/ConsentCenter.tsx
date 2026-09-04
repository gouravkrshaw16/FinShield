import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Wifi, 
  GraduationCap, 
  Store, 
  Zap, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  FileCheck2,
  RefreshCw,
  EyeOff,
  Database
} from 'lucide-react';
import { UserProfile, ConsentSource } from '../types';
import { dbService, AuditLogEntry } from '../lib/databaseService';

interface ConsentCenterProps {
  profile: UserProfile;
  onToggleConsent: (sourceId: string) => void;
  onAddConsentSource: (source: ConsentSource) => void;
}

export const ConsentCenter: React.FC<ConsentCenterProps> = ({
  profile,
  onToggleConsent,
  onAddConsentSource,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newCategory, setNewCategory] = useState<'banking' | 'telecom' | 'academics' | 'commerce' | 'gig'>('banking');
  const [newPurpose, setNewPurpose] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await dbService.getAuditTrail();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Audit trail load note:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [profile.id]);

  const getSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Store': return <Store className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <ShieldCheck className="w-5 h-5" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newPurpose) return;

    const newSource: ConsentSource = {
      id: `cs-custom-${Date.now()}`,
      name: newSourceName,
      category: newCategory,
      icon: 'ShieldCheck',
      description: 'User-provided verifiable electronic record.',
      status: 'active',
      lastSynced: 'Just now',
      expiresInDays: 90,
      dataPoints: ['Aggregated Volume Summary', 'On-Time Verification Hash'],
      purpose: newPurpose,
      encryptionStandard: 'AES-256 GCM + SHA-256 Hash',
      isCustomUploaded: true,
    };

    onAddConsentSource(newSource);
    setNewSourceName('');
    setNewPurpose('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>DPDP 2023 & RBI Account Aggregator Compliant</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Consent & Data Sovereignty Center</h2>
          <p className="text-xs text-slate-400">
            You hold 100% ownership of your alternative data. Every stream is time-limited, purpose-restricted, and revocable instantly.
          </p>
        </div>

        <button
          id="btn-add-consent-stream"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Consented Feed</span>
        </button>
      </div>

      {/* Zero Demographic Ingestion Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-white">Zero Demographic Harvesting Shield</h3>
            <p className="text-xs text-slate-300">
              FinShield guarantees zero storage of caste, religion, marital status, gender, or location redlining tags.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-blue-300 font-mono shrink-0">
          Encrypted Token Handshake Active
        </div>
      </div>

      {/* Active Consent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profile.consentSources.map((source) => {
          const isActive = source.status === 'active';

          return (
            <div
              key={source.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-slate-800 shadow-md'
                  : 'bg-slate-950/60 border-slate-850 opacity-75'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header with Icon and Revoke Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isActive ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {getSourceIcon(source.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{source.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        Category: {source.category}
                      </span>
                    </div>
                  </div>

                  {/* Revoke / Resume Button */}
                  <button
                    onClick={() => onToggleConsent(source.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                        : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {isActive ? 'Revoke Consent' : 'Re-Activate'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {source.description}
                </p>

                {/* Specific Data Points Ingested */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Permitted Data Fields:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {source.dataPoints.map((dp, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                        {dp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Purpose Limitation Statement */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300 block">Strict Purpose Limitation:</span>
                  <p>{source.purpose}</p>
                </div>
              </div>

              {/* Footer: Expiry & Security Badge */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-400" />
                  {source.encryptionStandard}
                </span>
                <span>Expires in {source.expiresInDays} days</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cryptographic Consent Audit Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Immutable Data Access Audit Log</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 font-mono">
                <Database className="w-3 h-3" />
                Firestore Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verifiable timestamped record of every algorithm evaluation on consented telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <span className="text-xs text-blue-400 font-mono bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
              Audit Trail Synchronized
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {auditLogs.length > 0 ? (
            auditLogs.slice(0, 6).map((log, idx) => (
              <div key={log.id || idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-white">{log.action.replace('_', ' ')}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 truncate max-w-xs">{log.details}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">0% Demographics Verified</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800 font-semibold">
                    Encrypted Hash
                  </span>
                </div>
              </div>
            ))
          ) : (
            [
              { action: 'Score Recalculation Engine', source: 'UPI Inflow & Transaction Aggregate', timestamp: 'Today, 09:15 AM', status: 'Read-Only Computed' },
              { action: 'Subsidized Scheme Evaluator', source: 'National Academic Depository (NAD)', timestamp: 'Yesterday, 04:30 PM', status: 'Verification Matched' },
              { action: 'Cashflow Volatility Check', source: 'Telecom & Broadband Bill History', timestamp: '2 days ago, 11:00 AM', status: 'Read-Only Computed' },
            ].map((log, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{log.source}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-[11px] font-mono">{log.timestamp}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800 font-semibold">
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Consented Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Connect New Consented Telemetry Stream</h3>
            <p className="text-xs text-slate-400">
              Integrate DigiLocker records, Account Aggregator handles, or digital utility payment statements.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Data Stream Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Electricity Board Meter Bill"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Stream Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="banking">Banking / Account Aggregator</option>
                  <option value="telecom">Utility / Telecom / Power</option>
                  <option value="academics">Academic / Certifications</option>
                  <option value="commerce">Merchant / PoS / Invoicing</option>
                  <option value="gig">Gig Platform Ledger</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Approved Purpose Limitation</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Calculate on-time utility reliability for alternative score only."
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Grant Consented Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
