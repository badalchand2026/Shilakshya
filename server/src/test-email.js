
import "dotenv/config";

import {
  sendEmail,
  verifyEmailConnection,
} from "./services/email.service.js";

const testEmail = async () => {
  try {
    console.log("Checking Brevo SMTP connection...");

    await verifyEmailConnection();

    console.log("Brevo SMTP connection successful!");

    const result = await sendEmail({
      to: "badalchand636@gmail.com",
      subject: "Shilakshya - SMTP Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Shilakshya!</h2>
          <p>This is a test email from your Shilakshya backend.</p>
          <p>Your Brevo SMTP integration is working successfully.</p>
        </div>
      `,
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", result.messageId);
  } catch (error) {
    console.error("Email test failed:", error.message);
  }
};

testEmail();
