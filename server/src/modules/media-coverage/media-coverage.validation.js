import { z } from "zod";

// Validate URL format
const articleUrlSchema = z
    .string()
    .trim()
    .url("Please provide a valid article URL.")
    .max(1000, "Article URL cannot exceed 1000 characters.")
    .refine(
        (value) => {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        },
        "Article URL must use HTTP or HTTPS."
    );

// Create Media Coverage validation
export const createMediaCoverageSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Publisher name must contain at least 2 characters.")
        .max(150, "Publisher name cannot exceed 150 characters."),

    headline: z
        .string()
        .trim()
        .min(3, "Headline must contain at least 3 characters.")
        .max(500, "Headline cannot exceed 500 characters."),

    excerpt: z
        .string()
        .trim()
        .min(10, "Excerpt must contain at least 10 characters."),

    url: articleUrlSchema,

    imageAlt: z
        .string()
        .trim()
        .max(255, "Image alt text cannot exceed 255 characters.")
        .optional(),

    sortOrder: z.preprocess(
        (value) => value === undefined || value === "" ? 0 : Number(value),
        z.number().int().min(0, "Sort order cannot be negative.")
    ).optional(),

    isPublished: z.preprocess(
        (value) => {
            if (value === undefined || value === "") return false;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean()
    ).optional(),
});

// Update Media Coverage validation
export const updateMediaCoverageSchema = createMediaCoverageSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field must be provided for update."
    );

// Validate publish/unpublish status
export const mediaCoverageStatusSchema = z.object({
    isPublished: z.preprocess(
        (value) => {
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean({
            message: "isPublished must be true or false.",
        })
    ),
});

// Validate media coverage list query parameters
export const mediaCoverageQuerySchema = z.object({
    page: z.preprocess(
        (value) => value === undefined ? 1 : Number(value),
        z.number().int().min(1)
    ),

    limit: z.preprocess(
        (value) => value === undefined ? 10 : Number(value),
        z.number().int().min(1).max(100)
    ),

    search: z.string().trim().optional(),

    isPublished: z.enum(["true", "false"]).optional(),

    sortBy: z
        .enum(["createdAt", "sortOrder", "name", "headline"])
        .default("sortOrder"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
