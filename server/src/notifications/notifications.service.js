//notification.service.js

import nodemailer from 'nodemailer';

const disabled = String(process.env.MAIL_DISABLE).toLowerCase() === 'true';

function buildTransport() {
  // 1) Dev mode: just log email payloads
  if (disabled) {
    console.log('[mail] MAIL_DISABLE=true → using jsonTransport (no emails sent)');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  // 2) Generic SMTP (Mailtrap/SendGrid/postfix/etc.)
  if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
    const port = Number(process.env.MAIL_PORT || 587);
    const secure = process.env.MAIL_SECURE === 'true' || port === 465;
    console.log(`[mail] Using SMTP host ${process.env.MAIL_HOST}:${port} (secure=${secure})`);
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      logger: true,
      debug: true,
    });
  }

  // 3) Gmail (requires App Password, not normal password)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    console.log(`[mail] Using Gmail for ${process.env.GMAIL_USER}`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
      logger: true,
      debug: true,
    });
  }

  // 4) Fallback so signup never crashes in dev
  console.warn('[mail] No SMTP credentials found → falling back to jsonTransport');
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = buildTransport();
const FROM =
  process.env.MAIL_FROM ||
  process.env.GMAIL_USER ||
  'SmartRent <noreply@smartrent.local>';

// Verify on boot (shows auth/connection issues immediately)
transporter.verify((err, ok) => {
  if (err) console.error('[mail] transporter.verify failed:', err.message);
  else console.log('[mail] transporter ready:', ok);
});

async function safeSend(mail) {
  try {
    const info = await transporter.sendMail(mail);
    if (disabled) console.log('[mail][DEV log] email payload:', info?.message || info);
    return info;
  } catch (err) {
    console.error('[mail] send failed:', err?.message || err);
    if (!disabled) throw err; // in dev, don't crash the request
    return null;
  }
}

export const NotificationsService = {
  async sendOTPEmail(to, otp) {
    // Enhanced OTP display for development
    console.log('\n==================================================');
    console.log('🔐 EMAIL VERIFICATION OTP');
    console.log('==================================================');
    console.log(`📧 Email: ${to}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log('==================================================\n');
    console.log('ℹ️  Email not configured - OTP shown above for development\n');

    return safeSend({
      from: FROM,
      to,
      subject: 'Your SmartRent OTP',
      text: `Your OTP code is ${otp}`,
      html: `<p>Your OTP code is <b>${otp}</b></p>`,
    });
  },

  async sendRentalInvoice(to, customerName, pdfBuffer, invoiceNumber) {
    const subject = `SmartRent Invoice - ${invoiceNumber}`;
    const text = `Dear ${customerName},\n\nPlease find attached your rental invoice ${invoiceNumber}.\n\nThank you for choosing SmartRent!\n\nBest regards,\nSmartRent Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">SmartRent</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Rental Invoice</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${customerName},</h2>
          
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your rental order! Please find attached your official rental invoice <strong>${invoiceNumber}</strong>.
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Invoice Details:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Invoice Number: ${invoiceNumber}</li>
              <li>Product: ${rental.product?.name}</li>
              <li>Rental Period: ${new Date(rental.startDate).toLocaleDateString()} - ${new Date(rental.endDate).toLocaleDateString()}</li>
              <li>Total Amount: ₹${Number(rental.totalPrice).toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions about your rental or this invoice, please don't hesitate to contact our support team.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0;">
              Best regards,<br>
              <strong style="color: #1f2937;">The SmartRent Team</strong>
            </p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">SmartRent - Professional Rental Management Platform</p>
          <p style="margin: 5px 0 0 0;">For support: support@smartrent.com | +91 98765 43210</p>
        </div>
      </div>
    // In development, log the email details
    if (disabled || !process.env.GMAIL_USER) {
      console.log('\n📧 RENTAL INVOICE EMAIL (Development Mode)');
      console.log('==================================================');
      console.log(`📧 To: ${to}`);
      console.log(\`👤 Customer: ${customerName}`);
      console.log(\`📄 Invoice: ${invoiceNumber}`);
      console.log(\`📎 PDF Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
      console.log('==================================================');
      console.log('ℹ️  Email configuration not set - invoice details shown above');
      console.log('💡 PDF would be attached in production environment\n');
      return { success: true };
    }
    `;
    return safeSend({
      from: FROM,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `SmartRent_Invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  }
};