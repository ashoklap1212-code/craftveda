/**
 * CraftVeda Premium Email Templates
 * 
 * Elegant, responsive, email-client-compatible HTML templates for:
 * 1. Email OTP Verification
 * 2. Order Confirmation
 * 3. Automatic Order Status Updates
 */

// Helper to escape untrusted HTML content
export const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper to format currency in INR
export const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

// Brand Constants
const BRAND = {
  name: 'CraftVeda',
  tagline: 'Authentic Indian Handicrafts',
  accentColor: '#c2410c', // terracotta-600
  accentDark: '#9a3412',  // terracotta-700
  accentLight: '#fff7ed', // terracotta-50
  accentBorder: '#fdba74',// terracotta-300
  darkText: '#2b1810',
  bodyText: '#4a3b32',
  mutedText: '#786960',
  lightBg: '#fcfaf7',
  cardBg: '#ffffff',
  borderColor: '#ede5dc',
  supportEmail: 'support@craftveda.in',
  supportPhone: '+91 98765 43210',
  address: '42 Artisan Street, Sangeet Nagar, Jaipur, RJ 302001',
};

/**
 * Shared Email Layout Wrapper
 */
const renderEmailLayout = ({ title, previewText, content, clientUrl = 'http://localhost:5173' }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 620px) {
      .cv-container { width: 100% !important; max-width: 100% !important; }
      .cv-card { padding: 24px 18px !important; border-radius: 16px !important; }
      .cv-item-img { width: 52px !important; height: 52px !important; }
      .cv-otp-code { font-size: 28px !important; letter-spacing: 6px !important; }
      .cv-two-col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      .cv-stack-col { display: block !important; width: 100% !important; }
      .cv-hide-mobile { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f3ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: ${BRAND.bodyText};">
  
  <!-- Preheader text (visible in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f6f3ee;">
    ${escapeHtml(previewText || title)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f3ee; width: 100%; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- Main Card Container -->
        <table role="presentation" class="cv-container" width="580" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 580px; margin: 0 auto; background-color: ${BRAND.cardBg}; border: 1px solid ${BRAND.borderColor}; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 46, 27, 0.06);">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding: 32px 28px 24px 28px; background: linear-gradient(180deg, #fdfbf8 0%, #ffffff 100%); border-bottom: 1px solid ${BRAND.borderColor};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center">
                    <!-- Brand Icon Emblem -->
                    <div style="width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, ${BRAND.accentColor} 0%, ${BRAND.accentDark} 100%); border-radius: 14px; text-align: center; font-size: 26px; box-shadow: 0 6px 14px rgba(194, 65, 12, 0.28); margin-bottom: 10px; display: inline-block;">
                      🏺
                    </div>
                    <!-- Brand Name -->
                    <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 800; color: ${BRAND.darkText}; letter-spacing: -0.5px;">
                      Craft<span style="color: ${BRAND.accentColor};">Veda</span>
                    </h1>
                    <!-- Brand Tagline -->
                    <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: 700; color: ${BRAND.accentDark}; letter-spacing: 2px; text-transform: uppercase;">
                      ${BRAND.tagline}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="cv-card" style="padding: 36px 36px 32px 36px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 28px; background-color: #fdfbf8; border-top: 1px solid ${BRAND.borderColor}; text-align: center;">
              
              <!-- Social / Brand Link -->
              <p style="margin: 0 0 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 700; color: ${BRAND.darkText};">
                ${BRAND.name}
              </p>
              
              <p style="margin: 0 0 12px 0; font-size: 11px; color: ${BRAND.mutedText}; line-height: 1.6;">
                Preserving India's Handcrafted Heritage &amp; Empowering Rural Artisans<br>
                ${BRAND.address}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 12px auto;">
                <tr>
                  <td style="padding: 0 10px; font-size: 11px; color: ${BRAND.mutedText};">
                    <a href="${clientUrl}" style="color: ${BRAND.accentColor}; text-decoration: none; font-weight: 600;">Visit Store</a>
                  </td>
                  <td style="color: #d6cfc7; font-size: 10px;">•</td>
                  <td style="padding: 0 10px; font-size: 11px; color: ${BRAND.mutedText};">
                    <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.accentColor}; text-decoration: none; font-weight: 600;">${BRAND.supportEmail}</a>
                  </td>
                  <td style="color: #d6cfc7; font-size: 10px;">•</td>
                  <td style="padding: 0 10px; font-size: 11px; color: ${BRAND.mutedText};">
                    <span style="color: ${BRAND.mutedText};">${BRAND.supportPhone}</span>
                  </td>
                </tr>
              </table>

              <hr style="border: 0; border-top: 1px solid ${BRAND.borderColor}; margin: 16px 0;" />

              <p style="margin: 0; font-size: 10px; color: #a89f91; line-height: 1.5;">
                This is an automated operational email sent from CraftVeda. Please do not reply directly to this email.<br>
                &copy; ${new Date().getFullYear()} CraftVeda. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

/**
 * 1. PREMIUM EMAIL OTP VERIFICATION TEMPLATE
 */
export const renderOtpEmailTemplate = ({
  otp,
  expirationMinutes = 5,
  email,
  name = '',
  clientUrl = 'http://localhost:5173',
}) => {
  const recipientName = name && name.trim() ? escapeHtml(name.trim()) : 'CraftVeda Member';
  const cleanEmail = escapeHtml(email || '');
  const cleanOtp = escapeHtml(otp);

  const content = `
    <!-- Verification Badge -->
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 5px 14px; border-radius: 20px;">
        Security Verification
      </span>
    </div>

    <!-- Heading -->
    <h2 style="margin: 0 0 12px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 800; color: ${BRAND.darkText}; text-align: center; line-height: 1.3;">
      Verify Your Email Address
    </h2>

    <!-- Explanation -->
    <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: ${BRAND.bodyText}; text-align: center;">
      Hello <strong>${recipientName}</strong>,
    </p>
    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: ${BRAND.mutedText}; text-align: center;">
      To authenticate your account access and ensure your CraftVeda profile remains secure, please enter the one-time verification code below.
    </p>

    <!-- OTP Code Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <div style="background-color: #fffaf5; border: 2px dashed ${BRAND.accentBorder}; border-radius: 16px; padding: 22px 28px; display: inline-block; text-align: center; box-shadow: 0 2px 8px rgba(194, 65, 12, 0.04);">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${BRAND.mutedText}; margin-bottom: 8px;">
              Your One-Time Verification Code
            </div>
            <div class="cv-otp-code" style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: ${BRAND.accentColor}; line-height: 1;">
              ${cleanOtp}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Expiration Period Callout -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 12px; font-weight: 600; color: ${BRAND.darkText}; display: inline-flex; align-items: center; gap: 4px;">
        ⏱ This verification code is valid for <strong>${expirationMinutes} minutes</strong> only.
      </span>
    </div>

    <!-- Security Warning Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border: 1px solid ${BRAND.borderColor}; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="28" valign="top" style="font-size: 18px; line-height: 1;">
                🛡️
              </td>
              <td valign="top" style="font-size: 12px; line-height: 1.5; color: ${BRAND.bodyText};">
                <strong style="color: ${BRAND.darkText};">Security Advisory:</strong> Never share your verification code with anyone. CraftVeda staff will never ask for your password or OTP code over the phone or email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Disclaimer -->
    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${BRAND.mutedText}; text-align: center;">
      If you did not request this verification code, please ignore this email or reach out to our support team at <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.accentColor}; text-decoration: none;">${BRAND.supportEmail}</a>.
    </p>
  `;

  return renderEmailLayout({
    title: 'Verify Your Email Address — CraftVeda',
    previewText: `Your CraftVeda verification code is ${otp}. Valid for ${expirationMinutes} minutes.`,
    content,
    clientUrl,
  });
};

/**
 * 2. PREMIUM ORDER CONFIRMATION EMAIL TEMPLATE
 */
export const renderOrderConfirmationTemplate = ({
  order,
  clientUrl = 'http://localhost:5173',
}) => {
  const customerName = escapeHtml(
    order.customerName ||
    order.shippingAddress?.fullName ||
    'Valued Customer'
  );
  const orderNumber = escapeHtml(order.orderNumber || 'CV-ORDER');
  const orderDate = escapeHtml(
    order.createdAt
      ? (typeof order.createdAt === 'string' && order.createdAt.length < 30 ? order.createdAt : new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }))
      : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })
  );
  const orderStatus = escapeHtml(order.currentStatus || 'Order Placed');
  const paymentMethod = escapeHtml(order.payment?.paymentMethod || 'UPI');
  const estimatedDelivery = escapeHtml(
    order.estimatedDeliveryDate || '4-6 Business Days'
  );

  const subtotal = Number(order.subtotal) || 0;
  const deliveryCharge = Number(order.deliveryCharge) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const totalAmount = Number(order.totalAmount) || 0;
  const couponCode = escapeHtml(order.couponCode || '');

  // Shipping address
  const addr = order.shippingAddress || {};
  const shippingFullName = escapeHtml(addr.fullName || customerName);
  const shippingPhone = escapeHtml(addr.mobileNumber || order.customerPhone || '');
  const shippingLines = [
    addr.houseFlat,
    addr.street,
    addr.area,
    addr.city,
    addr.state ? `${addr.state} - ${addr.pincode || ''}` : addr.pincode,
  ].filter(Boolean).map(escapeHtml).join(', ');

  // Order Details link
  const orderTrackingUrl = `${clientUrl}/?order=${encodeURIComponent(orderNumber)}`;

  // Items rows
  const itemsHtml = (order.items || []).map((item) => {
    const pName = escapeHtml(item.productName || 'Handcrafted Pottery');
    const pQty = Number(item.quantity) || 1;
    const pPrice = Number(item.unitPrice) || 0;
    const pTotal = Number(item.totalPrice) || pPrice * pQty;
    const pImg = item.productImage && item.productImage.startsWith('http')
      ? item.productImage
      : null;

    return `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid ${BRAND.borderColor};" valign="middle">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="64" valign="middle" style="padding-right: 14px;">
                ${pImg
                  ? `<img src="${escapeHtml(pImg)}" alt="${pName}" class="cv-item-img" width="58" height="58" style="width: 58px; height: 58px; border-radius: 10px; object-fit: cover; border: 1px solid ${BRAND.borderColor}; display: block;" />`
                  : `<div class="cv-item-img" style="width: 58px; height: 58px; border-radius: 10px; background-color: #fff7ed; border: 1px solid ${BRAND.borderColor}; text-align: center; line-height: 58px; font-size: 24px; color: ${BRAND.accentColor};">🏺</div>`
                }
              </td>
              <td valign="middle">
                <div style="font-size: 14px; font-weight: 700; color: ${BRAND.darkText}; margin-bottom: 4px; line-height: 1.3;">
                  ${pName}
                </div>
                <div style="font-size: 12px; color: ${BRAND.mutedText};">
                  Qty: ${pQty} &times; ${formatPrice(pPrice)}
                </div>
              </td>
              <td align="right" valign="middle" style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 700; color: ${BRAND.darkText}; white-space: nowrap; padding-left: 12px;">
                ${formatPrice(pTotal)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  const content = `
    <!-- Success Banner -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 52px; height: 52px; line-height: 52px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50%; font-size: 26px; color: #15803d; text-align: center; margin: 0 auto 12px auto;">
        ✓
      </div>
      <span style="display: inline-block; background-color: #ecfdf5; color: #15803d; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 14px; border-radius: 20px;">
        Order Placed Successfully
      </span>
      <h2 style="margin: 12px 0 6px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 800; color: ${BRAND.darkText};">
        Order Confirmed!
      </h2>
      <p style="margin: 0; font-size: 14px; color: ${BRAND.mutedText}; line-height: 1.5;">
        Hi <strong>${customerName}</strong>, thank you for your purchase! Your order has been placed successfully.
      </p>
    </div>

    <!-- Order Metadata Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf8; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; margin-bottom: 28px;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="cv-two-col" width="50%" valign="top" style="padding-right: 10px;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; margin-bottom: 2px;">Order Number</div>
                <div style="font-size: 14px; font-weight: 800; color: ${BRAND.darkText};">${orderNumber}</div>
              </td>
              <td class="cv-two-col" width="50%" valign="top">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; margin-bottom: 2px;">Order Date</div>
                <div style="font-size: 14px; font-weight: 600; color: ${BRAND.darkText};">${orderDate}</div>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 12px; border-top: 1px dashed ${BRAND.borderColor}; margin-top: 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="cv-two-col" width="50%" valign="top" style="padding-right: 10px;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; margin-bottom: 2px;">Current Status</div>
                      <span style="display: inline-block; background-color: #fff7ed; color: ${BRAND.accentDark}; border: 1px solid ${BRAND.accentBorder}; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 12px;">
                        ${orderStatus}
                      </span>
                    </td>
                    <td class="cv-two-col" width="50%" valign="top">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; margin-bottom: 2px;">Payment Method</div>
                      <div style="font-size: 13px; font-weight: 600; color: ${BRAND.darkText};">${paymentMethod}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Order Summary Title -->
    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${BRAND.darkText}; margin-bottom: 8px; border-bottom: 2px solid ${BRAND.accentColor}; display: inline-block; padding-bottom: 4px;">
      Order Summary
    </div>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      ${itemsHtml}
    </table>

    <!-- Financial Breakdown Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf8; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; margin-bottom: 28px;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size: 13px; color: ${BRAND.bodyText}; padding: 4px 0;">Subtotal</td>
              <td align="right" style="font-size: 13px; font-weight: 600; color: ${BRAND.darkText}; padding: 4px 0;">${formatPrice(subtotal)}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: ${BRAND.bodyText}; padding: 4px 0;">Shipping Charges</td>
              <td align="right" style="font-size: 13px; font-weight: 600; color: ${deliveryCharge === 0 ? '#15803d' : BRAND.darkText}; padding: 4px 0;">
                ${deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
              </td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td style="font-size: 13px; color: #15803d; padding: 4px 0;">
                Discount ${couponCode ? `(${couponCode})` : ''}
              </td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #15803d; padding: 4px 0;">
                -${formatPrice(discountAmount)}
              </td>
            </tr>` : ''}
            <tr>
              <td colspan="2" style="padding-top: 8px; border-top: 1px solid ${BRAND.borderColor};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: ${BRAND.darkText}; padding: 6px 0;">Final Order Total</td>
                    <td align="right" style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 800; color: ${BRAND.accentColor}; padding: 6px 0;">
                      ${formatPrice(totalAmount)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Shipping Address & Delivery Window -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fcfaf7; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; margin-bottom: 28px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.accentDark}; margin-bottom: 4px;">
            📍 Delivery Destination
          </div>
          <div style="font-size: 13px; font-weight: 700; color: ${BRAND.darkText}; margin-bottom: 2px;">
            ${shippingFullName} ${shippingPhone ? `&bull; ${shippingPhone}` : ''}
          </div>
          <div style="font-size: 12px; color: ${BRAND.mutedText}; line-height: 1.5;">
            ${shippingLines}
          </div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed ${BRAND.borderColor}; font-size: 12px; color: ${BRAND.darkText}; font-weight: 600;">
            📦 Estimated Delivery: <span style="color: #15803d;">${estimatedDelivery}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA Button: View Your Order -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <a href="${orderTrackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.accentColor} 0%, ${BRAND.accentDark} 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(194, 65, 12, 0.28); letter-spacing: 0.3px;">
            View Your Order &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Thank You Note -->
    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: ${BRAND.mutedText}; text-align: center;">
      Every order directly supports our community of master potters and craftsmen.<br>
      Thank you for being a patron of authentic Indian handicrafts.
    </p>
  `;

  return renderEmailLayout({
    title: `Order Confirmed — Order #${orderNumber}`,
    previewText: `Order #${orderNumber} Confirmed! Total: ${formatPrice(totalAmount)}. Estimated Delivery: ${estimatedDelivery}.`,
    content,
    clientUrl,
  });
};

/**
 * 3. AUTOMATIC ORDER STATUS UPDATE EMAIL TEMPLATE
 */
export const renderOrderStatusUpdateTemplate = ({
  order,
  previousStatus = '',
  newStatus,
  notes = '',
  clientUrl = 'http://localhost:5173',
}) => {
  const customerName = escapeHtml(
    order.customerName ||
    order.shippingAddress?.fullName ||
    'Valued Customer'
  );
  const orderNumber = escapeHtml(order.orderNumber || 'CV-ORDER');
  const orderDate = escapeHtml(
    order.createdAt
      ? (typeof order.createdAt === 'string' && order.createdAt.length < 30 ? order.createdAt : new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }))
      : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })
  );
  const totalAmount = Number(order.totalAmount) || 0;
  const statusClean = escapeHtml(newStatus);
  const adminNotes = notes ? escapeHtml(notes.trim()) : '';

  // Config mapping for all supported statuses:
  // - 'Order Placed'
  // - 'Payment Confirmed'
  // - 'Order Processing'
  // - 'Packed'
  // - 'Shipped'
  // - 'Out for Delivery'
  // - 'Delivered'
  // - 'Cancelled'
  const statusConfigs = {
    'Packed': {
      heading: 'Your Order Is Packed',
      badge: 'Order Packed & Ready',
      badgeBg: '#fff7ed',
      badgeColor: '#c2410c',
      badgeBorder: '#fdba74',
      icon: '📦',
      message: `Your order <strong>#${orderNumber}</strong> has been carefully inspected, cushioned, and packed by our artisan team. It is now safely staged and being prepared for courier handover.`,
      subject: `Your Order Is Packed — Order #${orderNumber}`,
    },
    'Shipped': {
      heading: 'Your Order Has Been Shipped',
      badge: 'Package In Transit',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      icon: '🚚',
      message: `Great news! Your handcrafted order <strong>#${orderNumber}</strong> has been handed over to our shipping courier and is currently in transit to your destination.`,
      subject: `Your Order Has Been Shipped — Order #${orderNumber}`,
    },
    'Out for Delivery': {
      heading: 'Your Order Is Out For Delivery',
      badge: 'Out For Delivery Today',
      badgeBg: '#fefce8',
      badgeColor: '#a16207',
      badgeBorder: '#fde047',
      icon: '🛵',
      message: `Your package for order <strong>#${orderNumber}</strong> has arrived at your local delivery hub and our delivery partner is on the way to complete delivery today.`,
      subject: `Out for Delivery — Order #${orderNumber}`,
    },
    'Delivered': {
      heading: 'Your Order Has Been Delivered',
      badge: 'Delivered Successfully',
      badgeBg: '#ecfdf5',
      badgeColor: '#15803d',
      badgeBorder: '#a7f3d0',
      icon: '🎉',
      message: `Your order <strong>#${orderNumber}</strong> has been successfully delivered. We hope you love your authentic handcrafted pieces! Thank you for shopping with CraftVeda.`,
      subject: `Your Order Has Been Delivered — Order #${orderNumber}`,
    },
    'Cancelled': {
      heading: 'Order Cancelled',
      badge: 'Order Cancelled',
      badgeBg: '#fff1f2',
      badgeColor: '#be123c',
      badgeBorder: '#fecdd3',
      icon: '✕',
      message: `Your order <strong>#${orderNumber}</strong> has been cancelled. If any payment was captured, your refund has been initiated and will reflect in your account within 3-5 business days.`,
      subject: `Order Cancelled — Order #${orderNumber}`,
    },
    'Order Processing': {
      heading: 'Order In Processing',
      badge: 'In Processing',
      badgeBg: '#f3e8ff',
      badgeColor: '#7e22ce',
      badgeBorder: '#e9d5ff',
      icon: '⚙️',
      message: `Your order <strong>#${orderNumber}</strong> is now being processed. Our team is coordinating with the artisans to prepare and package your handcrafted items.`,
      subject: `Order Processing — Order #${orderNumber}`,
    },
    'Payment Confirmed': {
      heading: 'Payment Confirmed',
      badge: 'Payment Confirmed',
      badgeBg: '#ecfdf5',
      badgeColor: '#15803d',
      badgeBorder: '#a7f3d0',
      icon: '💳',
      message: `Your payment for order <strong>#${orderNumber}</strong> has been verified successfully. Your order is moving directly into our fulfillment workflow.`,
      subject: `Payment Confirmed — Order #${orderNumber}`,
    },
    'Order Placed': {
      heading: 'Order Confirmed',
      badge: 'Order Placed',
      badgeBg: '#fff7ed',
      badgeColor: '#c2410c',
      badgeBorder: '#fdba74',
      icon: '🏺',
      message: `Your order <strong>#${orderNumber}</strong> has been placed successfully in the CraftVeda store.`,
      subject: `Order Confirmed — Order #${orderNumber}`,
    },
  };

  const currentConfig = statusConfigs[newStatus] || {
    heading: `Order Status: ${statusClean}`,
    badge: statusClean,
    badgeBg: '#f4f4f5',
    badgeColor: '#3f3f46',
    badgeBorder: '#d4d4d8',
    icon: '📋',
    message: `Your order <strong>#${orderNumber}</strong> status has been updated to <strong>${statusClean}</strong>.`,
    subject: `Order Status Update: ${statusClean} — Order #${orderNumber}`,
  };

  // Status progression indicator
  const stages = ['Placed', 'Packed', 'Shipped', 'Delivered'];
  const stageStatusMap = {
    'Order Placed': 0,
    'Payment Confirmed': 0,
    'Order Processing': 0,
    'Packed': 1,
    'Shipped': 2,
    'Out for Delivery': 2,
    'Delivered': 3,
  };
  const activeStageIdx = stageStatusMap[newStatus] !== undefined ? stageStatusMap[newStatus] : -1;
  const isCancelled = newStatus === 'Cancelled';

  const orderTrackingUrl = `${clientUrl}/?order=${encodeURIComponent(orderNumber)}`;

  // Item preview (up to 3 items)
  const itemsList = (order.items || []).slice(0, 3).map((item) => {
    const pName = escapeHtml(item.productName || 'Handcrafted Pottery');
    const pQty = Number(item.quantity) || 1;
    const pPrice = Number(item.totalPrice || (item.unitPrice * pQty)) || 0;
    return `
      <tr>
        <td style="font-size: 13px; color: ${BRAND.bodyText}; padding: 6px 0; border-bottom: 1px dashed ${BRAND.borderColor};">
          <strong>${pName}</strong> &times; ${pQty}
        </td>
        <td align="right" style="font-size: 13px; font-weight: 700; color: ${BRAND.darkText}; padding: 6px 0; border-bottom: 1px dashed ${BRAND.borderColor};">
          ${formatPrice(pPrice)}
        </td>
      </tr>
    `;
  }).join('');

  const content = `
    <!-- Status Icon & Pill -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 54px; height: 54px; line-height: 54px; background-color: ${currentConfig.badgeBg}; border: 1px solid ${currentConfig.badgeBorder}; border-radius: 50%; font-size: 26px; text-align: center; margin: 0 auto 12px auto;">
        ${currentConfig.icon}
      </div>
      <span style="display: inline-block; background-color: ${currentConfig.badgeBg}; color: ${currentConfig.badgeColor}; border: 1px solid ${currentConfig.badgeBorder}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 14px; border-radius: 20px;">
        ${escapeHtml(currentConfig.badge)}
      </span>
      <h2 style="margin: 12px 0 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 800; color: ${BRAND.darkText};">
        ${escapeHtml(currentConfig.heading)}
      </h2>
      <p style="margin: 0; font-size: 14px; color: ${BRAND.bodyText}; line-height: 1.6; max-width: 480px; margin: 0 auto;">
        Hi <strong>${customerName}</strong>, ${currentConfig.message}
      </p>
    </div>

    ${!isCancelled && activeStageIdx !== -1 ? `
    <!-- Milestone Progress Bar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fcfaf7; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${stages.map((st, idx) => {
                const isCompleted = idx <= activeStageIdx;
                const isCurrent = idx === activeStageIdx;
                const circleBg = isCompleted ? BRAND.accentColor : '#e5e0d8';
                const circleColor = '#ffffff';
                const textColor = isCurrent ? BRAND.accentDark : (isCompleted ? BRAND.darkText : BRAND.mutedText);
                const fontWeight = isCurrent ? '800' : (isCompleted ? '700' : '500');

                return `
                  <td align="center" valign="top" style="width: 25%;">
                    <div style="width: 26px; height: 26px; line-height: 26px; border-radius: 50%; background-color: ${circleBg}; color: ${circleColor}; font-size: 11px; font-weight: 800; text-align: center; margin: 0 auto 6px auto; box-shadow: ${isCurrent ? '0 0 0 4px #ffedd5' : 'none'};">
                      ${idx + 1}
                    </div>
                    <div style="font-size: 11px; font-weight: ${fontWeight}; color: ${textColor};">
                      ${st}
                    </div>
                  </td>
                `;
              }).join('')}
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Order Quick Overview Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="cv-two-col" width="50%" valign="top" style="padding-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; display: block; margin-bottom: 2px;">Order Number</span>
                <span style="font-size: 14px; font-weight: 800; color: ${BRAND.darkText};">${orderNumber}</span>
              </td>
              <td class="cv-two-col" width="50%" valign="top" style="padding-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; display: block; margin-bottom: 2px;">Order Placed</span>
                <span style="font-size: 13px; font-weight: 600; color: ${BRAND.darkText};">${orderDate}</span>
              </td>
            </tr>
            <tr>
              <td class="cv-two-col" width="50%" valign="top">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; display: block; margin-bottom: 2px;">Updated Status</span>
                <span style="display: inline-block; background-color: ${currentConfig.badgeBg}; color: ${currentConfig.badgeColor}; border: 1px solid ${currentConfig.badgeBorder}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">
                  ${statusClean}
                </span>
              </td>
              <td class="cv-two-col" width="50%" valign="top">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; display: block; margin-bottom: 2px;">Total Value</span>
                <span style="font-size: 14px; font-weight: 800; color: ${BRAND.accentColor};">${formatPrice(totalAmount)}</span>
              </td>
            </tr>
          </table>

          ${adminNotes ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed ${BRAND.borderColor};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND.mutedText}; display: block; margin-bottom: 4px;">Update Notes / Tracking Details:</span>
            <div style="font-size: 13px; line-height: 1.5; color: ${BRAND.darkText}; background-color: #fcfaf7; padding: 10px 12px; border-radius: 8px; border: 1px solid ${BRAND.borderColor};">
              ${adminNotes}
            </div>
          </div>
          ` : ''}
        </td>
      </tr>
    </table>

    ${itemsList ? `
    <!-- Items Preview -->
    <div style="background-color: #fdfbf8; border: 1px solid ${BRAND.borderColor}; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${BRAND.darkText}; margin-bottom: 8px;">
        Order Items
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemsList}
      </table>
    </div>
    ` : ''}

    <!-- CTA Button: View Your Order -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <a href="${orderTrackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.accentColor} 0%, ${BRAND.accentDark} 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(194, 65, 12, 0.28); letter-spacing: 0.3px;">
            View Your Order &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Support Message -->
    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: ${BRAND.mutedText}; text-align: center;">
      Need assistance with your delivery? Feel free to contact us at <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.accentColor}; text-decoration: none;">${BRAND.supportEmail}</a> or call ${BRAND.supportPhone}.
    </p>
  `;

  return {
    subject: currentConfig.subject,
    html: renderEmailLayout({
      title: currentConfig.subject,
      previewText: `Order #${orderNumber}: ${currentConfig.badge}. ${currentConfig.heading}.`,
      content,
      clientUrl,
    }),
  };
};
