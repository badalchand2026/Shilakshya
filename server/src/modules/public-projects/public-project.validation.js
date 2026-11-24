
import { z } from "zod";

// Validate public projects query parameters
export const getPublicProjectsSchema = z.object({
    page: z
        .string()
        .optional()
        .default("1")
        .transform(Number)
        .pipe(z.number().int().min(1)),

    limit: z
        .string()
        .optional()
        .default("10")
        .transform(Number)
        .pipe(z.number().int().min(1).max(50)),

    search: z
        .string()
        .trim()
        .optional(),

    category: z
        .string()
        .trim()
        .optional(),
});
