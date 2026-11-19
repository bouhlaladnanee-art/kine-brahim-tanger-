import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = async (email, password) => {
    setLoading(true);
    // Simulation auth - sera branchée à Firebase Auth en Phase 4
    await new Promise(r => setTimeout(r, 400));
    
    // Accepte kine@tanger.ma ou toute combinaison valide
    const userObj = {
      email: email || 'kine@tanger.ma',
      displayName: 'Brahim El Mansouri',
      role: 'kine_admin',
      token: 'mock-session-token-' + Date.now()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    setCurrentUser(userObj);
    setLoading(false);
    return userObj;
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser, loading }}>
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
