
import { z } from "zod";

// Create Blog Validation
export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Blog title must be at least 5 characters.")
    .max(255, "Blog title cannot exceed 255 characters."),

  slug: z
    .string()
    .trim()
    .min(3, "Blog slug must be at least 3 characters.")
    .max(255, "Blog slug cannot exceed 255 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only."
    ),

  excerpt: z
    .string()
    .trim()
    .max(1000, "Excerpt cannot exceed 1000 characters.")
    .optional()
    .nullable(),

  featuredImage: z
    .string()
    .trim()
    .url("Featured image must be a valid URL.")
    .optional()
    .nullable(),

  imageAlt: z
    .string()
    .trim()
    .max(255, "Image alt text cannot exceed 255 characters.")
    .optional()
    .nullable(),

  content: z
    .record(z.string(), z.any())
    .optional()
    .nullable(),

  metaTitle: z
    .string()
    .trim()
    .max(255, "Meta title cannot exceed 255 characters.")
    .optional()
    .nullable(),

  metaDescription: z
    .string()
    .trim()
    .max(500, "Meta description cannot exceed 500 characters.")
    .optional()
    .nullable(),

  focusKeyword: z
    .string()
    .trim()
    .max(255, "Focus keyword cannot exceed 255 characters.")
    .optional()
    .nullable(),

  canonicalUrl: z
    .string()
    .trim()
    .url("Canonical URL must be valid.")
    .optional()
    .nullable(),

  status: z
    .enum(["DRAFT", "PUBLISHED"])
    .optional(),

  isFeatured: z
    .boolean()
    .optional(),

  readingTime: z
    .number()
    .int()
    .min(1, "Reading time must be at least 1 minute.")
    .optional(),

  authorName: z
    .string()
    .trim()
    .max(100, "Author name cannot exceed 100 characters.")
    .optional()
    .nullable(),

  categoryId: z
    .string()
    .uuid("Invalid category ID.")
    .optional()
    .nullable(),

  tagIds: z
    .array(z.string().uuid("Invalid tag ID."))
    .optional()
    .default([]),
});
