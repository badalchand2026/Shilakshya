
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAccessToken,
  refreshSession,
  setAccessToken,
  setSessionHandlers,
} from "@/services/api/api";

import {
  loginUser,
  logoutUser,
} from "@/features/auth/auth-api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateSession = useCallback((session) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  // Restore the user's session when the application loads.
  useEffect(() => {
    setSessionHandlers({
      onExpired: clearSession,
      onUpdated: updateSession,
    });

    const restoreSession = async () => {
      try {
        const session = await refreshSession();
        updateSession(session);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [clearSession, updateSession]);

  const login = async (credentials) => {
    const result = await loginUser(credentials);

    const session = {
      accessToken: result.data.accessToken,
      user: result.data.user,
    };

    updateSession(session);

    return session.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearSession();
    };
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user && getAccessToken()),
    login,
    logout,
    clearSession,
    updateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
