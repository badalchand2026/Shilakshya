
import prisma from "../../config/prisma.js";

// Get published services
export const getPublicServices = async ({
    page = 1,
    limit = 10,
    search,
    category,
    sortBy = "sortOrder",
    sortOrder = "asc",
}) => {
    const skip = (page - 1) * limit;

    const where = {
        isPublished: true,

        ...(category && {
            category: {
                equals: category,
                mode: "insensitive",
            },
        }),

        ...(search && {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    shortDescription: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),
    };

    const [services, total] = await prisma.$transaction([
        prisma.service.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                description: true,
                category: true,
                benefits: true,
                imageUrl: true,
                imageAlt: true,
                sortOrder: true,
            },
        }),

        prisma.service.count({ where }),
    ]);

    return {
        services,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Get published service by slug
export const getPublicServiceBySlug = async (slug) => {
    const service = await prisma.service.findFirst({
        where: {
            slug,
            isPublished: true,
        },
        select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            description: true,
            category: true,
            benefits: true,
            imageUrl: true,
            imageAlt: true,
            sortOrder: true,
        },
    });

    if (!service) {
        const error = new Error("Service not found.");
        error.statusCode = 404;
        throw error;
    }

    return service;
};
