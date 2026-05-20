import { render } from '@react-email/render';
import type { ReactElement } from 'react';

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // biome-ignore lint/suspicious/noConsole: local dev mode — no email provider configured
    console.info('[email:local-mode]', {
      from: FROM_EMAIL,
      to,
      subject,
      replyTo,
      preview: text.slice(0, 200),
    });
    return { id: `local-${Date.now()}`, from: FROM_EMAIL, to };
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  return resend.emails.send({ from: FROM_EMAIL, to, subject, html, text, replyTo });
}
