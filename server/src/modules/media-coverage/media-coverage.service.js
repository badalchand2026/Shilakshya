
import prisma from "../../config/prisma.js";

// Reusable error helper
const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// Create Media Coverage
export const createMediaCoverage = async (data) => {
    const existingItem = await prisma.mediaCoverage.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            headline: {
                equals: data.headline,
                mode: "insensitive",
            },
        },
        select: { id: true },
    });

    if (existingItem) {
        throw createError(
            "This media coverage already exists.",
            409,
            "MEDIA_COVERAGE_ALREADY_EXISTS"
        );
    }

    return prisma.mediaCoverage.create({
        data: {
            name: data.name,
            headline: data.headline,
            excerpt: data.excerpt,
            url: data.url,
            imageUrl: data.imageUrl,
            imageAlt: data.imageAlt || null,
            sortOrder: data.sortOrder ?? 0,
            isPublished: data.isPublished ?? false,
        },
    });
};

// Get all Media Coverage (Admin)
export const getAllMediaCoverage = async (query) => {
    const {
        page,
        limit,
        search,
        isPublished,
        sortBy,
        sortOrder,
    } = query;

    const where = {};

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

    if (isPublished !== undefined) {
        where.isPublished = isPublished === "true";
    }

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        prisma.mediaCoverage.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { [sortBy]: sortOrder },
                { createdAt: "desc" },
            ],
        }),

        prisma.mediaCoverage.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        items,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages,
            limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

// Get Media Coverage by ID (Admin)
export const getMediaCoverageById = async (id) => {
    const item = await prisma.mediaCoverage.findUnique({
        where: { id },
    });

    if (!item) {
        throw createError(
            "Media coverage not found.",
            404,
            "MEDIA_COVERAGE_NOT_FOUND"
        );
    }

    return item;
};

// Update Media Coverage
export const updateMediaCoverage = async (id, data) => {
    const existingItem = await prisma.mediaCoverage.findUnique({
        where: { id },
    });

    if (!existingItem) {
        throw createError(
            "Media coverage not found.",
            404,
            "MEDIA_COVERAGE_NOT_FOUND"
        );
    }

    const nextName = data.name ?? existingItem.name;
    const nextHeadline = data.headline ?? existingItem.headline;

    if (data.name !== undefined || data.headline !== undefined) {
        const duplicate = await prisma.mediaCoverage.findFirst({
            where: {
                id: { not: id },
                name: {
                    equals: nextName,
                    mode: "insensitive",
                },
                headline: {
                    equals: nextHeadline,
                    mode: "insensitive",
                },
            },
            select: { id: true },
        });

        if (duplicate) {
            throw createError(
                "This media coverage already exists.",
                409,
                "MEDIA_COVERAGE_ALREADY_EXISTS"
            );
        }
    }

    const {
        name,
        headline,
        excerpt,
        url,
        imageUrl,
        imageAlt,
        sortOrder,
        isPublished,
    } = data;

    const updatedItem = await prisma.mediaCoverage.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(headline !== undefined && { headline }),
            ...(excerpt !== undefined && { excerpt }),
            ...(url !== undefined && { url }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(imageAlt !== undefined && { imageAlt }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isPublished !== undefined && { isPublished }),
        },
    });

    return {
        updatedItem,
        oldImageUrl: imageUrl ? existingItem.imageUrl : null,
    };
};

// Publish / Unpublish Media Coverage
export const updateMediaCoverageStatus = async (id, isPublished) => {
    const existingItem = await prisma.mediaCoverage.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existingItem) {
        throw createError(
            "Media coverage not found.",
            404,
            "MEDIA_COVERAGE_NOT_FOUND"
        );
    }

    return prisma.mediaCoverage.update({
        where: { id },
        data: { isPublished },
    });
};

// Delete Media Coverage
export const deleteMediaCoverage = async (id) => {
    const existingItem = await prisma.mediaCoverage.findUnique({
        where: { id },
    });

    if (!existingItem) {
        throw createError(
            "Media coverage not found.",
            404,
            "MEDIA_COVERAGE_NOT_FOUND"
        );
    }

    await prisma.mediaCoverage.delete({
        where: { id },
    });

    return {
        id: existingItem.id,
        imageUrl: existingItem.imageUrl,
    };
};
