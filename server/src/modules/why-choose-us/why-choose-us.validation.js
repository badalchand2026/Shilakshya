
import { z } from "zod";

// Convert features received through Postman into an array.
const featuresSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return [];
        }

        try {
            const parsedValue = JSON.parse(trimmedValue);

            if (Array.isArray(parsedValue)) {
                return parsedValue;
            }
        } catch {
            // Support newline-separated or comma-separated features.
        }

        return trimmedValue.includes("\n")
            ? trimmedValue.split("\n").map((item) => item.trim())
            : trimmedValue.split(",").map((item) => item.trim());
    }

    return value;
}, z.array(
    z.string()
        .trim()
        .min(1, "Feature cannot be empty.")
).min(1, "At least one feature is required."));

// Convert form-data boolean strings into booleans.
const booleanSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean());

// Common fields
const whyChooseUsFields = {
    icon: z.string()
        .trim()
        .min(1, "Icon is required.")
        .max(100, "Icon cannot exceed 100 characters."),

    title: z.string()
        .trim()
        .min(1, "Title is required.")
        .max(200, "Title cannot exceed 200 characters."),

    description: z.string()
        .trim()
        .min(1, "Description is required."),

    features: featuresSchema,

    color: z.string()
        .trim()
        .min(1, "Color is required.")
        .max(50, "Color cannot exceed 50 characters."),

    sortOrder: z.coerce.number()
        .int()
        .min(0, "Sort order cannot be negative.")
        .default(0),

    isPublished: booleanSchema.default(false),
};

// CREATE
export const createWhyChooseUsSchema = z.object({
    ...whyChooseUsFields,
});

// UPDATE
export const updateWhyChooseUsSchema = z.object({
    icon: whyChooseUsFields.icon.optional(),

    title: whyChooseUsFields.title.optional(),

    description: whyChooseUsFields.description.optional(),

    features: featuresSchema.optional(),

    color: whyChooseUsFields.color.optional(),

    sortOrder: whyChooseUsFields.sortOrder.optional(),

    isPublished: booleanSchema.optional(),
});

// UPDATE STATUS
export const updateWhyChooseUsStatusSchema = z.object({
    isPublished: booleanSchema,
});

// REORDER
export const reorderWhyChooseUsSchema = z.object({
    ids: z.array(
        z.string().uuid("Invalid Why Choose Us ID.")
    ).min(1, "At least one ID is required."),
});
