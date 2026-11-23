
import { z } from "zod";

export const createContactInquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(255, "Email cannot exceed 255 characters.")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters.")
    .optional()
    .or(z.literal("")),

  serviceRequired: z
    .string()
    .trim()
    .min(2, "Please select a service.")
    .max(100, "Service name cannot exceed 100 characters."),

  projectType: z
    .string()
    .trim()
    .min(2, "Please select a project type.")
    .max(100, "Project type cannot exceed 100 characters."),

  projectDetails: z
    .string()
    .trim()
    .min(10, "Project details must contain at least 10 characters.")
    .max(5000, "Project details cannot exceed 5000 characters."),

  privacyAccepted: z
    .literal(true, {
      error: "You must accept the Privacy Policy.",
    }),
});
