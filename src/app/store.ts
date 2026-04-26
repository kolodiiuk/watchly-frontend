import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi.ts';
import { listenerMiddleware } from './listeners.ts';
import authSlice from '../features/auth/services/authSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware, listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
