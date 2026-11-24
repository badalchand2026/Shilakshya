
import {
    getPublicProjectsSchema,
} from "./public-project.validation.js";

import {
    getPublicProjects,
    getPublicProjectBySlug,
} from "./public-project.service.js";

// Get all published projects
export const getPublicProjectsController = async (req, res) => {
    try {
        // 1. Validate query parameters
        const validation = getPublicProjectsSchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        // 2. Get published projects
        const result = await getPublicProjects(validation.data);

        return res.status(200).json({
            success: true,
            message: "Published projects retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get public projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve projects.",
        });
    }
};

// Get one published project by slug
export const getPublicProjectBySlugController = async (req, res) => {
    try {
        const { slug } = req.params;

        // 1. Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        if (!slugRegex.test(slug)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project slug.",
            });
        }

        // 2. Get project by slug
        const project = await getPublicProjectBySlug(slug);

        return res.status(200).json({
            success: true,
            message: "Published project retrieved successfully.",
            data: {
                project,
            },
        });
    } catch (error) {
        console.error("Get public project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve project.",
        });
    }
};
