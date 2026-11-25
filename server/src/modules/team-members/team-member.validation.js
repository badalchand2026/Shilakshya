import { z } from "zod";

// Convert multipart form-data JSON strings into JavaScript values
const parseJsonField = (value) => {
    if (typeof value !== "string") return value;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

// Skills validation
const skillsSchema = z.preprocess(
    parseJsonField,
    z.array(
        z.string().trim().min(1).max(150)
    ).max(30).default([])
);

// Social links validation
const socialLinksSchema = z.preprocess(
    parseJsonField,
    z.record(z.string(), z.string().url()).optional()
);

// Create team member validation
export const createTeamMemberSchema = z.object({
    name: z.string().trim().min(2).max(150),

    position: z.string().trim().min(2).max(150),

    bio: z.string().trim().min(10),

    skills: skillsSchema,

    education: z.string().trim().max(2000).optional(),

    imageAlt: z.string().trim().max(255).optional(),

    socialLinks: socialLinksSchema,

    sortOrder: z.preprocess(
        (value) => value === undefined ? 0 : Number(value),
        z.number().int().min(0)
    ),

    isPublished: z.preprocess(
        (value) => {
            if (value === undefined) return true;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean()
    ),
});

// Update team member validation
export const updateTeamMemberSchema = createTeamMemberSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided.",
        }
    );

// Publish / unpublish validation
export const teamMemberStatusSchema = z.object({
    isPublished: z.preprocess(
        (value) => {
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean()
    ),
});

// Admin list query validation
export const teamMemberQuerySchema = z.object({
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

    sortBy: z.enum(["createdAt", "sortOrder", "name"]).default("sortOrder"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
