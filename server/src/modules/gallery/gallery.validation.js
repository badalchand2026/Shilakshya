
import { z } from "zod";

// Convert multipart boolean values
const booleanField = z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;

    return value;
}, z.boolean().optional());

// Convert multipart number values
const sortOrderField = z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
        return 0;
    }

    return Number(value);
}, z.number().int().min(0).max(100000));

// Create gallery item validation
export const createGallerySchema = z.object({
    title: z.string().trim().min(3).max(255),

    description: z.string().trim().nullable().optional(),

    categoryId: z.string().uuid(),

    imageAlt: z.string().trim().max(255).nullable().optional(),

    sortOrder: sortOrderField,

    isPublished: booleanField,
});

// Update gallery item validation
export const updateGallerySchema = z.object({
    title: z.string().trim().min(3).max(255).optional(),

    description: z.string().trim().nullable().optional(),

    categoryId: z.string().uuid().optional(),

    imageAlt: z.string().trim().max(255).nullable().optional(),

    sortOrder: sortOrderField.optional(),

    isPublished: booleanField,
}).refine(
    (data) => Object.keys(data).length > 0,
    "Please provide at least one field to update."
);

// Publish/unpublish validation
export const galleryStatusSchema = z.object({
    isPublished: z.preprocess((value) => {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return value;
    }, z.boolean()),
});

// Pagination and filter validation
export const galleryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    categoryId: z.string().uuid().optional(),

    isPublished: z.enum(["true", "false"]).optional(),

    sortBy: z.enum(["createdAt", "sortOrder", "title"]).default("sortOrder"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
