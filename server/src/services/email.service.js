
import "dotenv/config";
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  return await transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME,
      address: process.env.EMAIL_FROM_ADDRESS,
    },
    to,
    subject,
    html,
  });
};

export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  await transporter.verify();
  return true;
};
