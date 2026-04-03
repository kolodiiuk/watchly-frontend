import type { UserRole } from './UserRole';

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string | null;
};
