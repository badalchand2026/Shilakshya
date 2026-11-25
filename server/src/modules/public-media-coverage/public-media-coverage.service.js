
import prisma from "../../config/prisma.js";

const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Get all published media coverage records
export const getPublicMediaCoverage = async (query) => {
    const { page, limit, search } = query;

    const where = {
        isPublished: true,
    };

    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                headline: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                excerpt: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        prisma.mediaCoverage.findMany({
            where,
            select: {
                id: true,
                name: true,
                headline: true,
                excerpt: true,
                url: true,
                imageUrl: true,
                imageAlt: true,
                sortOrder: true,
            },
            orderBy: [
                {
                    sortOrder: "asc",
                },
                {
                    createdAt: "desc",
                },
            ],
            skip,
            take: limit,
        }),

        prisma.mediaCoverage.count({
            where,
        }),
    ]);

    return {
        items,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            limit,
            hasNextPage: page * limit < totalItems,
            hasPreviousPage: page > 1,
        },
    };
};

// Get the featured published media coverage
export const getFeaturedMediaCoverage = async () => {
    const featuredItem = await prisma.mediaCoverage.findFirst({
        where: {
            isPublished: true,
        },
        select: {
            id: true,
            name: true,
            headline: true,
            excerpt: true,
            url: true,
            imageUrl: true,
            imageAlt: true,
            sortOrder: true,
        },
        orderBy: [
            {
                sortOrder: "asc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    if (!featuredItem) {
        throw createError("No featured media coverage found.", 404);
    }

    return featuredItem;
};
