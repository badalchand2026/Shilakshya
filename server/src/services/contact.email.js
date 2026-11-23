
import { sendEmail } from "../../services/email.service.js";

const ADMIN_EMAIL = "badalchand636@gmail.com";

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

// Send an email notification to the Shilakshya team.
export const sendAdminInquiryEmail = async (inquiry) => {
  const html = `
    <h2>New Contact Inquiry</h2>
    <p>A new inquiry has been submitted through the Shilakshya website.</p>

    <h3>Customer Information</h3>
    <p><strong>Name:</strong> ${escapeHtml(inquiry.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || "Not provided")}</p>

    <h3>Project Information</h3>
    <p><strong>Service Required:</strong> ${escapeHtml(inquiry.serviceRequired)}</p>
    <p><strong>Project Type:</strong> ${escapeHtml(inquiry.projectType)}</p>
    <p><strong>Project Details:</strong></p>
    <p>${escapeHtml(inquiry.projectDetails).replace(/\n/g, "<br>")}</p>

    <hr />
    <p><strong>Inquiry ID:</strong> ${escapeHtml(inquiry.id)}</p>
    <p><strong>Status:</strong> NEW</p>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: "New Contact Inquiry - Shilakshya Website",
    html,
  });
};

// Send a confirmation email to the customer.
export const sendCustomerConfirmationEmail = async (inquiry) => {
  const html = `
    <h2>Thank You for Contacting Shilakshya!</h2>

    <p>Dear ${escapeHtml(inquiry.fullName)},</p>

    <p>
      Thank you for submitting your inquiry through our website.
      We have successfully received your project details.
    </p>

    <h3>Your Inquiry Summary</h3>
    <p><strong>Service:</strong> ${escapeHtml(inquiry.serviceRequired)}</p>
    <p><strong>Project Type:</strong> ${escapeHtml(inquiry.projectType)}</p>

    <p>
      Our team will review your inquiry and contact you within 24 hours.
    </p>

    <p>Thank you for considering Shilakshya Griha Nirman Pvt. Ltd.</p>

    <p>
      Best regards,<br />
      <strong>Shilakshya Team</strong><br />
      Baluwatar, Kathmandu, Nepal<br />
      +977-9715171921<br />
      info@shilakshya.com.np
    </p>
  `;

  return sendEmail({
    to: inquiry.email,
    subject: "We Received Your Inquiry - Shilakshya",
    html,
  });
};

// Attempt both emails independently.
export const sendContactInquiryEmails = async (inquiry) => {
  const results = await Promise.allSettled([
    sendAdminInquiryEmail(inquiry),
    sendCustomerConfirmationEmail(inquiry),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const emailType = index === 0 ? "Admin notification" : "Customer confirmation";

      console.error(`${emailType} email failed:`, result.reason);
    }
  });

  return results;
};
