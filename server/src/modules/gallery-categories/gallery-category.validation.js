
import { z } from "zod";

// Create gallery category validation
export const createGalleryCategorySchema = z.object({
    name: z.string().trim().min(3).max(100),

    slug: z
        .string()
        .trim()
        .min(3)
        .max(150)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and hyphens only."
        ),

    description: z.string().trim().nullable().optional(),
});

// Update gallery category validation
export const updateGalleryCategorySchema = createGalleryCategorySchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "Please provide at least one field to update."
    );
