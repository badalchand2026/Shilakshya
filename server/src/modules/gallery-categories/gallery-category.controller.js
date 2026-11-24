
import {
    createGalleryCategory,
    getAllGalleryCategories,
    getGalleryCategoryById,
    updateGalleryCategory,
    deleteGalleryCategory,
} from "./gallery-category.service.js";

import {
    createGalleryCategorySchema,
    updateGalleryCategorySchema,
} from "./gallery-category.validation.js";

import { z } from "zod";

// UUID validation
const uuidSchema = z.string().uuid();

// 1. Create Gallery Category
export const createGalleryCategoryController = async (req, res) => {
    try {
        const validation = createGalleryCategorySchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const category = await createGalleryCategory(validation.data);

        return res.status(201).json({
            success: true,
            message: "Gallery category created successfully.",
            data: { category },
        });
    } catch (error) {
        console.error("Create gallery category error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create gallery category.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 2. Get All Gallery Categories
export const getAllGalleryCategoriesController = async (req, res) => {
    try {
        const result = await getAllGalleryCategories();

        return res.status(200).json({
            success: true,
            message: "Gallery categories retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get gallery categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve gallery categories.",
        });
    }
};

// 3. Get Gallery Category By ID
export const getGalleryCategoryByIdController = async (req, res) => {
    try {
        const validation = uuidSchema.safeParse(req.params.id);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery category ID.",
            });
        }

        const category = await getGalleryCategoryById(validation.data);

        return res.status(200).json({
            success: true,
            message: "Gallery category retrieved successfully.",
            data: { category },
        });
    } catch (error) {
        console.error("Get gallery category error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve gallery category.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 4. Update Gallery Category
export const updateGalleryCategoryController = async (req, res) => {
    try {
        const idValidation = uuidSchema.safeParse(req.params.id);

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery category ID.",
            });
        }

        const validation = updateGalleryCategorySchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const category = await updateGalleryCategory(
            idValidation.data,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Gallery category updated successfully.",
            data: { category },
        });
    } catch (error) {
        console.error("Update gallery category error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update gallery category.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 5. Delete Gallery Category
export const deleteGalleryCategoryController = async (req, res) => {
    try {
        const validation = uuidSchema.safeParse(req.params.id);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery category ID.",
            });
        }

        const result = await deleteGalleryCategory(validation.data);

        return res.status(200).json({
            success: true,
            message: "Gallery category deleted successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Delete gallery category error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete gallery category.",
            ...(error.code && { code: error.code }),
        });
    }
};
