export const UserRole = {
  USER: 'User',
  ADMINISTRATOR: 'Administrator',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
