
import { z } from "zod";

export const createTestimonialSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .max(150, "Name cannot exceed 150 characters."),

    role: z
        .string()
        .trim()
        .min(1, "Role is required.")
        .max(150, "Role cannot exceed 150 characters."),

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .optional()
        .nullable(),

    logoImageAlt: z
        .string()
        .trim()
        .max(255, "Logo image alt text cannot exceed 255 characters.")
        .optional()
        .nullable(),

    content: z
        .string()
        .trim()
        .min(1, "Testimonial content is required."),

    rating: z.coerce
        .number()
        .int("Rating must be a whole number.")
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5."),

    sortOrder: z.coerce
        .number()
        .int("Sort order must be a whole number.")
        .min(0, "Sort order cannot be negative.")
        .default(0),

    isPublished: z.preprocess(
    (value) => {
        if (value === "true") return true;
        if (value === "false") return false;

        return value;
    },
    z.boolean().default(false)
),
});

export const updateTestimonialSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .max(150, "Name cannot exceed 150 characters.")
        .optional(),

    role: z
        .string()
        .trim()
        .min(1, "Role is required.")
        .max(150, "Role cannot exceed 150 characters.")
        .optional(),

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .nullable()
        .optional(),

    logoImageAlt: z
        .string()
        .trim()
        .max(255, "Logo image alt text cannot exceed 255 characters.")
        .nullable()
        .optional(),

    content: z
        .string()
        .trim()
        .min(1, "Testimonial content is required.")
        .optional(),

    rating: z.coerce
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),

    sortOrder: z.coerce
        .number()
        .int()
        .min(0)
        .optional(),

    isPublished: z.preprocess(
        (value) => {
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean()
    ).optional(),
});