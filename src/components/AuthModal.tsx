import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  auth, 
  initAuth 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import config from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onAuthSuccess: (user: FirebaseUser, displayName?: string) => void;
  onSignOut?: () => void;
  onOpenAssessment: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  onOpenAssessment,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
        setSuccessMsg('Account created successfully! Welcome to FinShield.');
        setTimeout(() => {
          onAuthSuccess(userCred.user, name.trim());
          onClose();
          onOpenAssessment();
        }, 1000);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onAuthSuccess(userCred.user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.warn('Firebase Auth result:', err?.code || err?.message);
      let msg = err.message || 'Authentication failed. Please check your credentials and try again.';
      
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        setIsOperationNotAllowed(true);
        msg = `Email/Password sign-in is disabled in Firebase Console for project "${config.projectId}". In Firebase Console -> Authentication -> Sign-in method, enable Email/Password and click Save. You can also sign in via Guest Mode below.`;
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please switch to the "Sign In" tab.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Incorrect email or password. Please verify your credentials and try again.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection issue. Please verify your internet connection and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.';
      }
      
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setSuccessMsg(`Welcome, ${result.user.displayName || result.user.email}!`);
      setTimeout(() => {
        onAuthSuccess(result.user, result.user.displayName || undefined);
        onClose();
      }, 800);
    } catch (err: any) {
      console.warn('Google Sign-in result:', err?.code || err?.message);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg(null);
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg(`Google sign-in is not enabled in Firebase Console for project "${config.projectId}". Enable Google under Authentication -> Sign-in method.`);
      } else {
        setErrorMsg(err.message || 'Google sign-in failed. Try Email/Password or Guest Mode.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
    try {
      const cred = await signInAnonymously(auth);
      setSuccessMsg('Signed in as Instant Guest (Cloud Synced)!');
      setTimeout(() => {
        onAuthSuccess(cred.user, 'Guest Explorer');
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Firebase anonymous auth fallback to local session:', err?.code || err?.message);
      let guestUid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const fallbackGuestUser: any = {
        uid: guestUid,
        isAnonymous: true,
        displayName: 'Guest Explorer',
        email: null,
        emailVerified: false,
      };

      setSuccessMsg('Signed in to Instant Guest Mode!');
      setTimeout(() => {
        onAuthSuccess(fallbackGuestUser, 'Guest Explorer');
        onClose();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccessMsg('Logged out successfully.');
      if (onSignOut) {
        onSignOut();
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg('Error signing out.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] my-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {currentUser && !currentUser.isAnonymous ? 'FinShield Account' : mode === 'signin' ? 'Sign In to FinShield' : 'Create Free Account'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400 truncate">
                  {currentUser && !currentUser.isAnonymous ? 'Manage session & profile' : 'Ethical, consent-driven financial access'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 border border-slate-700 shrink-0">
                  {config.projectId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">

          {currentUser && !currentUser.isAnonymous ? (
            /* Logged In State */
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center text-xl font-bold">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {currentUser.displayName || 'Active Member'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {currentUser.email || 'Anonymous Verified Session'}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected to {config.projectId}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAssessment();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/50"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  Update Financial Intake & Recalculate Score
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <>
              {/* Active Guest Banner if browsing anonymously */}
              {currentUser && currentUser.isAnonymous && (
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between gap-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-blue-300">
                      <KeyRound className="w-3.5 h-3.5 shrink-0" />
                      <span>Guest Explorer Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      Sign in to permanently save profiles, or log out.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 text-xs font-semibold border border-slate-700 shrink-0 cursor-pointer transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}

              {/* Google One-Click Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#3400ac] text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-md disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center text-[#1c0000] font-bold">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-[#1c0000] font-bold uppercase tracking-wider">Or with Email</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setIsOperationNotAllowed(false);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-slate-800 text-blue-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setIsOperationNotAllowed(false);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-slate-800 text-blue-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error & Success alerts */}
              {errorMsg && (
                <div className="alert-warning p-3.5 rounded-xl border text-xs space-y-2 font-medium">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="alert-warning-icon w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{errorMsg}</span>
                  </div>
                  {isOperationNotAllowed && (
                    <div className="pt-2 border-t alert-warning-divider">
                      <button
                        type="button"
                        onClick={handleGuestSignIn}
                        className="alert-warning-btn w-full py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Continue in Guest Mode Immediately</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Full Name / Display Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya Nair"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-[11px] text-slate-500">Minimum 6 characters with letters and numbers.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : mode === 'signin' ? (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Create Account & Start Intake</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Guest / Instant Demo Mode */}
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Guest Mode (No Password Needed)</span>
              </button>

              {/* Zero Demographic Shield Reminder */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fair Lending & Privacy Standard</span>
                </div>
                <p>
                  FinShield strictly excludes demographic tags (caste, religion, gender, zip code redlining) from all credit algorithms.
                </p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
