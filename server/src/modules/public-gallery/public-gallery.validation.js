
import { z } from "zod";

// Validate public gallery list query parameters
export const publicGalleryQuerySchema = z.object({
    page: z.preprocess(
        (value) => value === undefined ? 1 : Number(value),
        z.number().int().min(1)
    ),

    limit: z.preprocess(
        (value) => value === undefined ? 10 : Number(value),
        z.number().int().min(1).max(100)
    ),

    search: z.string().trim().optional(),

    categoryId: z.string().uuid().optional(),

    sortBy: z.enum(["createdAt", "sortOrder", "title"]).default("sortOrder"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
