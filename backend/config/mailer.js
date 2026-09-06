const nodemailer = require('nodemailer');

// Credentials come from backend/.env — see backend/.env.example
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = transporter;
