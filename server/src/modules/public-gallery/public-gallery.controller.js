
import { z } from "zod";

import {
    publicGalleryQuerySchema,
} from "./public-gallery.validation.js";

import {
    getPublicGalleryItems,
    getPublicGalleryItemById,
    getPublicGalleryCategories,
} from "./public-gallery.service.js";

// GET /api/gallery
export const getPublicGalleryItemsController = async (req, res) => {
    try {
        const validation = publicGalleryQuerySchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: z.treeifyError(validation.error),
            });
        }

        const result = await getPublicGalleryItems(validation.data);

        return res.status(200).json({
            success: true,
            message: "Published gallery items retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get public gallery items error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve gallery items.",
        });
    }
};

// GET /api/gallery/:id
export const getPublicGalleryItemByIdController = async (req, res) => {
    try {
        const idValidation = z.string().uuid().safeParse(req.params.id);

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        const galleryItem = await getPublicGalleryItemById(idValidation.data);

        return res.status(200).json({
            success: true,
            message: "Published gallery item retrieved successfully.",
            data: {
                galleryItem,
            },
        });
    } catch (error) {
        console.error("Get public gallery item error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode === 404
                ? error.message
                : "Failed to retrieve gallery item.",
        });
    }
};

// GET /api/gallery/categories
export const getPublicGalleryCategoriesController = async (req, res) => {
    try {
        const categories = await getPublicGalleryCategories();

        return res.status(200).json({
            success: true,
            message: "Published gallery categories retrieved successfully.",
            data: {
                categories,
            },
        });
    } catch (error) {
        console.error("Get public gallery categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve gallery categories.",
        });
    }
};
