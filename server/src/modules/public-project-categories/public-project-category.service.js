
import prisma from "../../config/prisma.js";

// Get all categories that contain published projects
export const getPublicProjectCategories = async () => {
    const categories = await prisma.projectCategory.findMany({
        where: {
            projects: {
                some: {
                    isPublished: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },

        select: {
            id: true,
            name: true,
            slug: true,
            description: true,

            _count: {
                select: {
                    projects: {
                        where: {
                            isPublished: true,
                        },
                    },
                },
            },
        },
    });

    // Format category response
    const formattedCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        totalProjects: category._count.projects,
    }));

    return {
        categories: formattedCategories,
        totalCategories: formattedCategories.length,
    };
};

// Get one category by slug
export const getPublicProjectCategoryBySlug = async (slug) => {
    const category = await prisma.projectCategory.findFirst({
        where: {
            slug,
            projects: {
                some: {
                    isPublished: true,
                },
            },
        },

        select: {
            id: true,
            name: true,
            slug: true,
            description: true,

            _count: {
                select: {
                    projects: {
                        where: {
                            isPublished: true,
                        },
                    },
                },
            },
        },
    });

    if (!category) {
        const error = new Error("Published project category not found.");
        error.statusCode = 404;
        error.code = "PROJECT_CATEGORY_NOT_FOUND";
        throw error;
    }

    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        totalProjects: category._count.projects,
    };
};
