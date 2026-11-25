
import prisma from "../../config/prisma.js";

// GET ALL PUBLISHED ITEMS
export const getPublicWhyChooseUs = async ({
    page = 1,
    limit = 10,
    search,
}) => {
    const skip = (page - 1) * limit;

    const where = {
        isPublished: true,

        ...(search && {
            OR: [
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
                {
                    features: {
                        has: search,
                    },
                },
            ],
        }),
    };

    const [items, total] = await prisma.$transaction([
        prisma.whyChooseUs.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { sortOrder: "asc" },
                { createdAt: "desc" },
            ],
            select: {
                id: true,
                icon: true,
                title: true,
                description: true,
                features: true,
                color: true,
                sortOrder: true,
            },
        }),

        prisma.whyChooseUs.count({ where }),
    ]);

    return {
        items,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// GET SINGLE PUBLISHED ITEM
export const getPublicWhyChooseUsById = async (id) => {
    const item = await prisma.whyChooseUs.findFirst({
        where: {
            id,
            isPublished: true,
        },
        select: {
            id: true,
            icon: true,
            title: true,
            description: true,
            features: true,
            color: true,
            sortOrder: true,
        },
    });

    if (!item) {
        const error = new Error("Why Choose Us item not found.");
        error.statusCode = 404;
        throw error;
    }

    return item;
};
