
import { createContactInquirySchema } from "./contact.validation.js";
import { createContactInquiry } from "./contact.service.js";

export const submitContactInquiry = async (req, res) => {
  try {
    // Step 1: Validate submitted data
    const validationResult = createContactInquirySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Step 2: Save inquiry using the service
    const inquiry = await createContactInquiry(validationResult.data);

    // Step 3: Return success response
    return res.status(201).json({
      success: true,
      message: "Your inquiry has been submitted successfully. Our team will contact you within 24 hours.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    console.error("Contact inquiry submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting your inquiry. Please try again later.",
    });
  }
};
