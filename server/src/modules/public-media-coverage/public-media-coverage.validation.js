
import { z } from "zod";

export const publicMediaCoverageQuerySchema = z.object({
    page: z.preprocess(
        (value) => value === undefined ? 1 : Number(value),
        z.number().int().min(1)
    ),

    limit: z.preprocess(
        (value) => value === undefined ? 10 : Number(value),
        z.number().int().min(1).max(100)
    ),

    search: z.string().trim().optional(),
});
