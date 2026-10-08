import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, formatAuthError } from '../lib/firebase';
import WebLoadingScreen from '../components/shared/WebLoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('grindtrack_demo_mode');
    return saved === 'true';
  });
  const [loading, setLoading] = useState(true);

  // Demo user fallback profile
  const demoUser = {
    uid: 'demo_user_123',
    email: 'alex.grindtrack@example.com',
    displayName: 'Alex Rivers',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isDemo: true,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        localStorage.setItem('grindtrack_demo_mode', 'false');

        // Ensure user document exists in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Member',
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              xp: 0,
              unlockedAchievements: [],
              dailyLogs: {},
              roadmapProgress: {},
              profile: {
                bio: 'DSA & System Design Enthusiast',
                targetRole: 'Software Engineer',
                leetcodeUsername: '',
                githubUsername: '',
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Note: Could not sync initial user record to Firestore:', e);
        }
      } else {
        if (isDemoMode) {
          setCurrentUser(demoUser);
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const loginWithDemo = () => {
    setIsDemoMode(true);
    localStorage.setItem('grindtrack_demo_mode', 'true');
    setCurrentUser(demoUser);
  };

  const login = async (email, password) => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const signup = async (email, password, displayName = '') => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Initialize the user's document directly inside /users/{uid} in database
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || email,
          displayName: displayName || user.displayName || email.split('@')[0],
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          xp: 0,
          unlockedAchievements: [],
          dailyLogs: {},
          roadmapProgress: {},
          profile: {
            bio: 'DSA & System Design Enthusiast',
            targetRole: 'Software Engineer',
            leetcodeUsername: '',
            githubUsername: '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn('Warning: Firestore user profile initialization:', firestoreErr);
      }

      return userCredential;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const loginWithGoogle = async () => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Ensure user document exists in database
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Member',
            photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            xp: 0,
            unlockedAchievements: [],
            dailyLogs: {},
            roadmapProgress: {},
            profile: {
              bio: 'DSA & System Design Enthusiast',
              targetRole: 'Software Engineer',
              leetcodeUsername: '',
              githubUsername: '',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Warning: Firestore Google user profile sync:', firestoreErr);
      }

      return userCredential;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const logout = async () => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const updateUserProfileData = async (updates) => {
    if (currentUser && !isDemoMode) {
      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentUser, {
          displayName: updates.displayName || currentUser.displayName,
          photoURL: updates.photoURL || currentUser.photoURL,
        });
      }
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  };

  const value = {
    currentUser,
    isDemoMode,
    login,
    signup,
    loginWithGoogle,
    loginWithDemo,
    logout,
    updateUserProfileData,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <WebLoadingScreen message="Initializing GrindTrack Web..." /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
