import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthProvider } from './features/auth/services/AuthProvider.tsx';
import { MovieThemeProvider } from './theme/MovieThemeProvider';
import { cinemaNoirTheme } from './theme/movieTheme';
import { injectStore } from './features/auth/services/axiosConfig.ts';

injectStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MovieThemeProvider theme={cinemaNoirTheme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MovieThemeProvider>
    </Provider>
  </StrictMode>
);
