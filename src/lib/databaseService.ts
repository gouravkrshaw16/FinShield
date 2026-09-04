import { 
  db, 
  auth, 
  initAuth, 
  ensureAuth,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from './firebase';
import { 
  UserProfile, 
  CashflowEntry, 
  ConsentSource, 
  DisputeRecord, 
  PublicScheme, 
  NonCreditOption 
} from '../types';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'DATA_SYNCED' | 'DISPUTE_RAISED' | 'SCORE_GENERATED' | 'PASSPORT_EXPORTED' | 'PROFILE_SAVED';
  details: string;
  targetEntity?: string;
  timestamp: any;
  ipMasked?: string;
  zeroDemographicVerified: boolean;
}

export interface ChatMessageEntry {
  id?: string;
  userId: string;
  profileId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  createdAt: any;
}

class DatabaseService {
  private currentUserId: string | null = null;
  private sessionState: 'authenticated' | 'guest' | 'logged_out' = 'logged_out';

  setUserId(uid: string | null, isGuest: boolean = false) {
    this.currentUserId = uid;
    if (uid) {
      this.sessionState = isGuest ? 'guest' : 'authenticated';
    } else {
      this.sessionState = 'logged_out';
    }
  }

  getSessionState(): 'authenticated' | 'guest' | 'logged_out' {
    if (auth.currentUser) {
      return auth.currentUser.isAnonymous ? 'guest' : 'authenticated';
    }
    return this.currentUserId ? this.sessionState : 'logged_out';
  }

  getUserId(): string | null {
    if (auth.currentUser && auth.currentUser.uid) {
      this.currentUserId = auth.currentUser.uid;
      return auth.currentUser.uid;
    }
    return this.currentUserId;
  }

  // --- USER PROFILES & FINANCIAL DATA ---
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const uid = this.getUserId();
      if (!uid) {
        console.warn('Firestore saveUserProfile skipped: User is currently logged out (transient demo state).');
        return;
      }

      // Prepare concurrent Firestore writes
      const profileRef = doc(db, 'users', uid, 'profiles', profile.id);
      const mainProfileRef = doc(db, 'users', uid, 'profile', 'main');
      const financialRef = doc(db, 'users', uid, 'financial_data', 'current');

      const writes: Promise<any>[] = [
        setDoc(profileRef, {
          ...profile,
          updatedAt: serverTimestamp(),
          ownerId: uid,
        }, { merge: true }),

        setDoc(mainProfileRef, {
          name: profile.name,
          personaType: profile.personaType,
          title: profile.title,
          location: profile.location,
          activeProfileId: profile.id,
          updatedAt: serverTimestamp(),
          ownerId: uid,
        }, { merge: true }),

        setDoc(financialRef, {
          monthlyInflow: profile.monthlyInflow,
          monthlyOutflow: profile.monthlyOutflow,
          emergencyFund: profile.emergencyFund,
          existingDebtObligations: profile.existingDebtObligations,
          scorePillars: profile.scorePillars,
          updatedAt: serverTimestamp(),
          ownerId: uid,
        }, { merge: true }),
      ];

      // Save under /users/{userId}/goals/primary
      if (profile.fundingNeed) {
        const goalsRef = doc(db, 'users', uid, 'goals', 'primary');
        writes.push(
          setDoc(goalsRef, {
            ...profile.fundingNeed,
            profileId: profile.id,
            updatedAt: serverTimestamp(),
            ownerId: uid,
          }, { merge: true })
        );
      }

      // Save under /users/{userId}/consent/records
      if (profile.consentSources && profile.consentSources.length > 0) {
        const consentRef = doc(db, 'users', uid, 'consent', 'records');
        writes.push(
          setDoc(consentRef, {
            sources: profile.consentSources,
            updatedAt: serverTimestamp(),
            ownerId: uid,
          }, { merge: true })
        );
      }

      // Audit log entry for profile persistence
      writes.push(
        this.logAudit({
          userId: uid,
          action: 'PROFILE_SAVED',
          details: `Saved profile updates for ${profile.name} (${profile.personaType})`,
          targetEntity: profile.id,
          timestamp: serverTimestamp(),
          zeroDemographicVerified: true,
        })
      );

      // Execute all independent writes concurrently
      await Promise.all(writes);
    } catch (err) {
      console.warn('Firestore saveUserProfile notice:', err);
    }
  }

  async getUserProfiles(): Promise<UserProfile[]> {
    try {
      const uid = this.getUserId();
      if (!uid) {
        return [];
      }
      const profilesRef = collection(db, 'users', uid, 'profiles');
      const snap = await getDocs(profilesRef);
      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.name && data.scorePillars && Array.isArray(data.scorePillars)) {
          list.push(data as UserProfile);
        }
      });

      // Fallback: If no profiles in subcollection, check main profile & financial data
      if (list.length === 0) {
        const mainDocRef = doc(db, 'users', uid, 'profile', 'main');
        const finDocRef = doc(db, 'users', uid, 'financial_data', 'current');
        const [mainSnap, finSnap] = await Promise.all([
          getDoc(mainDocRef),
          getDoc(finDocRef),
        ]);

        if (mainSnap.exists() && finSnap.exists()) {
          const mainData = mainSnap.data();
          const finData = finSnap.data();
          if (finData.scorePillars && Array.isArray(finData.scorePillars)) {
            const fallbackProfile: UserProfile = {
              id: mainData.activeProfileId || `user_${uid}`,
              name: mainData.name || 'My Profile',
              personaType: mainData.personaType || 'student',
              title: mainData.title || '',
              location: mainData.location || 'Bengaluru, India',
              monthlyInflow: finData.monthlyInflow || 25000,
              monthlyOutflow: finData.monthlyOutflow || 15000,
              emergencyFund: finData.emergencyFund || 10000,
              existingDebtObligations: finData.existingDebtObligations || 0,
              scorePillars: finData.scorePillars,
              cashflowTransactions: [],
              consentSources: [],
              disputes: [],
              fundingNeed: {
                amount: 30000,
                purpose: 'Personalized Financial Goal',
                targetDateMonths: 2,
              },
            };
            list.push(fallbackProfile);
          }
        }
      }

      return list;
    } catch (err) {
      console.warn('Firestore getUserProfiles notice:', err);
      return [];
    }
  }

  async getFinancialData(): Promise<any | null> {
    try {
      const uid = this.getUserId();
      if (!uid) return null;
      const docRef = doc(db, 'users', uid, 'financial_data', 'current');
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.warn('Firestore getFinancialData notice:', err);
      return null;
    }
  }

  async getGoals(): Promise<any | null> {
    try {
      const uid = this.getUserId();
      if (!uid) return null;
      const docRef = doc(db, 'users', uid, 'goals', 'primary');
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.warn('Firestore getGoals notice:', err);
      return null;
    }
  }

  async getConsentRecords(): Promise<ConsentSource[] | null> {
    try {
      const uid = this.getUserId();
      if (!uid) return null;
      const docRef = doc(db, 'users', uid, 'consent', 'records');
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data()?.sources || [] : null;
    } catch (err) {
      console.warn('Firestore getConsentRecords notice:', err);
      return null;
    }
  }

  // --- CASHFLOW TRANSACTIONS ---
  async addTransaction(profileId: string, tx: Omit<CashflowEntry, 'id'>): Promise<CashflowEntry> {
    const newId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: CashflowEntry = {
      id: newId,
      ...tx
    };

    const uid = this.getUserId();
    if (!uid) {
      return newTx;
    }

    try {
      const txRef = doc(db, 'users', uid, 'transactions', newId);
      await setDoc(txRef, {
        ...newTx,
        profileId,
        ownerId: uid,
        createdAt: serverTimestamp()
      });

      await this.logAudit({
        userId: uid,
        action: 'DATA_SYNCED',
        details: `Added ${tx.type === 'inflow' ? 'income' : 'expense'} transaction: ₹${tx.amount} (${tx.title})`,
        targetEntity: newId,
        timestamp: serverTimestamp(),
        zeroDemographicVerified: true
      });
    } catch (err) {
      console.warn('Firestore addTransaction fallback:', err);
    }

    return newTx;
  }

  async deleteTransaction(txId: string): Promise<void> {
    try {
      const uid = this.getUserId();
      if (!uid) return;
      const txRef = doc(db, 'users', uid, 'transactions', txId);
      await deleteDoc(txRef);
    } catch (err) {
      console.warn('Firestore deleteTransaction fallback:', err);
    }
  }

  // --- CONSENT SOURCES ---
  async updateConsentStatus(profileId: string, sourceId: string, status: 'active' | 'revoked' | 'pending'): Promise<void> {
    try {
      const uid = this.getUserId();
      if (!uid) return;
      const consentRef = doc(db, 'users', uid, 'consent_sources', sourceId);
      await setDoc(consentRef, {
        sourceId,
        profileId,
        status,
        updatedAt: serverTimestamp(),
        ownerId: uid,
      }, { merge: true });

      await this.logAudit({
        userId: uid,
        action: status === 'active' ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        details: `Consent source [${sourceId}] set to status '${status}'`,
        targetEntity: sourceId,
        timestamp: serverTimestamp(),
        zeroDemographicVerified: true,
      });
    } catch (err) {
      console.warn('Firestore updateConsentStatus fallback:', err);
    }
  }

  // --- DISPUTES ---
  async submitDispute(profileId: string, dispute: DisputeRecord): Promise<void> {
    try {
      const uid = this.getUserId();
      if (!uid) return;
      const disputeRef = doc(db, 'users', uid, 'disputes', dispute.id);
      await setDoc(disputeRef, {
        ...dispute,
        profileId,
        ownerId: uid,
        createdAt: serverTimestamp(),
      });

      await this.logAudit({
        userId: uid,
        action: 'DISPUTE_RAISED',
        details: `Dispute logged for metric '${dispute.metricName}'. Reason: ${dispute.reason}`,
        targetEntity: dispute.id,
        timestamp: serverTimestamp(),
        zeroDemographicVerified: true,
      });
    } catch (err) {
      console.warn('Firestore submitDispute fallback:', err);
    }
  }

  // --- AUDIT TRAIL ---
  async logAudit(entry: AuditLogEntry): Promise<void> {
    try {
      const uid = entry.userId || this.getUserId();
      if (!uid) return;
      const auditRef = collection(db, 'users', uid, 'audit_trail');
      await addDoc(auditRef, {
        ...entry,
        userId: uid,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore logAudit fallback:', err);
    }
  }

  async getAuditTrail(): Promise<AuditLogEntry[]> {
    try {
      const uid = this.getUserId();
      if (!uid) return [];
      const auditRef = collection(db, 'users', uid, 'audit_trail');
      const q = query(auditRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const list: AuditLogEntry[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AuditLogEntry);
      });
      return list;
    } catch (err) {
      console.warn('Firestore getAuditTrail fallback:', err);
      return [];
    }
  }

  // --- AI COACH CONVERSATIONS ---
  async saveChatMessage(profileId: string, sender: 'user' | 'ai', text: string): Promise<void> {
    try {
      const uid = this.getUserId();
      if (!uid) return;
      const chatRef = collection(db, 'users', uid, 'coaching_sessions');
      await addDoc(chatRef, {
        userId: uid,
        profileId,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore saveChatMessage fallback:', err);
    }
  }

  async getChatHistory(profileId: string): Promise<ChatMessageEntry[]> {
    try {
      const uid = this.getUserId();
      if (!uid) return [];
      const chatRef = collection(db, 'users', uid, 'coaching_sessions');
      const q = query(chatRef, where('profileId', '==', profileId));
      const snap = await getDocs(q);
      const list: ChatMessageEntry[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ChatMessageEntry);
      });
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeA - timeB;
      });
      return list;
    } catch (err) {
      console.warn('Firestore getChatHistory fallback:', err);
      return [];
    }
  }
}

export const dbService = new DatabaseService();
