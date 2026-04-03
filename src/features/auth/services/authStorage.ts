import { isUserRole, UserRole } from '../../../app/models/UserRole.ts';
import type { User } from '../../../app/models/User.ts';

const CURRENT_USER_KEY = 'watchly_current_user';
export const AUTH_STORAGE_EVENT = 'watchly-auth-changed';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function emitAuthChange() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function getStoredUser(): User | null {
  const storedUser = readJson<Partial<User> & { role?: string }>(CURRENT_USER_KEY);
  if (!storedUser) {
    return null;
  }

  if (!storedUser.id || !storedUser.email || !storedUser.displayName || !storedUser.role) {
    return null;
  }

  if (!isUserRole(storedUser.role)) {
    return null;
  }

  return {
    id: storedUser.id,
    email: storedUser.email,
    displayName: storedUser.displayName,
    role: storedUser.role,
    avatarUrl: storedUser.avatarUrl ?? null,
  };
}

export function setStoredUser(user: User) {
  writeJson(CURRENT_USER_KEY, user);
  emitAuthChange();
}

export function clearStoredUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_KEY);
  emitAuthChange();
}

export function createDemoUser(email: string, displayName: string, role: UserRole = UserRole.USER): User {
  return {
    id: `${role}-${Date.now()}`,
    email,
    displayName,
    role,
  };
}
