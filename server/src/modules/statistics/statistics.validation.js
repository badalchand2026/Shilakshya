import { z } from "zod";

const booleanSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean());

export const createStatisticSchema = z.object({
    value: z.string()
        .trim()
        .min(1, "Value is required.")
        .max(50, "Value cannot exceed 50 characters."),

    label: z.string()
        .trim()
        .min(1, "Label is required.")
        .max(150, "Label cannot exceed 150 characters."),

    sortOrder: z.coerce.number()
        .int("Sort order must be an integer.")
        .min(0, "Sort order cannot be negative.")
        .optional(),

    isPublished: booleanSchema.optional(),
});

export const updateStatisticSchema = z.object({
    value: z.string()
        .trim()
        .min(1, "Value is required.")
        .max(50, "Value cannot exceed 50 characters.")
        .optional(),

    label: z.string()
        .trim()
        .min(1, "Label is required.")
        .max(150, "Label cannot exceed 150 characters.")
        .optional(),

    sortOrder: z.coerce.number()
        .int("Sort order must be an integer.")
        .min(0, "Sort order cannot be negative.")
        .optional(),

    isPublished: booleanSchema.optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required to update." }
);

export const updateStatisticStatusSchema = z.object({
    isPublished: booleanSchema,
});

export const reorderStatisticsSchema = z.object({
    ids: z.array(
        z.string().uuid("Each statistic ID must be a valid UUID.")
    ).min(1, "At least one statistic ID is required."),
}).refine(
    (data) => new Set(data.ids).size === data.ids.length,
    { message: "Duplicate statistic IDs are not allowed." }
);