/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MOCK_PROFILES, calculateOverallScore } from './data/mockProfiles';
import { UserProfile, ScorePillar, ConsentSource, CashflowEntry, DisputeRecord } from './types';
import { Navbar } from './components/Navbar';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { CashflowAnalytics } from './components/CashflowAnalytics';
import { DebtSimulator } from './components/DebtSimulator';
import { NonCreditAlternatives } from './components/NonCreditAlternatives';
import { PublicSchemesDirectory } from './components/PublicSchemesDirectory';
import { ConsentCenter } from './components/ConsentCenter';
import { AiFinancialCoach } from './components/AiFinancialCoach';
import { DisputeModal } from './components/DisputeModal';
import { ExportReportModal } from './components/ExportReportModal';
import { AiExplainScoreModal } from './components/AiExplainScoreModal';
import { AuthModal } from './components/AuthModal';
import { FinancialIntakeModal } from './components/FinancialIntakeModal';
import { dbService } from './lib/databaseService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Database, ShieldCheck, CheckCircle2, SlidersHorizontal, Sparkles, UserCheck } from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(MOCK_PROFILES[0].id);
  const [userCloudProfiles, setUserCloudProfiles] = useState<UserProfile[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dbSyncStatus, setDbSyncStatus] = useState<'connecting' | 'synced' | 'local'>('connecting');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Dark / Light Mode Theme state (Default to Light Mode as per clean fintech standard)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('finshield_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false; // Default to Light Mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('finshield_theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('finshield_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState<boolean>(false);
  const [aiCoachPrompt, setAiCoachPrompt] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAiExplainModalOpen, setIsAiExplainModalOpen] = useState<boolean>(false);
  
  const [disputeModalState, setDisputeModalState] = useState<{
    isOpen: boolean;
    pillar: ScorePillar | null;
    metricName?: string;
  }>({
    isOpen: false,
    pillar: null,
  });

  // Track Firebase Authentication State & reactive Firestore sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsProfileLoading(true);
      if (user) {
        dbService.setUserId(user.uid, user.isAnonymous);
        setDbSyncStatus('connecting');
        try {
          const cloudProfiles = await dbService.getUserProfiles();
          if (cloudProfiles && cloudProfiles.length > 0) {
            setUserCloudProfiles(cloudProfiles);
            // Load authenticated user's cloud profiles + demo mock profiles
            const cloudProfileIds = new Set(cloudProfiles.map((p) => p.id));
            const merged = [
              ...cloudProfiles,
              ...MOCK_PROFILES.filter((mock) => !cloudProfileIds.has(mock.id)),
            ];
            setProfiles(merged);
            setActiveProfileId(cloudProfiles[0].id);
          } else {
            setUserCloudProfiles([]);
            setProfiles(MOCK_PROFILES);
            setActiveProfileId(MOCK_PROFILES[0].id);
          }
          setDbSyncStatus('synced');
        } catch (err) {
          console.warn('User profile load note:', err);
          setUserCloudProfiles([]);
          setProfiles(MOCK_PROFILES);
          setActiveProfileId(MOCK_PROFILES[0].id);
          setDbSyncStatus('synced');
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        // Logged out state: clear authenticated profiles, reset to default mock profiles
        dbService.setUserId(null);
        setUserCloudProfiles([]);
        setProfiles(MOCK_PROFILES);
        setActiveProfileId(MOCK_PROFILES[0].id);
        setDbSyncStatus('local');
        setIsProfileLoading(false);
        localStorage.removeItem('finshield_device_uid');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    setCurrentUser(null);
    dbService.setUserId(null);
    setUserCloudProfiles([]);
    setProfiles(MOCK_PROFILES);
    setActiveProfileId(MOCK_PROFILES[0].id);
    setDbSyncStatus('local');
    localStorage.removeItem('finshield_device_uid');
  };

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const isCustomOrSavedProfile = !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(currentProfile.id);

  // Handler when a user creates or updates their custom personalized financial assessment
  const handleProfileCreated = (newProfile: UserProfile) => {
    setUserCloudProfiles((prev) => {
      const exists = prev.some((p) => p.id === newProfile.id);
      if (exists) {
        return prev.map((p) => (p.id === newProfile.id ? newProfile : p));
      }
      return [newProfile, ...prev];
    });

    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === newProfile.id);
      if (exists) {
        return prev.map((p) => (p.id === newProfile.id ? newProfile : p));
      }
      return [newProfile, ...prev];
    });
    setActiveProfileId(newProfile.id);
    setActiveTab('overview');
  };

  // Helper to update current profile & persist to Firestore
  const updateCurrentProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfiles((prev) => {
      const nextProfiles = prev.map((p) => (p.id === currentProfile.id ? updater(p) : p));
      const updatedCurr = nextProfiles.find((p) => p.id === currentProfile.id);
      if (updatedCurr) {
        dbService.saveUserProfile(updatedCurr);
      }
      return nextProfiles;
    });
  };

  // Toggle consent status & sync to Firestore
  const handleToggleConsent = (sourceId: string) => {
    const targetSource = currentProfile.consentSources.find(s => s.id === sourceId);
    const newStatus = targetSource?.status === 'active' ? 'revoked' : 'active';
    dbService.updateConsentStatus(currentProfile.id, sourceId, newStatus);

    updateCurrentProfile((prev) => ({
      ...prev,
      consentSources: prev.consentSources.map((cs) => {
        if (cs.id === sourceId) {
          return { ...cs, status: newStatus };
        }
        return cs;
      }),
    }));
  };

  // Add new consented source & sync
  const handleAddConsentSource = (newSource: ConsentSource) => {
    dbService.updateConsentStatus(currentProfile.id, newSource.id, newSource.status);
    updateCurrentProfile((prev) => ({
      ...prev,
      consentSources: [newSource, ...prev.consentSources],
    }));
  };

  // Add transaction & sync to Firestore
  const handleAddTransaction = (newTx: Omit<CashflowEntry, 'id'>) => {
    const entry: CashflowEntry = {
      ...newTx,
      id: `cf-custom-${Date.now()}`,
    };

    dbService.addTransaction(currentProfile.id, entry);

    updateCurrentProfile((prev) => {
      const updatedList = [entry, ...prev.cashflowTransactions];
      const deltaInflow = entry.type === 'inflow' ? entry.amount : 0;
      const deltaOutflow = entry.type === 'outflow' ? entry.amount : 0;

      return {
        ...prev,
        monthlyInflow: prev.monthlyInflow + deltaInflow,
        monthlyOutflow: prev.monthlyOutflow + deltaOutflow,
        cashflowTransactions: updatedList,
      };
    });
  };

  // Submit dispute & recalculate score & persist
  const handleSubmitDispute = (disputeRecord: DisputeRecord, newScore: number) => {
    dbService.submitDispute(currentProfile.id, disputeRecord);

    updateCurrentProfile((prev) => ({
      ...prev,
      scorePillars: prev.scorePillars.map((pillar) => {
        if (pillar.id === disputeRecord.pillarId) {
          return {
            ...pillar,
            score: newScore,
            grade: newScore >= 80 ? 'Excellent' : 'Good',
          };
        }
        return pillar;
      }),
      disputes: [disputeRecord, ...prev.disputes],
    }));
  };

  const handleOpenAiCoachWithPrompt = (prompt?: string) => {
    setAiCoachPrompt(prompt);
    setIsAiCoachOpen(true);
  };

  const handleOpenDispute = (pillar: ScorePillar, metricName?: string) => {
    setDisputeModalState({
      isOpen: true,
      pillar,
      metricName,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation */}
      <Navbar
        currentProfile={currentProfile}
        allProfiles={profiles}
        onSelectProfile={(id) => setActiveProfileId(id)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenAiCoach={() => handleOpenAiCoachWithPrompt()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAssessment={() => setIsIntakeModalOpen(true)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Cloud Database Persistence Banner & Quick Intake Action */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 sm:px-4 md:px-5 lg:px-6 2xl:px-8 py-2 text-xs text-slate-400 w-full box-border">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="font-medium text-slate-300 shrink-0">
              {currentUser && !currentUser.isAnonymous ? 'Account Synced:' : 'Firestore Cloud Database:'}
            </span>
            <span className="text-blue-400 font-semibold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {currentUser && !currentUser.isAnonymous
                ? currentUser.displayName || currentUser.email?.split('@')[0]
                : 'Auto-Synced'}
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline truncate max-w-[200px] md:max-w-none">
              Active Assessment: <strong className="text-slate-200">{currentProfile.name}</strong>
              {currentUser && !currentUser.isAnonymous && isCustomOrSavedProfile && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                  My Profile
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>
                {currentUser && !currentUser.isAnonymous && isCustomOrSavedProfile
                  ? 'Update Financial Intake & Recalculate Score \u2192'
                  : 'Input your income & expenses for custom analysis \u2192'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 2xl:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 min-w-0 box-border">
        
        {/* Loading Indicator while retrieving profile from Firestore */}
        {isProfileLoading && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2.5 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <div className="text-xs sm:text-sm font-semibold text-slate-200">
              Loading your financial profile...
            </div>
          </div>
        )}

        {/* First-time Authenticated User Onboarding Callout */}
        {!isProfileLoading && currentUser && !currentUser.isAnonymous && userCloudProfiles.length === 0 && (
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Welcome to FinShield, {currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Complete Your Financial Assessment to Calculate Your Personalized Score
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Enter your monthly cashflow, regular bills, and savings cushion to generate your verified alternative credit score with 0% demographic bias.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Complete Financial Intake &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'dashboard') && (
          <ScoreBreakdown
            profile={currentProfile}
            onOpenDispute={handleOpenDispute}
            onExplainWithAi={() => setIsAiExplainModalOpen(true)}
            onNavigateToTab={setActiveTab}
            onOpenAssessment={() => setIsIntakeModalOpen(true)}
          />
        )}

        {(activeTab === 'cashflow' || activeTab === 'financial-health') && (
          <CashflowAnalytics
            profile={currentProfile}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {(activeTab === 'non-credit' || activeTab === 'alternatives') && (
          <NonCreditAlternatives
            profile={currentProfile}
            onOpenAiCoach={handleOpenAiCoachWithPrompt}
          />
        )}

        {(activeTab === 'debt-simulator' || activeTab === 'borrowing') && (
          <DebtSimulator
            profile={currentProfile}
            onNavigateToTab={setActiveTab}
          />
        )}

        {(activeTab === 'public-schemes' || activeTab === 'schemes') && (
          <PublicSchemesDirectory
            profile={currentProfile}
            onOpenAiCoach={(title) => handleOpenAiCoachWithPrompt(`Help me apply for ${title}`)}
          />
        )}

        {(activeTab === 'consent-ledger' || activeTab === 'consent') && (
          <ConsentCenter
            profile={currentProfile}
            onToggleConsent={handleToggleConsent}
            onAddConsentSource={handleAddConsentSource}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-400">
          FinShield • Consent-Based Alternative Credit & Financial Health Assistant
        </p>
        <p className="text-[11px] text-slate-500">
          Built for SOAIDEATHON-S41 • Fair Lending Compliant • 0% Demographic Identity Bias
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user, displayName) => {
          setCurrentUser(user);
          dbService.setUserId(user ? user.uid : null, user ? user.isAnonymous : false);
        }}
        onSignOut={handleSignOut}
        onOpenAssessment={() => setIsIntakeModalOpen(true)}
      />

      {/* Financial Intake Assessment Questionnaire Modal */}
      <FinancialIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onProfileCreated={handleProfileCreated}
        initialPersona={currentProfile.personaType}
        existingProfile={currentProfile}
        currentUser={currentUser}
      />

      {/* AI Financial Coach Floating Widget & Popup */}
      <AiFinancialCoach
        profile={currentProfile}
        isOpen={isAiCoachOpen}
        onClose={() => {
          setIsAiCoachOpen(false);
          setAiCoachPrompt(undefined);
        }}
        onToggleOpen={() => setIsAiCoachOpen(!isAiCoachOpen)}
        initialPrompt={aiCoachPrompt}
      />

      {/* Dispute Modal */}
      <DisputeModal
        pillar={disputeModalState.pillar}
        metricName={disputeModalState.metricName}
        isOpen={disputeModalState.isOpen}
        onClose={() => setDisputeModalState({ isOpen: false, pillar: null })}
        onSubmitDispute={handleSubmitDispute}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        profile={currentProfile}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* AI Explain Score Modal */}
      <AiExplainScoreModal
        profile={currentProfile}
        isOpen={isAiExplainModalOpen}
        onClose={() => setIsAiExplainModalOpen(false)}
        onNavigateToTab={setActiveTab}
      />

    </div>
  );
}
