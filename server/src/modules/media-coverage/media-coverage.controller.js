
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import {
    createMediaCoverageSchema,
    updateMediaCoverageSchema,
    mediaCoverageStatusSchema,
    mediaCoverageQuerySchema,
} from "./media-coverage.validation.js";

import {
    createMediaCoverage,
    getAllMediaCoverage,
    getMediaCoverageById,
    updateMediaCoverage,
    updateMediaCoverageStatus,
    deleteMediaCoverage,
} from "./media-coverage.service.js";

// Remove an uploaded local image safely
const removeUploadedImage = async (imageUrl) => {
    if (
        !imageUrl ||
        typeof imageUrl !== "string" ||
        !imageUrl.startsWith("/uploads/media-coverage/")
    ) {
        return;
    }

    const filename = path.basename(imageUrl);
    const expectedFilename = imageUrl.split("/").pop();

    if (!filename || filename !== expectedFilename) {
        return;
    }

    const imagePath = path.resolve(
        "uploads",
        "media-coverage",
        filename
    );

    try {
        await fs.unlink(imagePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(
                "Media coverage image cleanup failed:",
                error
            );
        }
    }
};

// Get validation error response
const getValidationErrors = (error) => {
    return z.treeifyError(error);
};

// Create Media Coverage
export const createMediaCoverageController = async (req, res) => {
    let imageUrl = null;

    try {
        // Image is required during creation
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Media coverage image is required.",
            });
        }

        imageUrl = `/uploads/media-coverage/${req.file.filename}`;

        // Validate request body
        const validation = createMediaCoverageSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            await removeUploadedImage(imageUrl);

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: getValidationErrors(validation.error),
            });
        }

        // Save record in database
        const item = await createMediaCoverage({
            ...validation.data,
            imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Media coverage created successfully.",
            data: {
                mediaCoverage: item,
            },
        });
    } catch (error) {
        // Remove uploaded image if database operation fails
        if (imageUrl) {
            await removeUploadedImage(imageUrl);
        }

        console.error("Create media coverage error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to create media coverage.",
            ...(error.code && { code: error.code }),
        });
    }
};

// Get all Media Coverage (Admin)
export const getAllMediaCoverageController = async (req, res) => {
    try {
        const validation = mediaCoverageQuerySchema.safeParse(
            req.query
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: getValidationErrors(validation.error),
            });
        }

        const result = await getAllMediaCoverage(validation.data);

        return res.status(200).json({
            success: true,
            message: "Media coverage retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get media coverage error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve media coverage.",
        });
    }
};

// Get Media Coverage by ID (Admin)
export const getMediaCoverageByIdController = async (req, res) => {
    try {
        const idValidation = z.string().uuid().safeParse(
            req.params.id
        );

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid media coverage ID.",
            });
        }

        const item = await getMediaCoverageById(idValidation.data);

        return res.status(200).json({
            success: true,
            message: "Media coverage retrieved successfully.",
            data: {
                mediaCoverage: item,
            },
        });
    } catch (error) {
        console.error("Get media coverage by ID error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to retrieve media coverage.",
        });
    }
};

// Update Media Coverage
export const updateMediaCoverageController = async (req, res) => {
    let newImageUrl = null;

    try {
        // Validate ID
        const idValidation = z.string().uuid().safeParse(
            req.params.id
        );

        if (!idValidation.success) {
            if (req.file) {
                await removeUploadedImage(
                    `/uploads/media-coverage/${req.file.filename}`
                );
            }

            return res.status(400).json({
                success: false,
                message: "Invalid media coverage ID.",
            });
        }

        // Get newly uploaded image path
        if (req.file) {
            newImageUrl = `/uploads/media-coverage/${req.file.filename}`;
        }

        // Allow image-only updates
        let validation;

        if (
            newImageUrl &&
            Object.keys(req.body).length === 0
        ) {
            validation = {
                success: true,
                data: {},
            };
        } else {
            validation = updateMediaCoverageSchema.safeParse(
                req.body
            );
        }

        // Handle validation errors
        if (!validation.success) {
            if (newImageUrl) {
                await removeUploadedImage(newImageUrl);
            }

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: getValidationErrors(validation.error),
            });
        }

        // Update database record
        const result = await updateMediaCoverage(
            idValidation.data,
            {
                ...validation.data,
                ...(newImageUrl && {
                    imageUrl: newImageUrl,
                }),
            }
        );

        // Delete old image only after successful database update
        if (result.oldImageUrl) {
            await removeUploadedImage(result.oldImageUrl);
        }

        return res.status(200).json({
            success: true,
            message: "Media coverage updated successfully.",
            data: {
                mediaCoverage: result.updatedItem,
            },
        });
    } catch (error) {
        // Clean up new image if update fails
        if (newImageUrl) {
            await removeUploadedImage(newImageUrl);
        }

        console.error("Update media coverage error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to update media coverage.",
            ...(error.code && { code: error.code }),
        });
    }
};

// Publish / Unpublish Media Coverage
export const updateMediaCoverageStatusController = async (
    req,
    res
) => {
    try {
        const idValidation = z.string().uuid().safeParse(
            req.params.id
        );

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid media coverage ID.",
            });
        }

        const validation = mediaCoverageStatusSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid publication status.",
                errors: getValidationErrors(validation.error),
            });
        }

        const item = await updateMediaCoverageStatus(
            idValidation.data,
            validation.data.isPublished
        );

        return res.status(200).json({
            success: true,
            message: validation.data.isPublished
                ? "Media coverage published successfully."
                : "Media coverage unpublished successfully.",
            data: {
                mediaCoverage: item,
            },
        });
    } catch (error) {
        console.error(
            "Update media coverage status error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to update publication status.",
        });
    }
};

// Delete Media Coverage
export const deleteMediaCoverageController = async (req, res) => {
    try {
        const idValidation = z.string().uuid().safeParse(
            req.params.id
        );

        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid media coverage ID.",
            });
        }

        // Delete database record
        const result = await deleteMediaCoverage(
            idValidation.data
        );

        // Delete associated local image
        await removeUploadedImage(result.imageUrl);

        return res.status(200).json({
            success: true,
            message: "Media coverage deleted successfully.",
            data: {
                id: result.id,
            },
        });
    } catch (error) {
        console.error("Delete media coverage error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to delete media coverage.",
        });
    }
};
