import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load (and on every refresh), ask the server who is logged in
  useEffect(() => {
    api('/portal/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const loggedIn = await api('/portal/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(loggedIn);
    return loggedIn;
  };

  const register = (data) => api('/portal/auth/register', { method: 'POST', body: data });

  const logout = async () => {
    await api('/portal/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);