export type User = {
  id: string;
  email: string;
  displayName?: string | null;
  userName?: string | null;
  userRoles: string[];
  profilePicture?: string | null;
  role?: string | null;
};
