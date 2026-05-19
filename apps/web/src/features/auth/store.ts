'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LoginInput, RegisterInput } from './schema';
import type { AuthUser, Session } from './types';

type StoredUser = AuthUser & { password: string };

type AuthState = {
  session: Session;
  users: StoredUser[];
};

type AuthActions = {
  register: (input: RegisterInput) => { user: AuthUser; verificationToken: string };
  login: (input: LoginInput) => AuthUser;
  logout: () => void;
  verifyEmail: (token: string) => void;
  forgotPassword: (email: string) => { token: string };
  resetPassword: (token: string, newPassword: string) => void;
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'avatarUrl'>>) => void;
  reset: () => void;
};

const initialState: AuthState = {
  session: null,
  users: [],
};

function uuid(): string {
  return crypto.randomUUID();
}

function inSevenDays(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

// Mock verification tokens stored in-memory only (not persisted) — slicing only.
const verificationTokens = new Map<string, string>(); // token -> userId
const resetTokens = new Map<string, string>(); // token -> userId

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      register: ({ name, email, password }) => {
        const exists = get().users.find((u) => u.email === email);
        if (exists) {
          throw new Error('Email already registered');
        }
        const user: StoredUser = {
          id: uuid(),
          name,
          email,
          password,
          emailVerified: false,
          avatarUrl: null,
        };
        set((state) => ({ users: [...state.users, user] }));
        const token = uuid();
        verificationTokens.set(token, user.id);
        return { user: stripPassword(user), verificationToken: token };
      },

      login: ({ email, password }) => {
        const user = get().users.find((u) => u.email === email);
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password');
        }
        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }
        const session: Session = {
          user: stripPassword(user),
          expiresAt: inSevenDays(),
        };
        set({ session });
        return stripPassword(user);
      },

      logout: () => set({ session: null }),

      verifyEmail: (token) => {
        const userId = verificationTokens.get(token);
        if (!userId) {
          throw new Error('Invalid or expired verification token');
        }
        verificationTokens.delete(token);
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, emailVerified: true } : u)),
        }));
      },

      forgotPassword: (email) => {
        const user = get().users.find((u) => u.email === email);
        if (!user) {
          // Don't leak existence; still return token-shaped value
          return { token: 'no-op' };
        }
        const token = uuid();
        resetTokens.set(token, user.id);
        return { token };
      },

      resetPassword: (token, newPassword) => {
        const userId = resetTokens.get(token);
        if (!userId) {
          throw new Error('Invalid or expired reset token');
        }
        resetTokens.delete(token);
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)),
        }));
      },

      updateProfile: (patch) => {
        set((state) => {
          if (!state.session) return state;
          const next = state.users.map((u) =>
            u.id === state.session?.user.id ? { ...u, ...patch } : u,
          );
          const updatedUser = next.find((u) => u.id === state.session?.user.id);
          return {
            users: next,
            session: updatedUser
              ? { ...state.session, user: stripPassword(updatedUser) }
              : state.session,
          };
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-auth',
      version: 1,
    },
  ),
);

function stripPassword(user: StoredUser): AuthUser {
  const { password: _pw, ...rest } = user;
  return rest;
}
