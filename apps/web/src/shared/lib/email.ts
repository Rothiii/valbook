import 'server-only';

import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@valbook.local';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export async function sendEmail({ to, subject, react, replyTo }: SendEmailInput) {
  const html = await render(react);
  const text = await render(react, { plainText: true });

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
