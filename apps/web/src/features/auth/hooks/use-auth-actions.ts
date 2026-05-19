'use client';

import { useAuthStore } from '../store';

export function useAuthActions() {
  return useAuthStore((s) => ({
    register: s.register,
    login: s.login,
    logout: s.logout,
    verifyEmail: s.verifyEmail,
    forgotPassword: s.forgotPassword,
    resetPassword: s.resetPassword,
    updateProfile: s.updateProfile,
  }));
}
