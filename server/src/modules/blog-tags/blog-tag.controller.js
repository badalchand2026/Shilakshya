
import {
    createBlogTag,
    getAllBlogTags,
    updateBlogTag,
    deleteBlogTag,
} from "./blog-tag.service.js";

import {
    createBlogTagSchema,
    updateBlogTagSchema,
} from "./blog-tag.validation.js";

// Create blog tag
export const createBlogTagController = async (req, res) => {
    try {
        const validatedData = createBlogTagSchema.parse(req.body);

        const tag = await createBlogTag(validatedData);

        return res.status(201).json({
            success: true,
            message: "Blog tag created successfully.",
            data: { tag },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create blog tag.",
        });
    }
};

// Get all blog tags
export const getAllBlogTagsController = async (req, res) => {
    try {
        const result = await getAllBlogTags();

        return res.status(200).json({
            success: true,
            message: "Blog tags retrieved successfully.",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve blog tags.",
        });
    }
};

// Update blog tag
export const updateBlogTagController = async (req, res) => {
    try {
        const validatedData = updateBlogTagSchema.parse(req.body);

        const tag = await updateBlogTag(req.params.id, validatedData);

        return res.status(200).json({
            success: true,
            message: "Blog tag updated successfully.",
            data: { tag },
        });
    } catch (error) {
        const statusCode = error.message === "Blog tag not found." ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update blog tag.",
        });
    }
};

// Delete blog tag
export const deleteBlogTagController = async (req, res) => {
    try {
        await deleteBlogTag(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Blog tag deleted successfully.",
        });
    } catch (error) {
        let statusCode = 400;

        if (error.message === "Blog tag not found.") {
            statusCode = 404;
        }

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to delete blog tag.",
        });
    }
};
