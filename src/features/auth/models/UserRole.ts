export const UserRole = {
  USER: 'User',
  ADMIN: 'Admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
