import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY not set — emails will not be sent');
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@medicallai.com';

// In local dev, redirect all outgoing mail to a single inbox so you don't
// need a verified domain. Set RESEND_DEV_OVERRIDE_TO in .env.local.
export const DEV_TO_OVERRIDE = process.env.RESEND_DEV_OVERRIDE_TO ?? null;

/** Wraps resend.emails.send — in dev, forces `to` to DEV_TO_OVERRIDE */
export async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  const to = DEV_TO_OVERRIDE ?? params.to;
  if (DEV_TO_OVERRIDE) {
    console.log(`[Resend DEV] Redirecting email to ${DEV_TO_OVERRIDE} (original: ${params.to})`);
  }
  return resend.emails.send({ ...params, to });
}
