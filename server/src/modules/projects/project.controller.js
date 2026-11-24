import fs from "fs/promises";
import {
    createProjectSchema,
    updateProjectSchema
} from "./project.validation.js";

import {
    createProject,
    getAllAdminProjects,
    getAdminProjectById,
    updateProject
} from "./project.service.js";

import path from "path";



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




// Update project
export const updateProject = async (projectId, projectData) => {
    // 1. Check whether the project exists
    const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!existingProject) {
        throw createError(
            "Project not found.",
            404,
            "PROJECT_NOT_FOUND"
        );
    }

    const {
        title,
        slug,
        description,
        imageAlt,
        completionDate,
        categoryId,
        sortOrder,
        isPublished,
        imageUrl,
    } = projectData;

    // 2. Check duplicate slug
    if (slug && slug !== existingProject.slug) {
        const duplicateSlug = await prisma.project.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (duplicateSlug) {
            throw createError(
                "A project with this slug already exists.",
                409,
                "DUPLICATE_SLUG"
            );
        }
    }

    // 3. Check category if it is being changed
    if (categoryId && categoryId !== existingProject.categoryId) {
        const category = await prisma.projectCategory.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });

        if (!category) {
            throw createError(
                "Project category not found.",
                404,
                "CATEGORY_NOT_FOUND"
            );
        }
    }

    // 4. Prepare only the fields provided for update
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (completionDate !== undefined) {
        updateData.completionDate = new Date(
            `${completionDate}T00:00:00.000Z`
        );
    }

    // 5. Update project in database
    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return {
        updatedProject,
        oldImageUrl: imageUrl ? existingProject.imageUrl : null,
    };
};
