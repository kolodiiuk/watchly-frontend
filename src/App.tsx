import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from './app/routes/AppRouter';
import { initializeAuth } from './features/auth/services/authSlice';
import type { AppDispatch, RootState } from './app/store';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitializing } = useSelector((state: RootState) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-500 border-t-transparent shadow-md"></div>
      </div>
    );
  }

  return <AppRouter />;
}
