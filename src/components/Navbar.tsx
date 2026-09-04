import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileDown, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LayoutDashboard, 
  HeartPulse, 
  Scale, 
  Building2, 
  Lock, 
  SlidersHorizontal,
  ChevronDown,
  Maximize,
  Minimize,
  MessageSquareText,
  MoreVertical
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateOverallScore } from '../data/mockProfiles';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  currentProfile: UserProfile;
  allProfiles: UserProfile[];
  onSelectProfile: (profileId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenAiCoach: () => void;
  onOpenAuth: () => void;
  onOpenAssessment: () => void;
  currentUser: FirebaseUser | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  allProfiles,
  onSelectProfile,
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenAiCoach,
  onOpenAuth,
  onOpenAssessment,
  currentUser,
  isDarkMode,
  onToggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreNavDropdownOpen, setIsMoreNavDropdownOpen] = useState(false);
  const [isUtilityMoreOpen, setIsUtilityMoreOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const moreNavDropdownRef = useRef<HTMLDivElement | null>(null);
  const utilityMoreRef = useRef<HTMLDivElement | null>(null);

  const overallScore = calculateOverallScore(currentProfile.scorePillars);

  // Fullscreen state synchronization
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen request note:', e);
    }
  };

  // Navigation tabs configuration
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, aliases: ['overview'] },
    { id: 'financial-health', label: 'Health', fullLabel: 'Financial Health', icon: HeartPulse, aliases: ['cashflow'] },
    { id: 'borrowing', label: 'Borrowing', fullLabel: 'Borrowing Health', icon: Scale, aliases: ['debt-simulator'] },
    { id: 'alternatives', label: 'Alternatives', fullLabel: 'Non-Credit Alternatives', icon: Sparkles, aliases: ['non-credit'] },
    { id: 'schemes', label: 'Schemes', fullLabel: 'Schemes', icon: Building2, aliases: ['public-schemes'] },
    { id: 'consent', label: 'Consent', fullLabel: 'Consent', icon: Lock, aliases: ['consent-ledger'] },
  ];

  const isTabActive = (item: typeof navItems[0]) => {
    return activeTab === item.id || (item.aliases && item.aliases.includes(activeTab));
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMoreNavDropdownOpen(false);
    setIsUtilityMoreOpen(false);
  };

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreNavDropdownRef.current && !moreNavDropdownRef.current.contains(target)) {
        setIsMoreNavDropdownOpen(false);
      }
      if (utilityMoreRef.current && !utilityMoreRef.current.contains(target)) {
        setIsUtilityMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreNavDropdownOpen(false);
        setIsUtilityMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Primary 3 navigation items (Dashboard, Health, Borrowing) vs Secondary items (Alternatives, Schemes, Consent)
  const primaryNavItems = navItems.slice(0, 3);
  const secondaryNavItems = navItems.slice(3);
  const isSecondaryActive = secondaryNavItems.some(isTabActive);
  const activeSecondaryItem = secondaryNavItems.find(isTabActive);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xs transition-colors w-full max-w-full box-border">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 2xl:px-6 box-border">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-1.5 sm:gap-2 lg:gap-3 min-w-0 w-full">
          
          {/* ======================================================== */}
          {/* GROUP 1: Brand Logo & Title                              */}
          {/* ======================================================== */}
          <div className="flex items-center shrink-0 min-w-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
              aria-label="FinShield Home Dashboard"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-inner group-hover:border-blue-400/50 transition-all shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-400 shrink-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-blue-300 transition-colors leading-tight">
                  FinShield
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden 2xl:inline -mt-0.5 leading-tight whitespace-nowrap">
                  Alternative Credit
                </span>
              </div>
            </button>
          </div>

          {/* ======================================================== */}
          {/* GROUP 2: Navigation Tabs (Adaptive & Compact)            */}
          {/* ======================================================== */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 shrink min-w-0">
            {/* Primary 3 items always visible on lg+ */}
            {primaryNavItems.map((item) => {
              const active = isTabActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 2xl:px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-500/20 text-blue-400 shadow-xs border border-blue-500/40 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="hidden xl:inline">{item.fullLabel || item.label}</span>
                  <span className="xl:hidden">{item.label}</span>
                </button>
              );
            })}

            {/* Secondary items visible on very wide displays (>= 1600px) */}
            {secondaryNavItems.map((item) => {
              const active = isTabActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-500/20 text-blue-400 shadow-xs border border-blue-500/40 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* "More ▾" Nav Dropdown on intermediate screens (1024px to 1599px) */}
            <div className="relative 2xl:hidden" ref={moreNavDropdownRef}>
              <button
                type="button"
                id="nav-item-more-dropdown"
                onClick={() => setIsMoreNavDropdownOpen(!isMoreNavDropdownOpen)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSecondaryActive
                    ? 'bg-blue-500/20 text-blue-400 shadow-xs border border-blue-500/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                aria-expanded={isMoreNavDropdownOpen}
                aria-haspopup="true"
              >
                <span>{isSecondaryActive && activeSecondaryItem ? activeSecondaryItem.label : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreNavDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreNavDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                    Additional Tools
                  </div>
                  {secondaryNavItems.map((item) => {
                    const active = isTabActive(item);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        id={`dropdown-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          active
                            ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span>{item.fullLabel || item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* ======================================================== */}
          {/* GROUP 3: Responsive Top Utility Controls                 */}
          {/* ======================================================== */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* 1. Primary Action: + Enter My Data / Recalculate */}
            <button
              id="btn-take-assessment"
              onClick={onOpenAssessment}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
              title={
                currentUser && !currentUser.isAnonymous && allProfiles.some(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                  ? "Update your financial intake & recalculate personalized score"
                  : "Enter your income and expenses for custom score assessment"
              }
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {currentUser && !currentUser.isAnonymous && allProfiles.some(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                  ? "Recalculate Score"
                  : "+ Enter My Data"}
              </span>
              <span className="sm:hidden">
                {currentUser && !currentUser.isAnonymous && allProfiles.some(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                  ? "Recalculate"
                  : "+ Data"}
              </span>
            </button>

            {/* 2. Persona Selector (Visible on Desktop >= 1024px) */}
            <div className="hidden lg:flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-1.5 py-1 gap-1 shrink-0">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden 2xl:inline">Profile:</span>
              <select
                id="persona-selector"
                value={currentProfile.id}
                onChange={(e) => onSelectProfile(e.target.value)}
                aria-label="Select User Profile Persona"
                className="bg-slate-900 text-xs font-semibold text-blue-400 rounded px-1 py-0.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[120px] xl:max-w-[150px] truncate"
              >
                {allProfiles.some(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id)) ? (
                  <>
                    <optgroup label="👤 My Saved Profile">
                      {allProfiles
                        .filter(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name.split(' ')[0]} ({p.personaType === 'student' ? 'Student' : p.personaType === 'micro-entrepreneur' ? 'Biz' : p.personaType === 'gig-worker' ? 'Gig' : 'Custom'})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🧪 Demo Personas">
                      {allProfiles
                        .filter(p => ['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name.split(' ')[0]} ({p.personaType === 'student' ? 'Student' : p.personaType === 'micro-entrepreneur' ? 'Biz' : p.personaType === 'gig-worker' ? 'Gig' : 'Custom'})
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  allProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.split(' ')[0]} ({p.personaType === 'student' ? 'Student' : p.personaType === 'micro-entrepreneur' ? 'Biz' : p.personaType === 'gig-worker' ? 'Gig' : 'Custom'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 3. Account / Login Button */}
            <button
              id="btn-account-auth"
              onClick={onOpenAuth}
              className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-lg border text-xs font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                currentUser && !currentUser.isAnonymous
                  ? 'bg-slate-800 hover:bg-slate-700 border-blue-500/40 text-blue-400'
                  : currentUser && currentUser.isAnonymous
                  ? 'bg-slate-800 hover:bg-slate-700 border-blue-500/30 text-blue-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              aria-label={
                currentUser && !currentUser.isAnonymous
                  ? `Signed in as ${currentUser.displayName || currentUser.email}`
                  : currentUser && currentUser.isAnonymous
                  ? "Guest Session Active"
                  : "Sign In / Create Account"
              }
              title={
                currentUser && !currentUser.isAnonymous
                  ? `Signed in as ${currentUser.displayName || currentUser.email}`
                  : currentUser && currentUser.isAnonymous
                  ? "Guest Session Active"
                  : "Sign In / Create Account"
              }
            >
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden xl:inline truncate max-w-[65px] 2xl:max-w-[85px]">
                {currentUser && !currentUser.isAnonymous
                  ? currentUser.displayName || currentUser.email?.split('@')[0] || 'Account'
                  : currentUser && currentUser.isAnonymous
                  ? 'Guest'
                  : 'Log In'}
              </span>
            </button>

            {/* 4. Export Certified Report (Visible on Desktop >= 1024px) */}
            <button
              id="btn-export-report"
              onClick={onOpenReport}
              title="Export Certified Credit & Health Report"
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden 2xl:inline">Report</span>
            </button>

            {/* 5. Feedback / AI Coach Quick Trigger (Visible on 2xl+ screens) */}
            <button
              id="btn-feedback-help"
              onClick={onOpenAiCoach}
              aria-label="Open AI Financial Coach & Feedback"
              title="Open AI Financial Coach & Support"
              className="hidden 2xl:flex w-8 h-8 sm:w-8.5 sm:h-8.5 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4 text-blue-400 shrink-0" />
            </button>

            {/* 6. Theme Toggle (Light / Dark) (Always fully visible across mobile and desktop at the far right) */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </button>

            {/* 7. Mobile / Tablet Menu Toggle (< 1024px) */}
            <button
              id="btn-mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0 cursor-pointer ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-white shrink-0" /> : <Menu className="w-4 h-4 text-white shrink-0" />}
            </button>

          </div>
        </div>

        {/* ======================================================== */}
        {/* Mobile / Tablet Navigation Drawer (< 1024px)              */}
        {/* ======================================================== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Profile selector & login row in drawer */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-slate-400 font-medium shrink-0">Profile:</span>
                <select
                  value={currentProfile.id}
                  onChange={(e) => onSelectProfile(e.target.value)}
                  className="bg-slate-900 text-xs font-semibold text-blue-400 rounded-lg px-2.5 py-1 border border-slate-700 w-full truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {allProfiles.some(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id)) ? (
                    <>
                      <optgroup label="👤 My Saved Profile">
                        {allProfiles
                          .filter(p => !['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.personaType === 'student' ? 'Student' : p.personaType === 'micro-entrepreneur' ? 'Biz' : p.personaType === 'gig-worker' ? 'Gig' : 'Custom'})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="🧪 Demo Personas">
                        {allProfiles
                          .filter(p => ['p-aarav-student', 'p-sunita-biz', 'p-rahul-gig', 'p-gourav-student'].includes(p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.personaType === 'student' ? 'Student' : p.personaType === 'micro-entrepreneur' ? 'Biz' : p.personaType === 'gig-worker' ? 'Gig' : 'Custom'})
                            </option>
                          ))}
                      </optgroup>
                    </>
                  ) : (
                    allProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.personaType})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 shrink-0 cursor-pointer"
              >
                {currentUser && !currentUser.isAnonymous ? 'Account' : currentUser && currentUser.isAnonymous ? 'Guest' : 'Log In'}
              </button>
            </div>

            {/* Navigation Grid (All 6 core tabs) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((item) => {
                const active = isTabActive(item);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold shadow-xs'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.fullLabel || item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom drawer actions */}
            <div className="pt-2.5 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Financial Health: <strong className="text-blue-400">{overallScore}/100</strong></span>
                <button
                  onClick={() => {
                    onOpenAiCoach();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
                >
                  <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
                  <span>AI Coach & Feedback</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenReport();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Export Certified Report</span>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-blue-400" /> : <Maximize className="w-3.5 h-3.5 text-slate-300" />}
                  <span className="text-xs">{isFullscreen ? 'Exit' : 'Full'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

