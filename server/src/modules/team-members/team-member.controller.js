
import fs from "fs/promises";
import path from "path";

import {
    createTeamMemberSchema,
    updateTeamMemberSchema,
    teamMemberStatusSchema,
    teamMemberQuerySchema,
} from "./team-member.validation.js";

import {
    createTeamMember,
    getAllTeamMembers,
    getTeamMemberById,
    updateTeamMember,
    updateTeamMemberStatus,
    deleteTeamMember,
} from "./team-member.service.js";

// Remove an uploaded image from local storage
const removeLocalImage = async (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return;

    const filename = path.basename(imageUrl);

    if (!filename || filename !== imageUrl.split("/").pop()) return;

    const imagePath = path.resolve("uploads", "team-members", filename);

    try {
        await fs.unlink(imagePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove team member image:", error);
        }
    }
};

// Create team member
export const createTeamMemberController = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Team member image is required.",
            });
        }

        const validatedData = createTeamMemberSchema.parse(req.body);

        const imageUrl = `/uploads/team-members/${req.file.filename}`;

        const teamMember = await createTeamMember({
            ...validatedData,
            imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Team member created successfully.",
            data: { teamMember },
        });
    } catch (error) {
        if (error.name === "ZodError") {
            if (req.file) {
                await removeLocalImage(
                    `/uploads/team-members/${req.file.filename}`
                );
            }

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: error.issues,
            });
        }

        next(error);
    }
};

// Get all team members (Admin)
export const getAllTeamMembersController = async (req, res, next) => {
    try {
        const query = teamMemberQuerySchema.parse(req.query);

        const result = await getAllTeamMembers(query);

        return res.status(200).json({
            success: true,
            message: "Team members retrieved successfully.",
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

        next(error);
    }
};

// Get team member by ID
export const getTeamMemberByIdController = async (req, res, next) => {
    try {
        const teamMember = await getTeamMemberById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Team member retrieved successfully.",
            data: { teamMember },
        });
    } catch (error) {
        next(error);
    }
};

// Update team member
export const updateTeamMemberController = async (req, res, next) => {
    try {
        let validatedData = {};

        // Allow image-only updates
        if (Object.keys(req.body).length > 0) {
            validatedData = updateTeamMemberSchema.parse(req.body);
        }

        if (req.file) {
            validatedData.imageUrl =
                `/uploads/team-members/${req.file.filename}`;
        }

        if (Object.keys(validatedData).length === 0) {
            if (req.file) {
                await removeLocalImage(validatedData.imageUrl);
            }

            return res.status(400).json({
                success: false,
                message: "Provide at least one field or a new image to update.",
            });
        }

        const result = await updateTeamMember(
            req.params.id,
            validatedData
        );

        if (result.oldImageUrl) {
            await removeLocalImage(result.oldImageUrl);
        }

        return res.status(200).json({
            success: true,
            message: "Team member updated successfully.",
            data: { teamMember: result.updatedMember },
        });
    } catch (error) {
        if (error.name === "ZodError") {
            if (req.file) {
                await removeLocalImage(
                    `/uploads/team-members/${req.file.filename}`
                );
            }

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: error.issues,
            });
        }

        next(error);
    }
};

// Publish / unpublish team member
export const updateTeamMemberStatusController = async (
    req,
    res,
    next
) => {
    try {
        const validatedData = teamMemberStatusSchema.parse(req.body);

        const teamMember = await updateTeamMemberStatus(
            req.params.id,
            validatedData.isPublished
        );

        return res.status(200).json({
            success: true,
            message: validatedData.isPublished
                ? "Team member published successfully."
                : "Team member unpublished successfully.",
            data: { teamMember },
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Invalid publish status.",
                errors: error.issues,
            });
        }

        next(error);
    }
};

// Delete team member
export const deleteTeamMemberController = async (req, res, next) => {
    try {
        const deletedMember = await deleteTeamMember(req.params.id);

        await removeLocalImage(deletedMember.imageUrl);

        return res.status(200).json({
            success: true,
            message: "Team member deleted successfully.",
            data: {
                id: deletedMember.id,
            },
        });
    } catch (error) {
        next(error);
    }
};
