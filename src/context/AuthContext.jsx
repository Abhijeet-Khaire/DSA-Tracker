import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import WebLoadingScreen from '../components/shared/WebLoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('grindtrack_demo_mode');
    return saved !== null ? saved === 'true' : true;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        localStorage.setItem('grindtrack_demo_mode', 'false');
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

  const login = (email, password) => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    setIsDemoMode(false);
    localStorage.setItem('grindtrack_demo_mode', 'false');
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      setIsDemoMode(false);
      localStorage.setItem('grindtrack_demo_mode', 'false');
    } else {
      await signOut(auth);
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
