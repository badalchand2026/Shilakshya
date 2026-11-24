import path from "path";
import fs from "fs/promises";

import {
    createProjectSchema,
    updateProjectSchema
} from "./project.validation.js";

import {
    createProject,
    getAllAdminProjects,
    getAdminProjectById,
    updateProject,
    deleteProject,
} from "./project.service.js";




// Helper: delete an uploaded image from local storage
const removeUploadedFile = async (file) => {
    if (!file?.path) return;

    try {
        await fs.unlink(file.path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to delete uploaded image:", error);
        }
    }
};

// Convert multipart form values into correct JavaScript types
const normalizeProjectData = (body) => {
    const data = { ...body };

    if (data.sortOrder !== undefined) {
        data.sortOrder = Number(data.sortOrder);
    }

    if (data.isPublished === "true") {
        data.isPublished = true;
    } else if (data.isPublished === "false") {
        data.isPublished = false;
    }

    return data;
};

// Create project
export const createProjectController = async (req, res) => {
    try {
        // 1. Check whether an image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Project image is required.",
            });
        }

        // 2. Normalize multipart form values
        const projectData = normalizeProjectData(req.body);

        // 3. Validate project information
        const validation = createProjectSchema.safeParse(projectData);

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

        // 4. Generate the public image URL
        const imageUrl = `/uploads/projects/${req.file.filename}`;

        // 5. Save project in the database
        const project = await createProject({
            ...validation.data,
            imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully.",
            data: {
                project,
            },
        });
    } catch (error) {
        // Remove uploaded image if database creation fails
        await removeUploadedFile(req.file);

        console.error("Create project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create project.",
        });
    }
};

// Get all projects for admin
export const getAllAdminProjectsController = async (req, res) => {
    try {
        const result = await getAllAdminProjects();

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve projects.",
        });
    }
};

// Get one project by ID for admin
export const getAdminProjectByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate UUID
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const project = await getAdminProjectById(id);

        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully.",
            data: {
                project,
            },
        });
    } catch (error) {
        console.error("Get project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve project.",
        });
    }
};




const removeOldProjectImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith("/uploads/projects/")) {
        return;
    }

    const filename = path.basename(imageUrl);
    const imagePath = path.resolve("uploads/projects", filename);

    try {
        await fs.unlink(imagePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to delete old project image:", error);
        }
    }
};



export const updateProjectController = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate project ID
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            await removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        // 2. Convert multipart form values
        const projectData = normalizeProjectData(req.body);

        // 3. Validate project information
        let validatedData = {};

        // An image-only update is also allowed
        if (Object.keys(projectData).length > 0) {
            const validation = updateProjectSchema.safeParse(projectData);

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

            validatedData = validation.data;
        } else if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field or a new image.",
            });
        }

        // 4. Add the new image URL if an image was uploaded
        if (req.file) {
            validatedData.imageUrl =
                `/uploads/projects/${req.file.filename}`;
        }

        // 5. Update the project
        const { updatedProject, oldImageUrl } = await updateProject(
            id,
            validatedData
        );

        // 6. Delete the previous image after successful database update
        if (oldImageUrl) {
            await removeOldProjectImage(oldImageUrl);
        }

        return res.status(200).json({
            success: true,
            message: "Project updated successfully.",
            data: {
                project: updatedProject,
            },
        });
    } catch (error) {
        // Delete newly uploaded image if the update fails
        await removeUploadedFile(req.file);

        console.error("Update project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update project.",
        });
    }
};



export const deleteProjectController = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate project ID
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        // 2. Delete project from database
        const deletedProject = await deleteProject(id);

        // 3. Delete associated image from local storage
        await removeOldProjectImage(deletedProject.imageUrl);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully.",
            data: {
                projectId: deletedProject.deletedProjectId,
            },
        });
    } catch (error) {
        console.error("Delete project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete project.",
        });
    }
};
