/**
 * Universal Email Service
 * Uses Resend API for production email delivery.
 * Falls back to console.log in development if RESEND_API_KEY is missing.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// The verified sender domain in Resend (e.g., 'onboarding@resend.dev' for testing, or 'no-reply@yourdomain.com')
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'; 

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('\n======================================================');
    console.warn(`📧 EMAIL INTERCEPTED (No RESEND_API_KEY found)`);
    console.warn(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.warn(`Subject: ${subject}`);
    console.warn(`Body: ${html.replace(/<[^>]*>?/gm, '')}`); // Strip HTML for console reading
    console.warn('======================================================\n');
    return true; // Simulate success in dev
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `ProcGen Portal <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Failed to send email via Resend:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}
