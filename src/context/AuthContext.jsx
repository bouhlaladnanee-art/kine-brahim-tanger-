import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userObj = buildUserObj(session.user);
        setCurrentUser(userObj);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      } else {
        // Session Supabase absente/expirée : l'utilisateur mémorisé localement n'a plus
        // aucun droit de lecture. On le déconnecte pour forcer une vraie connexion.
        setCurrentUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userObj = buildUserObj(session.user);
        setCurrentUser(userObj);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      } else if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function buildUserObj(sbUser) {
    return {
      uid: sbUser.id,
      email: sbUser.email,
      phone: sbUser.phone,
      displayName: sbUser.user_metadata?.full_name || 'BOUHLAL Ibrahim',
      isSupabase: true,
    };
  }

  const login = async (email, password) => {
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userObj = buildUserObj(data.user);
        setCurrentUser(userObj);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
        setLoading(false);
        return userObj;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 400));
      const userObj = {
        email: email || 'kine@tanger.ma',
        displayName: 'BOUHLAL Ibrahim',
        role: 'kine_admin',
        isSupabase: false,
        token: 'local-session-token-' + Date.now(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj);
      setLoading(false);
      return userObj;
    }
  };

  const sendPhoneCode = async (email, _containerId) => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setLoading(false);
        return {
          confirm: async (token) => {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              email,
              token,
              type: 'email',
            });
            if (verifyError) throw verifyError;
            const userObj = buildUserObj(data.user);
            setCurrentUser(userObj);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
            return { user: userObj };
          }
        };
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 600));
      setLoading(false);
      return {
        confirm: async (code) => {
          if (code === '123456' || code.length === 6) {
            const userObj = {
              email,
              displayName: 'BOUHLAL Ibrahim',
              role: 'kine_admin',
              isSupabase: false,
              token: 'local-otp-token-' + Date.now(),
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
            setCurrentUser(userObj);
            return { user: userObj };
          }
          throw new Error('Code de vérification invalide');
        }
      };
    }
  };

  const confirmPhoneCode = async (confirmationResult, verificationCode) => {
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      setLoading(false);
      return result.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Erreur déconnexion Supabase :', e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      sendPhoneCode,
      confirmPhoneCode,
      logout,
      isAuthenticated: !!currentUser,
      loading,
      isSupabaseConfigured,
      isFirebaseConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
