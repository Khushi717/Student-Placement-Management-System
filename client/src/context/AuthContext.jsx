import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient, { TOKEN_KEY } from '../services/apiClient';
import * as authApi from '../modules/authentication/auth.api';

const AuthContext = createContext(null);

/**
 * JWT STORAGE STRATEGY (documented trade-off): the token is kept in localStorage so sessions survive a refresh.
 * localStorage is readable by any script on the page, so XSS would expose it; httpOnly cookies are the safer
 * upgrade path. Logout removes the token locally; the server cannot revoke it (see README -> Security).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setCompany(null);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data.user);
    setCompany(data.company);
    return data;
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    refresh().catch(clear).finally(() => setLoading(false));
  }, [refresh, clear]);

  useEffect(() => {
    window.addEventListener('spms:unauthorized', clear);
    return () => window.removeEventListener('spms:unauthorized', clear);
  }, [clear]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    await refresh();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    await refresh();
    return data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* stateless endpoint; ignore network errors */ }
    clear();
  };

  const value = useMemo(() => ({ user, company, loading, login, register, logout, refresh }), [user, company, loading, refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
