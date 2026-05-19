export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
};

export type Session = {
  user: AuthUser;
  expiresAt: string;
} | null;
