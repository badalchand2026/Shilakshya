import { z } from "zod";

const booleanSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean());

export const createProcessStepSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Title is required.")
        .max(200, "Title cannot exceed 200 characters."),

    description: z.string()
        .trim()
        .min(1, "Description is required."),

    position: z.coerce.number()
        .int("Position must be an integer.")
        .min(0, "Position cannot be negative.")
        .optional(),

    isPublished: booleanSchema.optional(),
});

export const updateProcessStepSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Title is required.")
        .max(200, "Title cannot exceed 200 characters.")
        .optional(),

    description: z.string()
        .trim()
        .min(1, "Description is required.")
        .optional(),

    position: z.coerce.number()
        .int("Position must be an integer.")
        .min(0, "Position cannot be negative.")
        .optional(),

    isPublished: booleanSchema.optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update.",
    }
);

export const updateProcessStepStatusSchema = z.object({
    isPublished: booleanSchema,
});

export const reorderProcessStepsSchema = z.object({
    ids: z.array(
        z.string().uuid("Each process step ID must be a valid UUID.")
    ).min(1, "At least one process step ID is required."),
}).refine(
    (data) => new Set(data.ids).size === data.ids.length,
    {
        message: "Duplicate process step IDs are not allowed.",
    }
);