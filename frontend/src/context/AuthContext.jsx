import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signIn, signUp, signOut } from '../api/endpoints';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedUser  = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await signIn({ email, password });
    // Backend shape: { success, message, data: { token, user } }
    const { token: t, user } = res.data?.data || {};
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(t);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await signUp({ name, email, password });
    // Backend shape: { success, message, data: { token, user } }
    const { token: t, user } = res.data?.data || {};
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(t);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (_) {
      // ignore server errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
