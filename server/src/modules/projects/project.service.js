import prisma from "../../config/prisma.js";

// Helper to create errors with status codes
const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;

    return error;
};

// Create a new project
export const createProject = async (projectData) => {
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

    // 1. Check whether the slug already exists
    const existingProject = await prisma.project.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (existingProject) {
        throw createError(
            "A project with this slug already exists.",
            409,
            "DUPLICATE_SLUG"
        );
    }

    // 2. Check whether the category exists
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

    // 3. Create the project
    const project = await prisma.project.create({
        data: {
            title,
            slug,
            description,
            imageUrl,
            imageAlt: imageAlt || null,
            completionDate: new Date(`${completionDate}T00:00:00.000Z`),
            categoryId,
            sortOrder: sortOrder ?? 0,
            isPublished: isPublished ?? true,
        },
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

    return project;
};

// Get all projects for admin
export const getAllAdminProjects = async () => {
    const [projects, totalProjects] = await Promise.all([
        prisma.project.findMany({
            orderBy: [
                { sortOrder: "asc" },
                { createdAt: "desc" },
            ],
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),

        prisma.project.count(),
    ]);

    return {
        projects,
        totalProjects,
    };
};

// Get one project by ID for admin
export const getAdminProjectById = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
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

    if (!project) {
        throw createError(
            "Project not found.",
            404,
            "PROJECT_NOT_FOUND"
        );
    }

    return project;
};



//update Projct

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
