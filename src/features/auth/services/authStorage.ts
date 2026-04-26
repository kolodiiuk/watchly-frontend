const ACCESS_TOKEN_COOKIE_KEY = 'watchly_access_token';
const REFRESH_TOKEN_COOKIE_KEY = 'watchly_refresh_token';
const ROLE_COOKIE_KEY = 'watchly_role';
const USER_COOKIE_KEY = 'watchly_user';

function canUseCookies() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getCookieOptions() {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  return `; Path=/; SameSite=Strict${secure ? '; Secure' : ''}`;
}

function readCookie(name: string): string | null {
  if (!canUseCookies()) {
    return null;
  }

  const cookie = document.cookie.split('; ').find(entry => entry.startsWith(`${encodeURIComponent(name)}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(cookie.indexOf('=') + 1);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function writeCookie(name: string, value: string) {
  if (!canUseCookies()) {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${getCookieOptions()}`;
}

function clearCookie(name: string) {
  if (!canUseCookies()) {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0${getCookieOptions()}`;
}

export const authStorage = {
  getAccessToken(): string | null {
    return readCookie(ACCESS_TOKEN_COOKIE_KEY);
  },

  setAccessToken(token: string | null): void {
    if (!token) {
      clearCookie(ACCESS_TOKEN_COOKIE_KEY);
      return;
    }

    writeCookie(ACCESS_TOKEN_COOKIE_KEY, token);
  },

  getRefreshToken(): string | null {
    return readCookie(REFRESH_TOKEN_COOKIE_KEY);
  },

  setRefreshToken(token: string | null): void {
    if (!token) {
      clearCookie(REFRESH_TOKEN_COOKIE_KEY);
      return;
    }

    writeCookie(REFRESH_TOKEN_COOKIE_KEY, token);
  },

  getRole(): string | null {
    return readCookie(ROLE_COOKIE_KEY);
  },

  setRole(role: string | null): void {
    if (!role) {
      clearCookie(ROLE_COOKIE_KEY);
      return;
    }

    writeCookie(ROLE_COOKIE_KEY, role);
  },

  clearRole(): void {
    clearCookie(ROLE_COOKIE_KEY);
  },

  getUser<T>(): T | null {
    const raw = readCookie(USER_COOKIE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      clearCookie(USER_COOKIE_KEY);
      return null;
    }
  },

  setUser(user: unknown | null): void {
    if (!user) {
      clearCookie(USER_COOKIE_KEY);
      return;
    }

    writeCookie(USER_COOKIE_KEY, JSON.stringify(user));
  },

  clearUser(): void {
    clearCookie(USER_COOKIE_KEY);
  },

  clearTokens(): void {
    clearCookie(ACCESS_TOKEN_COOKIE_KEY);
    clearCookie(REFRESH_TOKEN_COOKIE_KEY);
  },

  clearAll(): void {
    this.clearTokens();
    this.clearRole();
    this.clearUser();
  },
};
