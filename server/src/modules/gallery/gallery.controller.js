
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import {
    createGalleryItem,
    getAllGalleryItems,
    getGalleryItemById,
    updateGalleryItem,
    updateGalleryStatus,
    deleteGalleryItem,
} from "./gallery.service.js";

import {
    createGallerySchema,
    updateGallerySchema,
    galleryStatusSchema,
    galleryQuerySchema,
} from "./gallery.validation.js";

// UUID validation
const uuidSchema = z.string().uuid();

// Remove a newly uploaded file when a request fails
const removeUploadedFile = async (file) => {
    if (!file) return;

    try {
        await fs.unlink(file.path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Uploaded file cleanup error:", error);
        }
    }
};

// Safely remove a gallery image using its stored URL
const removeGalleryImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith("/uploads/gallery/")) {
        return;
    }

    const filename = path.basename(imageUrl);

    if (filename !== imageUrl.slice("/uploads/gallery/".length)) {
        return;
    }

    const imagePath = path.resolve("uploads", "gallery", filename);
    const allowedDirectory = path.resolve("uploads", "gallery");

    if (path.dirname(imagePath) !== allowedDirectory) {
        return;
    }

    try {
        await fs.unlink(imagePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Gallery image deletion error:", error);
        }
    }
};

// 1. Create gallery item
export const createGalleryItemController = async (req, res) => {
    try {
        const validation = createGallerySchema.safeParse(req.body);

        if (!validation.success) {
            await removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Gallery image is required.",
            });
        }

        const galleryItem = await createGalleryItem({
            ...validation.data,
            imageUrl: `/uploads/gallery/${req.file.filename}`,
        });

        return res.status(201).json({
            success: true,
            message: "Gallery item created successfully.",
            data: { galleryItem },
        });
    } catch (error) {
        await removeUploadedFile(req.file);

        console.error("Create gallery item error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create gallery item.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 2. Get all gallery items
export const getAllGalleryItemsController = async (req, res) => {
    try {
        const validation = galleryQuerySchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery query parameters.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const result = await getAllGalleryItems(validation.data);

        return res.status(200).json({
            success: true,
            message: "Gallery items retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get gallery items error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve gallery items.",
        });
    }
};

// 3. Get gallery item by ID
export const getGalleryItemByIdController = async (req, res) => {
    try {
        const validation = uuidSchema.safeParse(req.params.id);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        const galleryItem = await getGalleryItemById(validation.data);

        return res.status(200).json({
            success: true,
            message: "Gallery item retrieved successfully.",
            data: { galleryItem },
        });
    } catch (error) {
        console.error("Get gallery item error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve gallery item.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 4. Update gallery item
export const updateGalleryItemController = async (req, res) => {
    try {
        const idValidation = uuidSchema.safeParse(req.params.id);

        if (!idValidation.success) {
            await removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        const validation = updateGallerySchema.safeParse(req.body);

        if (!validation.success) {
            await removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const updateData = {
            ...validation.data,
        };

        if (req.file) {
            updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
        }

        const result = await updateGalleryItem(
            idValidation.data,
            updateData
        );

        // Remove old image only after database update succeeds
        if (result.oldImageUrl) {
            await removeGalleryImage(result.oldImageUrl);
        }

        return res.status(200).json({
            success: true,
            message: "Gallery item updated successfully.",
            data: {
                galleryItem: result.galleryItem,
            },
        });
    } catch (error) {
        await removeUploadedFile(req.file);

        console.error("Update gallery item error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update gallery item.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 5. Publish or unpublish gallery item
export const updateGalleryStatusController = async (req, res) => {
    try {
        const idValidation = uuidSchema.safeParse(req.params.id);

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        const validation = galleryStatusSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid isPublished value.",
            });
        }

        const galleryItem = await updateGalleryStatus(
            idValidation.data,
            validation.data.isPublished
        );

        return res.status(200).json({
            success: true,
            message: validation.data.isPublished
                ? "Gallery item published successfully."
                : "Gallery item unpublished successfully.",
            data: { galleryItem },
        });
    } catch (error) {
        console.error("Update gallery status error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update gallery status.",
            ...(error.code && { code: error.code }),
        });
    }
};

// 6. Delete gallery item
export const deleteGalleryItemController = async (req, res) => {
    try {
        const validation = uuidSchema.safeParse(req.params.id);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        const result = await deleteGalleryItem(validation.data);

        // Delete image after database deletion succeeds
        await removeGalleryImage(result.imageUrl);

        return res.status(200).json({
            success: true,
            message: "Gallery item deleted successfully.",
            data: {
                deletedGalleryId: result.deletedGalleryId,
            },
        });
    } catch (error) {
        console.error("Delete gallery item error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete gallery item.",
            ...(error.code && { code: error.code }),
        });
    }
};
