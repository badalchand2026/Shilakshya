
import prisma from "../../config/prisma.js";

const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// Common category existence check
const checkCategory = async (categoryId) => {
    const category = await prisma.galleryCategory.findUnique({
        where: { id: categoryId },
        select: { id: true },
    });

    if (!category) {
        throw createError(
            "Gallery category not found.",
            404,
            "GALLERY_CATEGORY_NOT_FOUND"
        );
    }
};

// 1. Create gallery item
export const createGalleryItem = async (galleryData) => {
    await checkCategory(galleryData.categoryId);

    const galleryItem = await prisma.gallery.create({
        data: {
            title: galleryData.title,
            description: galleryData.description || null,
            categoryId: galleryData.categoryId,
            imageUrl: galleryData.imageUrl,
            imageAlt: galleryData.imageAlt || null,
            sortOrder: galleryData.sortOrder ?? 0,
            isPublished: galleryData.isPublished ?? false,
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

    return galleryItem;
};

// 2. Get all gallery items with pagination and filters
export const getAllGalleryItems = async (query) => {
    const {
        page,
        limit,
        search,
        categoryId,
        isPublished,
        sortBy,
        sortOrder,
    } = query;

    const where = {};

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

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (isPublished !== undefined) {
        where.isPublished = isPublished === "true";
    }

    const skip = (page - 1) * limit;

    const [galleryItems, totalItems] = await Promise.all([
        prisma.gallery.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
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

// 3. Get gallery item by ID
export const getGalleryItemById = async (galleryId) => {
    const galleryItem = await prisma.gallery.findUnique({
        where: {
            id: galleryId,
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

    if (!galleryItem) {
        throw createError(
            "Gallery item not found.",
            404,
            "GALLERY_ITEM_NOT_FOUND"
        );
    }

    return galleryItem;
};

// 4. Update gallery item
export const updateGalleryItem = async (galleryId, galleryData) => {
    const existingItem = await prisma.gallery.findUnique({
        where: { id: galleryId },
    });

    if (!existingItem) {
        throw createError(
            "Gallery item not found.",
            404,
            "GALLERY_ITEM_NOT_FOUND"
        );
    }

    if (galleryData.categoryId) {
        await checkCategory(galleryData.categoryId);
    }

    const updateData = {};

    const allowedFields = [
        "title",
        "description",
        "categoryId",
        "imageAlt",
        "sortOrder",
        "isPublished",
        "imageUrl",
    ];

    for (const field of allowedFields) {
        if (galleryData[field] !== undefined) {
            updateData[field] = galleryData[field];
        }
    }

    const updatedItem = await prisma.gallery.update({
        where: { id: galleryId },
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
        galleryItem: updatedItem,
        oldImageUrl: galleryData.imageUrl
            ? existingItem.imageUrl
            : null,
    };
};

// 5. Update publish status
export const updateGalleryStatus = async (galleryId, isPublished) => {
    const existingItem = await prisma.gallery.findUnique({
        where: { id: galleryId },
        select: { id: true },
    });

    if (!existingItem) {
        throw createError(
            "Gallery item not found.",
            404,
            "GALLERY_ITEM_NOT_FOUND"
        );
    }

    return await prisma.gallery.update({
        where: { id: galleryId },
        data: { isPublished },
    });
};

// 6. Delete gallery item
export const deleteGalleryItem = async (galleryId) => {
    const existingItem = await prisma.gallery.findUnique({
        where: { id: galleryId },
    });

    if (!existingItem) {
        throw createError(
            "Gallery item not found.",
            404,
            "GALLERY_ITEM_NOT_FOUND"
        );
    }

    await prisma.gallery.delete({
        where: { id: galleryId },
    });

    return {
        deletedGalleryId: existingItem.id,
        imageUrl: existingItem.imageUrl,
    };
};
