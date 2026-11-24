
import {
    getPublicProjectCategories,
    getPublicProjectCategoryBySlug,
} from "./public-project-category.service.js";

// GET all public project categories
export const getPublicProjectCategoriesController = async (req, res) => {
    try {
        const result = await getPublicProjectCategories();

        return res.status(200).json({
            success: true,
            message: "Public project categories retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get public project categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve project categories.",
        });
    }
};

// GET one public project category by slug
export const getPublicProjectCategoryBySlugController = async (req, res) => {
    try {
        const { slug } = req.params;

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        if (!slugRegex.test(slug)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category slug.",
            });
        }

        const category = await getPublicProjectCategoryBySlug(slug);

        return res.status(200).json({
            success: true,
            message: "Public project category retrieved successfully.",
            data: {
                category,
            },
        });
    } catch (error) {
        console.error("Get public project category error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve project category.",
            ...(error.code && { code: error.code }),
        });
    }
};
