import type { User } from '../../../app/models/User.ts';

export type AuthSessionResponse = {
  user?: User | null;
  role?: string | null;
  token: string;
  refreshToken: string;
};

export function resolveRole(session: { user: User | null; role?: string | null }): string | null {
  if (!session.user) {
    return session.role ?? null;
  }

  return session.role ?? session.user.role ?? session.user.userRoles?.[0] ?? null;
}
