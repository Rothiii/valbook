import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@valbook.local';

let resend: Resend | null = null;

function getResend(): Resend {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  resend = new Resend(apiKey);
  return resend;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export async function sendEmail({ to, subject, react, replyTo }: SendEmailInput) {
  const html = await render(react);
  const text = await render(react, { plainText: true });

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
