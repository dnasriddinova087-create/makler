import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLogin: (role: 'CLIENT' | 'BROKER' | 'ADMIN') => Promise<void>;
  favoritesIds: string[];
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ijara_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('ijara_token')) {
        setUser(null);
        setFavoritesIds([]);
        setLoading(false);
        return;
      }
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
        // Load favorite ids
        try {
          const favRes = await api.favorites.getIds();
          if (favRes.success) {
            setFavoritesIds(favRes.ids);
          }
        } catch {
          // Ignore
        }
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.auth.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('ijara_token', res.token);
      setToken(res.token);
      setUser(res.user);
      const favRes = await api.favorites.getIds().catch(() => ({ success: false, ids: [] }));
      if (favRes.success) setFavoritesIds(favRes.ids);
    }
  };

  const register = async (data: any) => {
    const res = await api.auth.register(data);
    if (res.success && res.token) {
      localStorage.setItem('ijara_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('ijara_token');
    setToken(null);
    setUser(null);
    setFavoritesIds([]);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const quickLogin = async (role: 'CLIENT' | 'BROKER' | 'ADMIN') => {
    let email = 'client@ijara.uz';
    let password = 'ijara123';

    if (role === 'BROKER') {
      email = 'dnasriddinova087@gmail.com';
      password = 'ijara123';
    } else if (role === 'ADMIN') {
      email = 'admin@ijara.uz';
      password = 'admin123';
    }

    await login({ email, password });
  };

  const toggleFavorite = async (propertyId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('Sevimlilarga qo‘shish uchun avval tizimga kiring');
    }
    const res = await api.favorites.toggle(propertyId);
    if (res.success) {
      if (res.saved) {
        setFavoritesIds((prev) => [...prev, propertyId]);
      } else {
        setFavoritesIds((prev) => prev.filter((id) => id !== propertyId));
      }
      return res.saved;
    }
    return false;
  };

  const isFavorite = (propertyId: string) => {
    return favoritesIds.includes(propertyId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
        favoritesIds,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
