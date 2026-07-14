let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (_) {}

function getMailerConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FORM_MAIL_FROM || process.env.SMTP_USER || '',
    to: process.env.FORM_MAIL_TO || '',
  };
}

async function sendFormEmail({ subject, text, html }) {
  const cfg = getMailerConfig();
  if (!nodemailer) return { sent: false, reason: 'nodemailer_not_installed' };
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.to || !cfg.from) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: cfg.from,
    to: cfg.to,
    subject,
    text,
    html,
  });
  return { sent: true };
}

module.exports = { sendFormEmail, getMailerConfig };
