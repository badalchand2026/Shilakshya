
import { z } from "zod";

// Create Blog Category Validation
export const createBlogCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Category name must be at least 3 characters.")
    .max(100, "Category name cannot exceed 100 characters."),

  slug: z
    .string()
    .trim()
    .min(3, "Category slug must be at least 3 characters.")
    .max(150, "Category slug cannot exceed 150 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only."
    ),

  description: z
    .string()
    .trim()
    .optional()
    .nullable(),
});



// Update Blog Category Validation
export const updateBlogCategorySchema = createBlogCategorySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided to update the category.",
    }
  );
