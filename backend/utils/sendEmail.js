import nodemailer from 'nodemailer';

/**
 * Sends a 6-digit OTP email to the user.
 * Uses SMTP configuration from environment variables if present.
 * Defaults to clear console logging during local development when SMTP is not configured.
 */
export const sendOtpEmail = async (email, otp) => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  // Fallback dev mode logging if SMTP credentials are absent
  if (!host || !user || !pass) {
    console.log('\n==================================================');
    console.log('✉️  [CraftVeda Email OTP Service - Local Dev Mode]');
    console.log(`To Email : ${email}`);
    console.log(`OTP Code : ${otp}`);
    console.log(`Expires  : In 5 minutes`);
    console.log('==================================================\n');
    return { success: true, mode: 'dev-console' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for port 465, false for 587
      auth: { user, pass },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded-radius: 16px; background-color: #fdfbf7;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 36px; margin-bottom: 8px;">🏺</div>
          <h2 style="color: #4a2e1b; font-family: Georgia, serif; margin: 0;">CraftVeda</h2>
          <p style="color: #78350f; font-size: 12px; margin-top: 4px; font-weight: 600;">Authentic Indian Handicrafts</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">Hello,</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">Your one-time login verification code for <strong>CraftVeda</strong> is:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #c2410c; background-color: #fff7ed; padding: 12px 24px; border-radius: 12px; border: 1px dashed #fdba74;">
            ${otp}
          </span>
        </div>
        <p style="color: #6b7280; font-size: 12px; text-align: center;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">If you did not request this code, please ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CraftVeda Support'}" <${user}>`,
      to: email,
      subject: `[CraftVeda] Your Login Verification Code: ${otp}`,
      html: htmlContent,
    });

    return { success: true, mode: 'smtp' };
  } catch (error) {
    console.error('❌ Failed to send email via Nodemailer SMTP:', error.message);
    // Print fallback OTP in log so developer/user is never locked out
    console.log(`✉️ [Fallback OTP Log for ${email}]: ${otp}`);
    return { success: true, mode: 'fallback-console', error: error.message };
  }
};
