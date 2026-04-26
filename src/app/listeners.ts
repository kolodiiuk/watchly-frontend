import { createListenerMiddleware } from '@reduxjs/toolkit';
import { clearCredentials, setCredentials } from '../features/auth/services/authSlice.ts';
import { authApi } from './api/authApi.ts';
import type { RootState } from './store.ts';
import { resolveRole } from '../features/auth/services/authSession.ts';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: authApi.endpoints.signIn.matchFulfilled,
  effect: (action, listenerApi) => {
    const { user: payloadUser, role, token, refreshToken } = action.payload;
    const user = payloadUser ?? null;
    listenerApi.dispatch(setCredentials({ user, role, token, refreshToken }));
  },
});

listenerMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchFulfilled,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const { user: payloadUser, role: payloadRole, token, refreshToken } = action.payload;
    const user = payloadUser ?? state.auth.user ?? null;
    const role = resolveRole({ user, role: payloadRole ?? state.auth.role });
    listenerApi.dispatch(setCredentials({ user, role, token, refreshToken }));
  },
});

listenerMiddleware.startListening({
  matcher: authApi.endpoints.signOut.matchFulfilled,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(clearCredentials());
  },
});

listenerMiddleware.startListening({
  matcher: authApi.endpoints.signOut.matchRejected,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(clearCredentials());
  },
});
