import { createContext, useContext, useMemo, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import type { User } from '../../../app/models/User.ts';
import { useSignOutMutation } from '../../../app/api/authApi.ts';
import { clearCredentials, initializeAuth } from './authSlice.ts';
import { authStorage } from './authStorage.ts';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store.ts';

type AuthContextValue = {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useDispatch<AppDispatch>();
  const [signOutMutation] = useSignOutMutation();

  const authState = useSelector((state: RootState) => state.auth);
  const { user: authUser, role, isAuthenticated } = authState;

  const refreshUser = useCallback(async () => {
    await dispatch(initializeAuth()).unwrap();
  }, [dispatch]);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await signOutMutation({ refreshToken }).unwrap();
      }
    } finally {
      dispatch(clearCredentials());
    }
  }, [dispatch, signOutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authUser as User | null,
      role,
      isAuthenticated,
      refreshUser,
      signOut,
    }),
    [authUser, role, isAuthenticated, refreshUser, signOut]
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
