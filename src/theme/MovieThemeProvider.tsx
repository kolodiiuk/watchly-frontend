import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';
import { cinemaNoirTheme, type MovieTheme } from './movieTheme';

type ThemeStyle = CSSProperties & Record<`--movie-${string}`, string>;

type MovieThemeContextValue = {
  theme: MovieTheme;
  themeStyle: ThemeStyle;
};

const MovieThemeContext = createContext<MovieThemeContextValue | null>(null);

function toThemeStyle(theme: MovieTheme): ThemeStyle {
  return {
    '--movie-background': theme.colors.background,
    '--movie-background-alt': theme.colors.backgroundAlt,
    '--movie-surface': theme.colors.surface,
    '--movie-surface-raised': theme.colors.surfaceRaised,
    '--movie-border': theme.colors.border,
    '--movie-text': theme.colors.text,
    '--movie-muted': theme.colors.muted,
    '--movie-primary': theme.colors.primary,
    '--movie-primary-strong': theme.colors.primaryStrong,
    '--movie-accent': theme.colors.accent,
    '--movie-accent-soft': theme.colors.accentSoft,
    '--movie-success': theme.colors.success,
    '--movie-warning': theme.colors.warning,
    '--movie-danger': theme.colors.danger,
  };
}

type MovieThemeProviderProps = PropsWithChildren<{
  theme?: MovieTheme;
}>;

export function MovieThemeProvider({ theme = cinemaNoirTheme, children }: MovieThemeProviderProps) {
  const themeStyle = useMemo(() => toThemeStyle(theme), [theme]);

  const value = useMemo<MovieThemeContextValue>(
    () => ({
      theme,
      themeStyle,
    }),
    [theme, themeStyle]
  );

  return (
    <MovieThemeContext.Provider value={value}>
      <div style={themeStyle} data-theme={theme.name} className="min-h-screen bg-background text-text">
        {children}
      </div>
    </MovieThemeContext.Provider>
  );
}

export function useMovieTheme() {
  const context = useContext(MovieThemeContext);

  if (!context) {
    throw new Error('useMovieTheme must be used within a MovieThemeProvider');
  }

  return context;
}
