import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'kine_tanger_auth_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Synchronisation Firebase Auth si configuré
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'BOUHLAL Ibrahim',
            isFirebase: true
          };
          setCurrentUser(userObj);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
        } else {
          // Si Firebase est configuré mais déconnecté
          if (currentUser?.isFirebase) {
            setCurrentUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser?.isFirebase]);

  const login = async (email, password) => {
    setLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const userObj = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'BOUHLAL Ibrahim',
          isFirebase: true
        };
        setCurrentUser(userObj);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
        setLoading(false);
        return userObj;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      // Mode simulation / local si Firebase n'a pas encore de projet associé
      await new Promise(r => setTimeout(r, 400));
      const userObj = {
        email: email || 'kine@tanger.ma',
        displayName: 'BOUHLAL Ibrahim',
        role: 'kine_admin',
        isFirebase: false,
        token: 'local-session-token-' + Date.now()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj);
      setLoading(false);
      return userObj;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn("Erreur déconnexion Firebase :", e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isAuthenticated: !!currentUser, 
      loading,
      isFirebaseConfigured 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
