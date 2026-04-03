import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MovieThemeProvider } from './theme/MovieThemeProvider';
import { cinemaNoirTheme } from './theme/movieTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MovieThemeProvider theme={cinemaNoirTheme}>
      <App />
    </MovieThemeProvider>
  </StrictMode>
);
