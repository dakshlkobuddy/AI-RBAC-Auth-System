const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'CRM Team';
  const from = `${fromName} <${fromEmail}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendEmail,
};
