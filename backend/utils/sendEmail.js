import nodemailer from 'nodemailer';

/**
 * Helper to get configured Transporter or null if SMTP credentials missing
 * Reads configuration strictly from backend .env
 */
const getTransporter = () => {
  const host = (process.env.EMAIL_HOST || process.env.SMTP_HOST || '').trim();
  const port = (process.env.EMAIL_PORT || process.env.SMTP_PORT || 587).toString().trim();
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
};

/**
 * Sends a 6-digit OTP email to the user.
 * Subject: CraftVeda verification code
 * 
 * @param {string} email User email address
 * @param {string} otp 6-digit OTP code
 * @param {string} [name] User display name
 */
export const sendOtpEmail = async (email, otp, name = '') => {
  const transporter = getTransporter();
  const cleanEmail = email.toLowerCase().trim();

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log('✉️  [CraftVeda Dev Fallback - Email OTP Dispatch]');
      console.log(`To Email : ${cleanEmail}`);
      console.log(`OTP Code : ${otp}`);
      console.log(`Expires  : In 5 minutes`);
      console.log('==================================================\n');
      return { success: true, mode: 'dev-console' };
    } else {
      console.error(`❌ OTP email failed: SMTP credentials not configured in backend .env`);
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const recipientGreeting = name && name.trim() ? name.trim() : 'CraftVeda Member';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #fdfbf7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 8px;">🏺</div>
          <h2 style="color: #4a2e1b; font-family: Georgia, serif; margin: 0; font-size: 24px;">CraftVeda</h2>
          <p style="color: #78350f; font-size: 11px; margin-top: 4px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Authentic Indian Handicrafts</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f3ebd8; margin: 20px 0;" />
        <p style="color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">Hello ${recipientGreeting},</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">Your verification code for logging into <strong>CraftVeda</strong> is:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #c2410c; background-color: #fff7ed; padding: 14px 28px; border-radius: 14px; border: 1px dashed #fdba74; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #4b5563; font-size: 13px; text-align: center; font-weight: 600;">This code is valid for <strong>5 minutes</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 6px;">For your security, never share this verification code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #f3ebd8; margin: 24px 0 16px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">If you did not request this verification code, please ignore this message.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CraftVeda Support'}" <${fromAddress}>`,
      to: cleanEmail,
      subject: `CraftVeda verification code`,
      html: htmlContent,
    });

    console.log(`📧 OTP email sent successfully to ${cleanEmail}`);
    return { success: true, mode: 'smtp' };
  } catch (error) {
    console.error(`❌ OTP email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a successful-login email to the user.
 * Subject: CraftVeda login successful
 * 
 * @param {string} email User email address
 * @param {string} [name] User name
 * @param {string} [authProvider] 'email' or 'google'
 * @param {string} [dateTime] Custom date/time string
 */
export const sendLoginSuccessEmail = async (
  email, 
  name = '', 
  authProvider = 'email',
  dateTime = null
) => {
  const transporter = getTransporter();
  const cleanEmail = email.toLowerCase().trim();
  const dateTimeStr = dateTime || new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
  const displayName = name && name.trim() ? name.trim() : cleanEmail;
  const loginMethodStr = authProvider === 'google' ? 'Google' : 'Email OTP';

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log('✉️  [CraftVeda Dev Fallback - Login Success Email]');
      console.log(`To Email     : ${cleanEmail}`);
      console.log(`Name         : ${displayName}`);
      console.log(`Login Method : ${loginMethodStr}`);
      console.log(`Date & Time  : ${dateTimeStr}`);
      console.log('==================================================\n');
      return { success: true, mode: 'dev-console' };
    } else {
      console.error(`❌ Login success email failed: SMTP credentials not configured in backend .env`);
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #fdfbf7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 8px;">🏺</div>
          <h2 style="color: #4a2e1b; font-family: Georgia, serif; margin: 0; font-size: 24px;">CraftVeda</h2>
          <p style="color: #78350f; font-size: 11px; margin-top: 4px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Authentic Indian Handicrafts</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f3ebd8; margin: 20px 0;" />
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hi ${displayName},</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">You have successfully logged into your CraftVeda account.</p>
        <div style="background-color: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 4px 0; color: #4b5563; font-size: 13px;"><strong>Login method:</strong> ${loginMethodStr}</p>
          <p style="margin: 4px 0; color: #4b5563; font-size: 13px;"><strong>Date and time:</strong> ${dateTimeStr}</p>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If you did not initiate this login, please contact CraftVeda support immediately.</p>
        <br />
        <p style="color: #4a2e1b; font-size: 14px; font-weight: 700; margin: 0;">CraftVeda Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CraftVeda Support'}" <${fromAddress}>`,
      to: cleanEmail,
      subject: `CraftVeda login successful`,
      html: htmlContent,
    });

    console.log(`📧 Login success email sent successfully to ${cleanEmail}`);
    return { success: true, mode: 'smtp' };
  } catch (error) {
    console.error(`❌ Login success email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};
