
import { z } from "zod";

// Create Project Category Validation
export const createProjectCategorySchema = z.object({
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


// Update Project Category Validation
export const updateProjectCategorySchema = createProjectCategorySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided to update the category.",
    }
  );
