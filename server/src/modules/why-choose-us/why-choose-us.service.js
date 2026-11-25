
import prisma from "../../config/prisma.js";

// Custom error helper
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// CREATE
export const createWhyChooseUs = async (data) => {
    return prisma.whyChooseUs.create({
        data,
    });
};

// GET ALL (ADMIN)
export const getAllWhyChooseUs = async ({
    page = 1,
    limit = 10,
    search,
    isPublished,
    sortBy = "sortOrder",
    sortOrder = "asc",
}) => {
    const skip = (page - 1) * limit;

    const where = {
        ...(isPublished !== undefined && {
            isPublished,
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
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    icon: {
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
            orderBy: {
                [sortBy]: sortOrder,
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

// GET SINGLE (ADMIN)
export const getWhyChooseUsById = async (id) => {
    const item = await prisma.whyChooseUs.findUnique({
        where: { id },
    });

    if (!item) {
        throw createError("Why Choose Us item not found.", 404);
    }

    return item;
};

// UPDATE
export const updateWhyChooseUs = async (id, data) => {
    await getWhyChooseUsById(id);

    return prisma.whyChooseUs.update({
        where: { id },
        data,
    });
};

// UPDATE PUBLISH STATUS
export const updateWhyChooseUsStatus = async (
    id,
    isPublished
) => {
    await getWhyChooseUsById(id);

    return prisma.whyChooseUs.update({
        where: { id },
        data: { isPublished },
    });
};

// REORDER
export const reorderWhyChooseUs = async (ids) => {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
        throw createError(
            "Duplicate Why Choose Us IDs are not allowed.",
            400
        );
    }

    const existingItems = await prisma.whyChooseUs.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: {
            id: true,
        },
    });

    if (existingItems.length !== ids.length) {
        throw createError(
            "One or more Why Choose Us items were not found.",
            404
        );
    }

    await prisma.$transaction(
        ids.map((id, index) =>
            prisma.whyChooseUs.update({
                where: { id },
                data: {
                    sortOrder: index + 1,
                },
            })
        )
    );

    return prisma.whyChooseUs.findMany({
        orderBy: {
            sortOrder: "asc",
        },
    });
};

// DELETE
export const deleteWhyChooseUs = async (id) => {
    const existingItem = await getWhyChooseUsById(id);

    await prisma.whyChooseUs.delete({
        where: { id },
    });

    return existingItem;
};
