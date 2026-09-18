const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer with graceful console fallback
 * @param {Object} options - Email parameters: { email, subject, message, html }
 */
const sendEmail = async (options) => {
  const hasEmailConfig =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== 'your_email@gmail.com';

  if (!hasEmailConfig) {
    console.log('----------------------------------------------------');
    console.log('📧 [DEV EMAIL SIMULATION]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    if (options.html) {
      console.log(`HTML Preview:\n${options.html}`);
    }
    console.log('----------------------------------------------------');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Aura Marketplace" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
