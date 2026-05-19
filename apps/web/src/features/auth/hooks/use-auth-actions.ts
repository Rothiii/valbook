'use client';

import { useShallow } from 'zustand/react/shallow';

import { useAuthStore } from '../store';

export function useAuthActions() {
  return useAuthStore(
    useShallow((s) => ({
      register: s.register,
      login: s.login,
      logout: s.logout,
      verifyEmail: s.verifyEmail,
      forgotPassword: s.forgotPassword,
      resetPassword: s.resetPassword,
      updateProfile: s.updateProfile,
    })),
  );
}
