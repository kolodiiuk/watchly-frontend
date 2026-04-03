import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './features/auth/services/AuthProvider.tsx';
import { MovieThemeProvider } from './theme/MovieThemeProvider';
import { cinemaNoirTheme } from './theme/movieTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MovieThemeProvider theme={cinemaNoirTheme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MovieThemeProvider>
  </StrictMode>
);
