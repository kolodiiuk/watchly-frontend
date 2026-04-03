export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}
