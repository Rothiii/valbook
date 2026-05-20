import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { PasswordReset } from '@/src/emails/password-reset';
import { VerifyEmail } from '@/src/emails/verify-email';
import { sendEmail } from '@/src/shared/lib/email';

import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    'build-only-placeholder-set-BETTER_AUTH_SECRET-via-env-32+chars-required',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your Valbook password',
        react: PasswordReset({ userName: user.name ?? user.email, resetUrl: url }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your Valbook email',
        react: VerifyEmail({ userName: user.name ?? user.email, verifyUrl: url }),
      });
    },
  },
  user: {
    additionalFields: {
      avatar_url: {
        type: 'string',
        required: false,
        defaultValue: null,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    cookiePrefix: 'valbook',
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
