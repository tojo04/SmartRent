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
    return safeSend({
      from: FROM,
      to,
      subject: 'Your SmartRent OTP',
      text: `Your OTP code is ${otp}`,
      html: `<p>Your OTP code is <b>${otp}</b></p>`,
    });
  },
};