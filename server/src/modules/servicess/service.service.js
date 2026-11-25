
import prisma from "../../config/prisma.js";

import {
    buildServiceImageUrl,
    removeServiceImage,
} from "./service.upload.js";

// Custom error helper
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Generate URL-friendly slug.
const generateSlug = (value) => {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// Generate unique slug.
const generateUniqueSlug = async (title, excludeId = null) => {
    const baseSlug = generateSlug(title);

    if (!baseSlug) {
        throw createError("A valid service title is required.", 400);
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.service.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existing || existing.id === excludeId) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
};

// Create service
export const createService = async (data, file) => {
    if (!file) {
        throw createError("Service image is required.", 400);
    }

    const slug = await generateUniqueSlug(data.title);

    try {
        return await prisma.service.create({
            data: {
                ...data,
                slug,
                imageUrl: buildServiceImageUrl(file),
            },
        });
    } catch (error) {
        await removeServiceImage(buildServiceImageUrl(file));
        throw error;
    }
};

// Get all services (Admin)
export const getAllServices = async ({
    page = 1,
    limit = 10,
    search,
    category,
    isPublished,
    sortBy = "sortOrder",
    sortOrder = "asc",
}) => {
    const skip = (page - 1) * limit;

    const where = {
        ...(category && {
            category: {
                equals: category,
                mode: "insensitive",
            },
        }),

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

// Get service by ID (Admin)
export const getServiceById = async (id) => {
    const service = await prisma.service.findUnique({
        where: { id },
    });

    if (!service) {
        throw createError("Service not found.", 404);
    }

    return service;
};

// Update service
export const updateService = async (id, data, file) => {
    const existingService = await getServiceById(id);

    let slug;

    if (data.title && data.title !== existingService.title) {
        slug = await generateUniqueSlug(data.title, id);
    }

    const updateData = {
        ...data,
        ...(slug && { slug }),
        ...(file && {
            imageUrl: buildServiceImageUrl(file),
        }),
    };

    try {
        const updatedService = await prisma.service.update({
            where: { id },
            data: updateData,
        });

        // Delete previous image only after successful update.
        if (file) {
            await removeServiceImage(existingService.imageUrl);
        }

        return updatedService;
    } catch (error) {
        if (file) {
            await removeServiceImage(buildServiceImageUrl(file));
        }

        throw error;
    }
};

// Update service publish status
export const updateServiceStatus = async (id, isPublished) => {
    await getServiceById(id);

    return prisma.service.update({
        where: { id },
        data: { isPublished },
    });
};

// Reorder services
export const reorderServices = async (ids) => {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
        throw createError("Duplicate service IDs are not allowed.", 400);
    }

    const existingServices = await prisma.service.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: {
            id: true,
        },
    });

    if (existingServices.length !== ids.length) {
        throw createError(
            "One or more services were not found.",
            404
        );
    }

    await prisma.$transaction(
        ids.map((id, index) =>
            prisma.service.update({
                where: { id },
                data: { sortOrder: index + 1 },
            })
        )
    );

    return prisma.service.findMany({
        orderBy: {
            sortOrder: "asc",
        },
    });
};

// Delete service
export const deleteService = async (id) => {
    const existingService = await getServiceById(id);

    await prisma.service.delete({
        where: { id },
    });

    // Remove image after successful database deletion.
    await removeServiceImage(existingService.imageUrl);

    return existingService;
};
