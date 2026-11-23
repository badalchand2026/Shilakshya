
import prisma from "../../config/prisma.js";
import { sendEmail } from "../../services/email.service.js";

// Escape user input before inserting it into HTML emails.
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

const sendContactInquiryEmails = async (inquiry) => {
  const adminEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL || "info@shilakshya.com.np";

  const {
    fullName,
    email,
    phone,
    serviceRequired,
    projectType,
    projectDetails,
  } = inquiry;

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeService = escapeHtml(serviceRequired);
  const safeProjectType = escapeHtml(projectType);
  const safeDetails = escapeHtml(projectDetails).replace(/\n/g, "<br>");

  const adminEmailPromise = sendEmail({
    to: adminEmail,
    subject: "New Contact Inquiry - Shilakshya Website",
    html: `
      <h2>New Contact Inquiry</h2>
      <p>A customer has submitted a new inquiry through your website.</p>

      <table cellpadding="8" cellspacing="0" border="1">
        <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
        <tr><td><strong>Service Required</strong></td><td>${safeService}</td></tr>
        <tr><td><strong>Project Type</strong></td><td>${safeProjectType}</td></tr>
        <tr><td><strong>Project Details</strong></td><td>${safeDetails}</td></tr>
      </table>

      <p>Please contact the customer within 24 hours.</p>
      <p><strong>Shilakshya Griha Nirman Pvt. Ltd.</strong></p>
    `,
  });

  const customerEmailPromise = sendEmail({
    to: email,
    subject: "We Received Your Inquiry - Shilakshya",
    html: `
      <h2>Thank You for Contacting Shilakshya!</h2>

      <p>Dear ${safeName},</p>

      <p>
        Thank you for your interest in Shilakshya Griha Nirman Pvt. Ltd.
        We have successfully received your inquiry.
      </p>

      <p>
        Our team will review your project requirements and contact you
        within 24 hours.
      </p>

      <h3>Your Inquiry Summary</h3>
      <p><strong>Service:</strong> ${safeService}</p>
      <p><strong>Project Type:</strong> ${safeProjectType}</p>

      <p>
        If you have any additional questions, contact us at
        info@shilakshya.com.np or +977-9715171921.
      </p>

      <p>Best regards,<br />
      <strong>Shilakshya Griha Nirman Pvt. Ltd.</strong></p>
      <p>Baluwatar, Kathmandu, Nepal</p>
    `,
  });

  const results = await Promise.allSettled([
    adminEmailPromise,
    customerEmailPromise,
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const recipient = index === 0 ? "Admin" : "Customer";
      console.error(`${recipient} contact notification failed:`, result.reason);
    }
  });
};

export const createContactInquiry = async (data) => {
  // First, save the inquiry in PostgreSQL.
  const inquiry = await prisma.contactInquiry.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      serviceRequired: data.serviceRequired,
      projectType: data.projectType,
      projectDetails: data.projectDetails,
      privacyAccepted: data.privacyAccepted,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      serviceRequired: true,
      projectType: true,
      projectDetails: true,
      status: true,
      createdAt: true,
    },
  });

  // Then attempt both email notifications.
  await sendContactInquiryEmails(inquiry);

  return inquiry;
};
