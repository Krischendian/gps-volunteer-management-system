import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WorkSession, Activity, AuthState, UserRole } from '../types';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  onSnapshot
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
  
  totalHours: number;
  
  appLogo: string | null;
  setAppLogo: (logo: string) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Activities (used if DB is empty)
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Community Garden Cleanup',
    date: '2023-11-15',
    location: 'Central Park Garden',
    description: 'Help us maintain the beauty of our therapeutic garden for gifted individuals.',
    image: 'https://picsum.photos/400/200?random=1',
    capacity: 20,
    registeredCount: 12,
  },
  {
    id: '2',
    title: 'Art Workshop Assistant',
    date: '2023-11-20',
    location: 'GPS Center, Room 3B',
    description: 'Assist during our weekly creative expression workshop.',
    image: 'https://picsum.photos/400/200?random=2',
    capacity: 5,
    registeredCount: 3,
  },
  {
    id: '3',
    title: 'Holiday Food Drive',
    date: '2023-12-05',
    location: 'Main Hall',
    description: 'Organizing and packing food baskets for families in need.',
    image: 'https://picsum.photos/400/200?random=3',
    capacity: 50,
    registeredCount: 45,
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [appLogo, setAppLogoState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
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
      } else {
        setUserState({ user: null, isAuthenticated: false });
        setSessions([]); // Clear data on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Data (Sessions & Activities)
  useEffect(() => {
    if (!userState.user) return;

    // Fetch Activities
    const qActivities = collection(db, 'activities');
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      const acts: Activity[] = [];
      snapshot.forEach(doc => acts.push({ ...doc.data(), id: doc.id } as Activity));
      
      // If no activities in DB, use mock and save them (init helper)
      if (acts.length === 0) {
        MOCK_ACTIVITIES.forEach(async (act) => {
             const { id, ...data } = act;
             await addDoc(collection(db, 'activities'), data);
        });
        setActivities(MOCK_ACTIVITIES);
      } else {
        setActivities(acts);
      }
    });

    // Fetch Sessions (Admin sees all, User sees own)
    let qSessions;
    if (userState.user.role === UserRole.ADMIN) {
      qSessions = query(collection(db, 'sessions'));
    } else {
      qSessions = query(collection(db, 'sessions'), where('userId', '==', userState.user.id));
    }

    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const sess: WorkSession[] = [];
      snapshot.forEach(doc => sess.push({ ...doc.data(), id: doc.id } as WorkSession));
      setSessions(sess);
    });

    return () => {
      unsubActivities();
      unsubSessions();
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
    await setDoc(doc(db, 'users', res.user.uid), {
      ...userData,
      email,
      id: res.user.uid,
      role,
      orientationSigned: userData.orientationSigned || false
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const logSession = async (data: Omit<WorkSession, 'id' | 'userId'>) => {
    if (!userState.user) return;
    await addDoc(collection(db, 'sessions'), {
      ...data,
      userId: userState.user.id,
      timestamp: new Date()
    });
  };

  const signOrientation = async () => {
    if (!userState.user) return;
    const userRef = doc(db, 'users', userState.user.id);
    await updateDoc(userRef, {
      orientationSigned: true,
      orientationDate: new Date().toISOString()
    });
    // Optimistic update
    setUserState(prev => ({
        ...prev,
        user: { ...prev.user!, orientationSigned: true, orientationDate: new Date().toISOString() }
    }));
  };

  const registerForActivity = async (activityId: string) => {
    // In a real app, use arrayUnion logic or subcollection
    // Simplified logic: increment local counter for now or update doc
    const act = activities.find(a => a.id === activityId);
    if (act) {
       const actRef = doc(db, 'activities', activityId);
       await updateDoc(actRef, {
         registeredCount: act.registeredCount + 1,
         // Note: Real implementation needs a subcollection to track WHO registered to prevent double signup
       });
       
       // Hack for UI state in this simplified demo
       setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: true} : a));
    }
  };

  const cancelRegistration = async (activityId: string, reason: string) => {
     console.log('Cancellation reason:', reason);
     const act = activities.find(a => a.id === activityId);
     if (act) {
        const actRef = doc(db, 'activities', activityId);
        await updateDoc(actRef, {
          registeredCount: Math.max(0, act.registeredCount - 1)
        });
        setActivities(prev => prev.map(a => a.id === activityId ? {...a, isRegistered: false} : a));
     }
  };

  const setAppLogo = (logo: string) => {
    setAppLogoState(logo);
    // Ideally save to storage, skipping for now
  };

  const totalHours = sessions.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <StoreContext.Provider value={{ 
      auth: userState, login, register, logout, signOrientation, 
      sessions, logSession, 
      activities, registerForActivity, cancelRegistration,
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