
import { z } from "zod";

// Validate public blog listing query parameters
export const getPublicBlogsSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),

    search: z.string().trim().optional(),

    category: z.string().trim().optional(),

    tag: z.string().trim().optional(),
});

// Validate featured blog query parameters
export const getFeaturedBlogsSchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5),
});
