
import prisma from "../../config/prisma.js";

// Common error helper
const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// 1. Create Gallery Category
export const createGalleryCategory = async (categoryData) => {
    const { name, slug, description } = categoryData;

    // Check duplicate name (case-insensitive)
    const existingName = await prisma.galleryCategory.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
    });

    if (existingName) {
        throw createError(
            "Gallery category name already exists.",
            409,
            "GALLERY_CATEGORY_ALREADY_EXISTS"
        );
    }

    // Check duplicate slug
    const existingSlug = await prisma.galleryCategory.findUnique({
        where: { slug },
    });

    if (existingSlug) {
        throw createError(
            "Gallery category slug already exists.",
            409,
            "GALLERY_CATEGORY_SLUG_EXISTS"
        );
    }

    return await prisma.galleryCategory.create({
        data: {
            name,
            slug,
            description: description || null,
        },
    });
};

// 2. Get All Gallery Categories
export const getAllGalleryCategories = async () => {
    const [categories, totalCategories] = await Promise.all([
        prisma.galleryCategory.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        galleryItems: true,
                    },
                },
            },
        }),

        prisma.galleryCategory.count(),
    ]);

    return {
        categories,
        totalCategories,
    };
};

// 3. Get Gallery Category By ID
export const getGalleryCategoryById = async (categoryId) => {
    const category = await prisma.galleryCategory.findUnique({
        where: {
            id: categoryId,
        },
        include: {
            _count: {
                select: {
                    galleryItems: true,
                },
            },
        },
    });

    if (!category) {
        throw createError(
            "Gallery category not found.",
            404,
            "GALLERY_CATEGORY_NOT_FOUND"
        );
    }

    return category;
};

// 4. Update Gallery Category
export const updateGalleryCategory = async (categoryId, categoryData) => {
    const existingCategory = await prisma.galleryCategory.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (!existingCategory) {
        throw createError(
            "Gallery category not found.",
            404,
            "GALLERY_CATEGORY_NOT_FOUND"
        );
    }

    const { name, slug, description } = categoryData;

    // Check duplicate name
    if (name !== undefined) {
        const existingName = await prisma.galleryCategory.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
                NOT: {
                    id: categoryId,
                },
            },
        });

        if (existingName) {
            throw createError(
                "Gallery category name already exists.",
                409,
                "GALLERY_CATEGORY_ALREADY_EXISTS"
            );
        }
    }

    // Check duplicate slug
    if (slug !== undefined) {
        const existingSlug = await prisma.galleryCategory.findUnique({
            where: { slug },
        });

        if (existingSlug && existingSlug.id !== categoryId) {
            throw createError(
                "Gallery category slug already exists.",
                409,
                "GALLERY_CATEGORY_SLUG_EXISTS"
            );
        }
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;

    return await prisma.galleryCategory.update({
        where: {
            id: categoryId,
        },
        data: updateData,
    });
};

// 5. Delete Gallery Category
export const deleteGalleryCategory = async (categoryId) => {
    const existingCategory = await prisma.galleryCategory.findUnique({
        where: {
            id: categoryId,
        },
        include: {
            _count: {
                select: {
                    galleryItems: true,
                },
            },
        },
    });

    if (!existingCategory) {
        throw createError(
            "Gallery category not found.",
            404,
            "GALLERY_CATEGORY_NOT_FOUND"
        );
    }

    // Prevent deletion if gallery items exist
    if (existingCategory._count.galleryItems > 0) {
        throw createError(
            "Cannot delete this category because gallery items are assigned to it.",
            409,
            "GALLERY_CATEGORY_HAS_ITEMS"
        );
    }

    await prisma.galleryCategory.delete({
        where: {
            id: categoryId,
        },
    });

    return {
        deletedCategoryId: existingCategory.id,
    };
};
