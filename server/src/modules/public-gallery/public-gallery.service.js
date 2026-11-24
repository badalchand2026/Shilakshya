
import prisma from "../../config/prisma.js";

// Get published gallery items
export const getPublicGalleryItems = async (query) => {
    const {
        page,
        limit,
        search,
        categoryId,
        sortBy,
        sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    // Public visitors can only see published gallery items
    const where = {
        isPublished: true,
    };

    // Search by title or description
    if (search) {
        where.OR = [
            {
                title: {
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
        ];
    }

    // Filter by category
    if (categoryId) {
        where.categoryId = categoryId;
    }

    const [galleryItems, totalItems] = await Promise.all([
        prisma.gallery.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                imageAlt: true,
                sortOrder: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),

        prisma.gallery.count({ where }),
    ]);

    return {
        galleryItems,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            limit,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPreviousPage: page > 1,
        },
    };
};

// Get one published gallery item by ID
export const getPublicGalleryItemById = async (id) => {
    const galleryItem = await prisma.gallery.findFirst({
        where: {
            id,
            isPublished: true,
        },
        select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            imageAlt: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!galleryItem) {
        const error = new Error("Published gallery item not found.");
        error.statusCode = 404;
        throw error;
    }

    return galleryItem;
};

// Get categories that have published gallery items
export const getPublicGalleryCategories = async () => {
    return prisma.galleryCategory.findMany({
        where: {
            galleryItems: {
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
                    galleryItems: {
                        where: {
                            isPublished: true,
                        },
                    },
                },
            },
        },
    });
};
