import { z } from "zod";

// Validate date in YYYY-MM-DD format
const completionDateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Completion date must use YYYY-MM-DD format.")
    .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);

        return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
        );
    }, "Please provide a valid completion date.");

// Create project validation
export const createProjectSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Project title must be at least 3 characters.")
        .max(255, "Project title cannot exceed 255 characters."),

    slug: z
        .string()
        .trim()
        .min(3, "Slug must be at least 3 characters.")
        .max(255, "Slug cannot exceed 255 characters.")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and hyphens only."
        ),

    description: z
        .string()
        .trim()
        .min(10, "Project description must be at least 10 characters."),

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .nullable()
        .optional(),

    completionDate: completionDateSchema,

    categoryId: z.string().uuid("Please provide a valid category ID."),

    sortOrder: z
        .number()
        .int("Sort order must be an integer.")
        .min(0, "Sort order cannot be negative.")
        .optional(),

    isPublished: z.boolean().optional(),
});

// Update project validation
export const updateProjectSchema = createProjectSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "Please provide at least one field to update."
    );
