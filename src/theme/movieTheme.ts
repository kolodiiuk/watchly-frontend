export type MovieThemeColorKey =
  | 'background'
  | 'backgroundAlt'
  | 'surface'
  | 'surfaceRaised'
  | 'border'
  | 'text'
  | 'muted'
  | 'primary'
  | 'primaryStrong'
  | 'accent'
  | 'accentSoft'
  | 'success'
  | 'warning'
  | 'danger';

export type MovieThemeColors = Record<MovieThemeColorKey, string>;

export type MovieTheme = {
  name: string;
  label: string;
  colors: MovieThemeColors;
};

export const cinemaNoirTheme: MovieTheme = {
  name: 'cinema-noir',
  label: 'Cinema Noir',
  colors: {
    background: '#07111d',
    backgroundAlt: '#0c1726',
    surface: '#111a2d',
    surfaceRaised: '#17233b',
    border: '#26324b',
    text: '#edf2fb',
    muted: '#8b96ae',
    primary: '#f5c451',
    primaryStrong: '#e4a62b',
    accent: '#63d7cf',
    accentSoft: '#219ebc',
    success: '#5dd39e',
    warning: '#f4b942',
    danger: '#ff6b6b',
  },
};

export function createMovieTheme(
  overrides: Partial<MovieThemeColors> = {},
  base: MovieTheme = cinemaNoirTheme
): MovieTheme {
  return {
    name: base.name,
    label: base.label,
    colors: {
      ...base.colors,
      ...overrides,
    },
  };
}
