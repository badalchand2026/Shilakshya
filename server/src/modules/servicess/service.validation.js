
import { z } from "zod";

// Convert benefits received through Postman form-data into an array.
const benefitsSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        try {
            const parsedValue = JSON.parse(value);

            if (Array.isArray(parsedValue)) {
                return parsedValue;
            }

            return value;
        } catch {
            // Also support comma-separated benefits.
            return value.split(",").map((item) => item.trim());
        }
    }

    return value;
}, z.array(
    z.string()
        .trim()
        .min(1, "Benefit cannot be empty.")
).min(1, "At least one benefit is required."));

// Convert form-data boolean strings into actual booleans.
const booleanSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean());

// Create Service Validation
export const createServiceSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Service title is required.")
        .max(200, "Service title cannot exceed 200 characters."),

    shortDescription: z
        .string()
        .trim()
        .min(1, "Short description is required.")
        .max(500, "Short description cannot exceed 500 characters."),

    description: z
        .string()
        .trim()
        .min(1, "Service description is required."),

    category: z
        .string()
        .trim()
        .min(1, "Service category is required.")
        .max(100, "Category cannot exceed 100 characters."),

    benefits: benefitsSchema,

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .nullable()
        .optional(),

    sortOrder: z.coerce
        .number()
        .int()
        .min(0, "Sort order cannot be negative.")
        .default(0),

    isPublished: booleanSchema.default(false),
});

// Update Service Validation
export const updateServiceSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Service title is required.")
        .max(200, "Service title cannot exceed 200 characters.")
        .optional(),

    shortDescription: z
        .string()
        .trim()
        .min(1, "Short description is required.")
        .max(500, "Short description cannot exceed 500 characters.")
        .optional(),

    description: z
        .string()
        .trim()
        .min(1, "Service description is required.")
        .optional(),

    category: z
        .string()
        .trim()
        .min(1, "Service category is required.")
        .max(100, "Category cannot exceed 100 characters.")
        .optional(),

    benefits: benefitsSchema.optional(),

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .nullable()
        .optional(),

    sortOrder: z.coerce
        .number()
        .int()
        .min(0, "Sort order cannot be negative.")
        .optional(),

    isPublished: booleanSchema.optional(),
});

// Update Service Status Validation
export const updateServiceStatusSchema = z.object({
    isPublished: booleanSchema,
});

// Reorder Services Validation
export const reorderServicesSchema = z.object({
    ids: z.array(
        z.string().uuid("Invalid service ID.")
    ).min(1, "At least one service ID is required."),
});
