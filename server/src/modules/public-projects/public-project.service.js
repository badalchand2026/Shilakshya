
import prisma from "../../config/prisma.js";

// Get all published projects for public website
export const getPublicProjects = async (query) => {
    const { page, limit, search, category } = query;

    // Calculate how many records to skip
    const skip = (page - 1) * limit;

    // Build database filters
    const where = {
        isPublished: true,

        ...(search && {
            title: {
                contains: search,
                mode: "insensitive",
            },
        }),

        ...(category && {
            category: {
                slug: category,
            },
        }),
    };

    // Get projects and total count together
    const [projects, totalProjects] = await Promise.all([
        prisma.project.findMany({
            where,

            skip,
            take: limit,

            orderBy: [
                { sortOrder: "asc" },
                { completionDate: "desc" },
            ],

            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
                imageAlt: true,
                completionDate: true,
                sortOrder: true,

                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),

        prisma.project.count({ where }),
    ]);

    // Calculate pagination information
    const totalPages = Math.ceil(totalProjects / limit);

    return {
        projects,
        pagination: {
            currentPage: page,
            limit,
            totalProjects,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};



// Get one published project by slug
export const getPublicProjectBySlug = async (slug) => {
    const project = await prisma.project.findFirst({
        where: {
            slug,
            isPublished: true,
        },

        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            imageAlt: true,
            completionDate: true,

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
        const error = new Error("Published project not found.");
        error.statusCode = 404;
        error.code = "PROJECT_NOT_FOUND";

        throw error;
    }

    return project;
};
