import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authStorage } from './authStorage.ts';
import { API_BASE_URL } from '../../../app/api/baseApi.ts';
import type { AuthSessionResponse } from './authSession.ts';
import { resolveRole } from './authSession.ts';
import type { User } from '../../../app/models/User.ts';

type StoredUser = User & { role?: string | null };

const getStoredAuthState = () => {
  const storedUser = authStorage.getUser<StoredUser>();
  const storedRole = authStorage.getRole();
  const resolvedRole = storedRole ?? storedUser?.role ?? storedUser?.userRoles?.[0] ?? null;

  return {
    user: storedUser ? { ...storedUser, role: resolvedRole } : null,
    role: resolvedRole,
    isAuthenticated: Boolean(storedUser),
  };
};

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    authStorage.clearTokens();
    authStorage.clearRole();
    return rejectWithValue('Session expired');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = (await response.json()) as AuthSessionResponse;
    authStorage.setAccessToken(data.token);
    authStorage.setRefreshToken(data.refreshToken);
    const storedUser = authStorage.getUser<StoredUser>();
    const resolvedRole = resolveRole({
      user: data.user ?? storedUser ?? null,
      role: data.role ?? authStorage.getRole(),
    });
    authStorage.setRole(resolvedRole);
    if (data.user ?? storedUser) {
      authStorage.setUser(data.user ?? storedUser);
    }
    return data;
  } catch {
    authStorage.clearAll();
    return rejectWithValue('Session expired');
  }
});

interface AuthState {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  ...getStoredAuthState(),
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: User | null;
        role?: string | null;
        token?: string | null;
        refreshToken?: string | null;
      }>
    ) {
      const role = resolveRole({ user: action.payload.user, role: action.payload.role });
      state.role = role;
      state.user = action.payload.user ? { ...action.payload.user, role } : null;
      state.isAuthenticated = Boolean(state.user);

      if (state.user) {
        authStorage.setAccessToken(action.payload.token ?? null);
        authStorage.setRefreshToken(action.payload.refreshToken ?? null);
        authStorage.setRole(role);
        authStorage.setUser(state.user);
      } else {
        authStorage.clearAll();
      }
    },
    clearCredentials(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      authStorage.clearAll();
    },
    setNewUserName(state: AuthState, action: PayloadAction<string>) {
      if (state.user === null) {
        return;
      }

      state.user.userName = action.payload;
      authStorage.setUser(state.user);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        const storedUser = authStorage.getUser<StoredUser>();
        const storedRole = authStorage.getRole();
        const user = action.payload.user ?? storedUser ?? null;
        const role = resolveRole({
          user,
          role: action.payload.role ?? storedRole,
        });

        state.role = role;
        state.user = user ? { ...user, role } : null;
        state.isAuthenticated = Boolean(state.user);
        authStorage.setAccessToken(action.payload.token);
        authStorage.setRefreshToken(action.payload.refreshToken);
        authStorage.setRole(role);
        if (state.user) {
          authStorage.setUser(state.user);
        }
      })
      .addCase(initializeAuth.rejected, state => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        authStorage.clearAll();
      });
  },
});

export const { setCredentials, clearCredentials, setNewUserName } = authSlice.actions;
export default authSlice.reducer;
