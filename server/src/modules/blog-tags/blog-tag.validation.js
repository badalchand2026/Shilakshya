
import { z } from "zod";

// Create blog tag validation
export const createBlogTagSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Tag name must be at least 2 characters long.")
        .max(100, "Tag name cannot exceed 100 characters."),

    slug: z
        .string()
        .trim()
        .min(2, "Tag slug must be at least 2 characters long.")
        .max(150, "Tag slug cannot exceed 150 characters.")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers, and hyphens."
        ),
});

// Update blog tag validation
export const updateBlogTagSchema = createBlogTagSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided to update the tag.",
        }
    );
