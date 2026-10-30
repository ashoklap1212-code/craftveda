import nodemailer from 'nodemailer';
import {
  renderOtpEmailTemplate,
  renderOrderConfirmationTemplate,
  renderOrderStatusUpdateTemplate,
} from './emailTemplates.js';

/**
 * Helper to get configured Transporter or null if SMTP credentials missing.
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
 * Returns frontend base URL for email link generation
 */
const getClientUrl = () => {
  return (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  ).replace(/\/$/, '');
};

/**
 * 1. PREMIUM EMAIL OTP VERIFICATION
 * Sends a premium-designed 6-digit OTP email to the user.
 * 
 * @param {string} email User email address
 * @param {string} otp 6-digit OTP code
 * @param {string} [name] User display name
 * @param {number} [expirationMinutes] Expiration period in minutes (default: 5)
 */
export const sendOtpEmail = async (email, otp, name = '', expirationMinutes = 5) => {
  const transporter = getTransporter();
  const cleanEmail = (email || '').toLowerCase().trim();
  const clientUrl = getClientUrl();

  if (!cleanEmail) {
    console.warn('⚠️ OTP Email skipped: no recipient email provided');
    return { success: false, error: 'Recipient email is missing' };
  }

  const htmlContent = renderOtpEmailTemplate({
    otp,
    expirationMinutes,
    email: cleanEmail,
    name,
    clientUrl,
  });

  const subject = `CraftVeda Verification Code: ${otp}`;

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log('✉️  [CraftVeda Dev Fallback - Premium OTP Email]');
      console.log(`To Email : ${cleanEmail}`);
      console.log(`OTP Code : ${otp}`);
      console.log(`Expires  : In ${expirationMinutes} minutes`);
      console.log('==================================================\n');
      return { success: true, mode: 'dev-console' };
    } else {
      console.error(`❌ OTP email failed: SMTP credentials not configured in backend .env`);
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'CraftVeda Support';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: cleanEmail,
      subject,
      html: htmlContent,
    });

    console.log(`📧 Premium OTP email sent successfully to ${cleanEmail} (ID: ${info.messageId})`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`❌ OTP email delivery failed to ${cleanEmail}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * 2. PREMIUM ORDER CONFIRMATION EMAIL
 * Triggered automatically whenever a customer successfully places an order.
 * 
 * @param {object} order Complete saved Order document
 */
export const sendOrderConfirmationEmail = async (order) => {
  if (!order) {
    console.warn('⚠️ Order confirmation email skipped: missing order document');
    return { success: false, error: 'Missing order document' };
  }

  const recipientEmail = (
    order.customerEmail ||
    order.shippingAddress?.email ||
    ''
  ).toLowerCase().trim();

  if (!recipientEmail) {
    console.warn(`⚠️ Order confirmation email skipped for order #${order.orderNumber}: No email found`);
    return { success: false, error: 'Customer email missing on order' };
  }

  const transporter = getTransporter();
  const clientUrl = getClientUrl();
  const orderNumber = order.orderNumber || 'CV-ORDER';

  const htmlContent = renderOrderConfirmationTemplate({
    order,
    clientUrl,
  });

  const subject = `Order Confirmed — Order #${orderNumber}`;

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log('✉️  [CraftVeda Dev Fallback - Order Confirmation Email]');
      console.log(`To Email     : ${recipientEmail}`);
      console.log(`Order Number : ${orderNumber}`);
      console.log(`Total Paid   : ₹${order.totalAmount}`);
      console.log(`Items Count  : ${order.items?.length || 0}`);
      console.log('==================================================\n');
      return { success: true, mode: 'dev-console' };
    } else {
      console.error(`❌ Order confirmation email failed: SMTP credentials not configured`);
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'CraftVeda Support';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    console.log(`📧 Order Confirmation email sent successfully to ${recipientEmail} for Order #${orderNumber} (ID: ${info.messageId})`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Order confirmation email delivery failed for Order #${orderNumber}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * 3. AUTOMATIC ORDER STATUS UPDATE EMAIL
 * Triggered automatically whenever an admin changes an order's status.
 * 
 * @param {object} order Complete saved Order document
 * @param {string} previousStatus The status before update
 * @param {string} [notes] Optional admin notes / tracking reference
 */
export const sendOrderStatusEmail = async (order, previousStatus = '', notes = '') => {
  if (!order) {
    console.warn('⚠️ Order status email skipped: missing order document');
    return { success: false, error: 'Missing order document' };
  }

  const recipientEmail = (
    order.customerEmail ||
    order.shippingAddress?.email ||
    ''
  ).toLowerCase().trim();

  if (!recipientEmail) {
    console.warn(`⚠️ Order status email skipped for order #${order.orderNumber}: No email found`);
    return { success: false, error: 'Customer email missing on order' };
  }

  const newStatus = order.currentStatus;
  const orderNumber = order.orderNumber || 'CV-ORDER';

  // Do not send if status hasn't actually changed
  if (previousStatus && previousStatus === newStatus) {
    console.log(`ℹ️ Status notification email skipped for Order #${orderNumber}: Status unchanged ("${newStatus}")`);
    return { success: true, skipped: true, reason: 'Status unchanged' };
  }

  const transporter = getTransporter();
  const clientUrl = getClientUrl();

  const { subject, html } = renderOrderStatusUpdateTemplate({
    order,
    previousStatus,
    newStatus,
    notes,
    clientUrl,
  });

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log('✉️  [CraftVeda Dev Fallback - Order Status Update Email]');
      console.log(`To Email        : ${recipientEmail}`);
      console.log(`Order Number    : ${orderNumber}`);
      console.log(`Previous Status : ${previousStatus}`);
      console.log(`New Status      : ${newStatus}`);
      console.log(`Subject         : ${subject}`);
      console.log('==================================================\n');
      return { success: true, mode: 'dev-console' };
    } else {
      console.error(`❌ Order status email failed: SMTP credentials not configured`);
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'CraftVeda Support';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`📧 Order Status Update email ("${newStatus}") sent successfully to ${recipientEmail} for Order #${orderNumber} (ID: ${info.messageId})`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Order status update email failed for Order #${orderNumber}: ${error.message}`);
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
  const cleanEmail = (email || '').toLowerCase().trim();
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
    const fromName = process.env.EMAIL_FROM_NAME || 'CraftVeda Support';

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
      from: `"${fromName}" <${fromAddress}>`,
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
