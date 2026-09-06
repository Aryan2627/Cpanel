import nodemailer from 'nodemailer';

// Configure the SMTP transport
// We use fallback environment variables so the app doesn't crash if they are missing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Sends an email invitation to a vendor
 * @param email Vendor's email address
 * @param eventTitle Title of the event
 * @param loginLink The link to the Supplier Portal login
 */
export async function sendVendorInvitation(email: string, eventTitle: string, loginLink: string) {
  // If no SMTP password is provided, we simulate the email sending (useful for local development)
  if (!process.env.SMTP_PASS) {
    console.log(`[Email Service Simulation] Invitation sent to ${email} for event "${eventTitle}"`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Procurement Portal" <${(process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM) || 'noreply@yourdomain.com'}>`, // sender address
      to: email, 
      subject: `You have been invited to bid: ${eventTitle}`, 
      text: `You have been invited to participate in a new bidding event: ${eventTitle}.\n\nPlease log in to the Supplier Portal to place your bid: ${loginLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">You're Invited to Bid!</h2>
          <p style="color: #475569; line-height: 1.6;">You have been selected to participate in a new bidding event on our procurement platform:</p>
          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="margin: 0; color: #1e293b;">${eventTitle}</h3>
          </div>
          <p style="color: #475569; margin-bottom: 24px;">Please click the button below to log in to the Supplier Portal and submit your response.</p>
          <a href="${loginLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Supplier Portal</a>
          <p style="margin-top: 32px; font-size: 0.8rem; color: #94a3b8;">If you are having trouble clicking the button, copy and paste this URL into your browser: <br/>${loginLink}</p>
        </div>
      `,
    });

    console.log(`[Email Service] Message sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
    return { success: false, error };
  }
}
