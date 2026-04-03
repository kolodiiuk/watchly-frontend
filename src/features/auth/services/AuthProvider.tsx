import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { User } from '../../../app/models/User.ts';
import { AUTH_STORAGE_EVENT, clearStoredUser, getStoredUser, setStoredUser } from './authStorage.ts';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (user: User) => void;
  signUp: (user: User) => void;
  signOut: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    window.addEventListener('storage', syncUser);
    window.addEventListener(AUTH_STORAGE_EVENT, syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener(AUTH_STORAGE_EVENT, syncUser);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn: nextUser => {
        setStoredUser(nextUser);
        setUser(nextUser);
      },
      signUp: nextUser => {
        setStoredUser(nextUser);
        setUser(nextUser);
      },
      signOut: () => {
        clearStoredUser();
        setUser(null);
      },
      refreshUser: () => {
        setUser(getStoredUser());
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
