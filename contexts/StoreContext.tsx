
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WorkSession, Activity, AuthState, UserRole } from '../types';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

interface StoreContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => void;
  signOrientation: () => void;
  
  sessions: WorkSession[];
  logSession: (session: Omit<WorkSession, 'id' | 'userId'>) => void;
  
  activities: Activity[];
  registerForActivity: (activityId: string) => void;
  cancelRegistration: (activityId: string, reason: string) => void;
  
  // New Admin Actions & Data
  addActivity: (activity: Omit<Activity, 'id' | 'registeredCount' | 'isRegistered'>) => Promise<void>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  allUsers: User[]; // List of all users for admin

  totalHours: number;
  
  appLogo: string | null;
  setAppLogo: (logo: string) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Activities (used if DB is empty or inaccessible)
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'christmas_party_001',
    title: '儿童圣诞Party 义工招募',
    date: '2025-12-20', // Set to a Saturday
    location: '250 Ferrier Street A1, Markham, L3R 2Z5',
    description: '活动内容：儿童圣诞party。主要工作：布置场地，协助活动，收尾打扫等。\n时间：12:30pm – 3:30 pm\n\n*可签义工时数表',
    image: 'https://images.unsplash.com/photo-1512474932049-78ea696f5c42?q=80&w=800&auto=format&fit=crop', // Festive Christmas Image
    capacity: 10,
    registeredCount: 0,
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Admin only
  
  // Use state for logo, fetched from Firestore
  const [appLogo, setAppLogoState] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUserState({
              isAuthenticated: true,
              user: { ...userData, id: firebaseUser.uid }
            });
          } else {
            // Fallback if doc doesn't exist yet
            setUserState({
              isAuthenticated: true,
              user: { 
                id: firebaseUser.uid, 
                name: firebaseUser.displayName || firebaseUser.email || 'Volunteer',
                email: firebaseUser.email || '',
                orientationSigned: false,
                role: UserRole.VOLUNTEER
              }
            });
          }
        } catch (error) {
           console.error("Error fetching user profile:", error);
           // Allow login even if profile fetch fails (e.g. permission issues)
           setUserState({
              isAuthenticated: true,
              user: { 
                id: firebaseUser.uid, 
                name: firebaseUser.displayName || firebaseUser.email || 'Volunteer',
                email: firebaseUser.email || '',
                orientationSigned: false,
                role: UserRole.VOLUNTEER
              }
            });
        }
      } else {
        setUserState({ user: null, isAuthenticated: false });
        setSessions([]); // Clear data on logout
        setAllUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Data (Sessions & Activities & Global Settings & Users if Admin)
  useEffect(() => {
    // Global Settings Listener (Logo)
    const settingsRef = doc(db, 'settings', 'general');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.logoUrl) {
          setAppLogoState(data.logoUrl);
        }
      }
    }, (error) => {
        console.warn("Global settings sync failed (likely permissions):", error.code);
    });

    if (!userState.user) {
        return () => unsubSettings();
    }

    // Fetch Activities
    const qActivities = collection(db, 'activities');
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      const acts: Activity[] = [];
      snapshot.forEach(doc => acts.push({ ...doc.data(), id: doc.id } as Activity));
      
      // If no activities in DB, use mock and save them (init helper)
      if (acts.length === 0) {
        MOCK_ACTIVITIES.forEach(async (act) => {
             const { id, ...data } = act;
             try {
                await addDoc(collection(db, 'activities'), data);
             } catch(e) { 
                 // Ignore write errors
             }
        });
        setActivities(MOCK_ACTIVITIES);
      } else {
        setActivities(acts);
      }
    }, (error) => {
        console.warn("Activities sync failed:", error.message);
        setActivities(MOCK_ACTIVITIES);
    });

    // Fetch Sessions (Admin sees all, User sees own)
    let qSessions;
    if (userState.user.role === UserRole.ADMIN) {
      qSessions = collection(db, 'sessions');
    } else {
      qSessions = query(collection(db, 'sessions'), where('userId', '==', userState.user.id));
    }

    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const sess: WorkSession[] = [];
      snapshot.forEach(doc => sess.push({ ...doc.data(), id: doc.id } as WorkSession));
      setSessions(sess);
    }, (error) => {
        console.warn("Sessions sync failed:", error.message);
        setSessions([]);
    });

    // Fetch All Users (Admin Only)
    let unsubUsers = () => {};
    if (userState.user.role === UserRole.ADMIN) {
        const qUsers = collection(db, 'users');
        unsubUsers = onSnapshot(qUsers, (snapshot) => {
            const usersList: User[] = [];
            snapshot.forEach(doc => usersList.push({ ...doc.data(), id: doc.id } as User));
            setAllUsers(usersList);
        }, (error) => {
            console.warn("Users sync failed:", error.message);
        });
    }

    return () => {
      unsubSettings();
      unsubActivities();
      unsubSessions();
      unsubUsers();
    };
  }, [userState.user]);

  // Actions
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, userData: any) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const role = email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.VOLUNTEER;
    
    // Create User Document in Firestore
    try {
        if (res.user) {
            await setDoc(doc(db, 'users', res.user.uid), {
              ...userData,
              email,
              id: res.user.uid,
              role,
              orientationSigned: userData.orientationSigned || false
            });
        }
    } catch (error) {
        console.error("Error creating user profile doc:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const logSession = async (data: Omit<WorkSession, 'id' | 'userId'>) => {
    if (!userState.user) return;
    try {
        await addDoc(collection(db, 'sessions'), {
          ...data,
          userId: userState.user.id,
          timestamp: new Date()
        });
    } catch (error) {
        console.error("Error logging session:", error);
        alert("Failed to save session. Check your connection or permissions.");
    }
  };

  const signOrientation = async () => {
    if (!userState.user) return;
    const userRef = doc(db, 'users', userState.user.id);
    try {
        await updateDoc(userRef, {
          orientationSigned: true,
          orientationDate: new Date().toISOString()
        });
        // Optimistic update
        setUserState(prev => ({
            ...prev,
            user: { ...prev.user!, orientationSigned: true, orientationDate: new Date().toISOString() }
        }));
    } catch (error) {
        console.error("Error signing orientation:", error);
    }
  };

  const registerForActivity = async (activityId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (act) {
       const actRef = doc(db, 'activities', activityId);
       try {
           await updateDoc(actRef, {
             registeredCount: act.registeredCount + 1,
           });
           setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: true} : a));
       } catch (error) {
           console.error("Error registering:", error);
           setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: true} : a));
       }
    }
  };

  const cancelRegistration = async (activityId: string, reason: string) => {
     console.log('Cancellation reason:', reason);
     const act = activities.find(a => a.id === activityId);
     if (act) {
        const actRef = doc(db, 'activities', activityId);
        try {
            await updateDoc(actRef, {
              registeredCount: Math.max(0, act.registeredCount - 1)
            });
            setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: false} : a));
        } catch (error) {
            console.error("Error cancelling:", error);
            setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: false} : a));
        }
     }
  };

  // --- New Admin Functions ---

  const addActivity = async (activity: Omit<Activity, 'id' | 'registeredCount' | 'isRegistered'>) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activity,
        registeredCount: 0,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  const updateActivity = async (id: string, data: Partial<Activity>) => {
    try {
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, data);
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const activityRef = doc(db, 'activities', id);
      await deleteDoc(activityRef);
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  };

  const setAppLogo = async (logo: string) => {
    setAppLogoState(logo);
    try {
        await setDoc(doc(db, 'settings', 'general'), { 
            logoUrl: logo,
            updatedBy: userState.user?.id || 'unknown',
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Failed to sync logo to cloud:", error);
    }
  };

  const totalHours = sessions.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <StoreContext.Provider value={{ 
      auth: userState, login, register, logout, signOrientation, 
      sessions, logSession, 
      activities, registerForActivity, cancelRegistration,
      addActivity, updateActivity, deleteActivity,
      allUsers,
      totalHours,
      appLogo, setAppLogo,
      loading
    }}>
      {!loading && children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
