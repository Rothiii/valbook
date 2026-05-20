'use client';

import { authClient } from '../auth-client';
import type { LoginInput, RegisterInput } from '../schema';

export function useAuthActions() {
  return {
    register: async ({ name, email, password }: RegisterInput) => {
      const { data, error } = await authClient.signUp.email({ name, email, password });
      if (error) throw new Error(error.message ?? 'Registration failed');
      return data;
    },
    login: async ({ email, password }: LoginInput) => {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message ?? 'Login failed');
      return data;
    },
    logout: async () => {
      await authClient.signOut();
    },
    verifyEmail: async (token: string) => {
      const { error } = await authClient.verifyEmail({ query: { token } });
      if (error) throw new Error(error.message ?? 'Verification failed');
    },
    sendVerifyEmail: async (email: string) => {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/account',
      });
      if (error) throw new Error(error.message ?? 'Failed to send verification email');
    },
    forgotPassword: async (email: string) => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      });
      if (error) throw new Error(error.message ?? 'Failed to send reset email');
    },
    resetPassword: async (token: string, newPassword: string) => {
      const { error } = await authClient.resetPassword({ token, newPassword });
      if (error) throw new Error(error.message ?? 'Failed to reset password');
    },
    updateProfile: async (patch: { name?: string; avatarUrl?: string | null }) => {
      const payload: Record<string, unknown> = {};
      if (patch.name !== undefined) payload.name = patch.name;
      if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
      const { error } = await authClient.updateUser(payload as never);
      if (error) throw new Error(error.message ?? 'Failed to update profile');
    },
  };
}
