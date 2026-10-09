import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, formatAuthError } from '../lib/firebase';
import WebLoadingScreen from '../components/shared/WebLoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clean up any residual demo mode localstorage flags
  useEffect(() => {
    localStorage.removeItem('grindtrack_demo_mode');
  }, []);

  useEffect(() => {
    // Process redirect sign-in result if returning from signInWithRedirect
    getRedirectResult(auth)
      .then((userCredential) => {
        if (userCredential?.user) {
          setCurrentUser(userCredential.user);
        }
      })
      .catch((redirectErr) => {
        console.warn('Redirect auth notice:', redirectErr);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Ensure user document exists in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const defaultProfile = {
              bio: 'DSA & System Design Enthusiast',
              targetRole: 'Software Engineer',
              leetcodeUsername: '',
              githubUsername: '',
            };
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Member',
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              userInfo: {
                profile: defaultProfile,
                xp: 0,
                streak: 0,
                badges: [],
                roadmap: {},
              },
              problems: [],
              tasks: [],
              profile: defaultProfile,
              xp: 0,
              streak: 0,
              badges: [],
              unlockedAchievements: [],
              dailyLogs: {},
              roadmapProgress: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Note: Could not sync initial user record to Firestore:', e);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const signup = async (email, password, displayName = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Initialize the user's document directly inside /users/{uid} in database
      try {
        const defaultProfile = {
          bio: 'DSA & System Design Enthusiast',
          targetRole: 'Software Engineer',
          leetcodeUsername: '',
          githubUsername: '',
        };
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || email,
          displayName: displayName || user.displayName || email.split('@')[0],
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          userInfo: {
            profile: defaultProfile,
            xp: 0,
            streak: 0,
            badges: [],
            roadmap: {},
          },
          problems: [],
          tasks: [],
          profile: defaultProfile,
          xp: 0,
          streak: 0,
          badges: [],
          unlockedAchievements: [],
          dailyLogs: {},
          roadmapProgress: {},
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
    try {
      // First attempt with popup
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential;
    } catch (err) {
      // If popup was blocked by browser or closed due to cross-origin/cookie policies, fall back to redirect
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup blocked/closed. Seamlessly switching to redirect sign-in flow...');
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw new Error(formatAuthError(err));
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const updateUserProfileData = async (updates) => {
    if (currentUser) {
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

  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email || currentUser?.email);
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const value = {
    currentUser,
    isDemoMode: false,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfileData,
    sendPasswordReset,
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
