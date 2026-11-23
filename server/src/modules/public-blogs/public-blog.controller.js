
import {
    getPublicBlogs,
    getPublicBlogBySlug,
    getFeaturedBlogs,
} from "./public-blog.service.js";

import {
    getPublicBlogsSchema,
    getFeaturedBlogsSchema,
} from "./public-blog.validation.js";

// Get all published blogs with filters
export const getPublicBlogsController = async (req, res) => {
    try {
        const validatedQuery = getPublicBlogsSchema.parse(req.query);

        const result = await getPublicBlogs(validatedQuery);

        return res.status(200).json({
            success: true,
            message: "Published blogs retrieved successfully.",
            data: result,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: error.issues,
            });
        }

        console.error("Get public blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve published blogs.",
        });
    }
};

// Get a single published blog by slug
export const getPublicBlogBySlugController = async (req, res) => {
    try {
        const blog = await getPublicBlogBySlug(req.params.slug);

        return res.status(200).json({
            success: true,
            message: "Published blog retrieved successfully.",
            data: { blog },
        });
    } catch (error) {
        if (error.message === "BLOG_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Published blog not found.",
            });
        }

        console.error("Get public blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve published blog.",
        });
    }
};

// Get featured published blogs
export const getFeaturedBlogsController = async (req, res) => {
    try {
        const validatedQuery = getFeaturedBlogsSchema.parse(req.query);

        const result = await getFeaturedBlogs(validatedQuery.limit);

        return res.status(200).json({
            success: true,
            message: "Featured blogs retrieved successfully.",
            data: result,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: error.issues,
            });
        }

        console.error("Get featured blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve featured blogs.",
        });
    }
};