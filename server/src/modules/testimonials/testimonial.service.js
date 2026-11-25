
import prisma from "../../config/prisma.js";
import fs from "fs";
import path from "path";

const removeImage = (imageUrl) => {
    if (!imageUrl) return;

    const filename = path.basename(imageUrl);
    const imagePath = path.resolve("uploads/testimonials", filename);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

const buildImageUrl = (file) => {
    if (!file) return undefined;

    return `/uploads/testimonials/${file.filename}`;
};

// CREATE TESTIMONIAL
export const createTestimonial = async (data, files) => {
    const image = files?.image?.[0];
    const logoImage = files?.logoImage?.[0];

    if (!image || !logoImage) {
        removeImage(buildImageUrl(image));
        removeImage(buildImageUrl(logoImage));

        const error = new Error(
            "Both client image and logo image are required."
        );
        error.statusCode = 400;
        throw error;
    }

    try {
        const testimonial = await prisma.testimonial.create({
            data: {
                name: data.name,
                role: data.role,
                imageUrl: buildImageUrl(image),
                imageAlt: data.imageAlt || null,
                logoImageUrl: buildImageUrl(logoImage),
                logoImageAlt: data.logoImageAlt || null,
                content: data.content,
                rating: data.rating,
                sortOrder: data.sortOrder,
                isPublished: data.isPublished,
            },
        });

        return testimonial;
    } catch (error) {
        removeImage(buildImageUrl(image));
        removeImage(buildImageUrl(logoImage));
        throw error;
    }
};

// GET ALL TESTIMONIALS (ADMIN)
export const getAllTestimonials = async ({
    page = 1,
    limit = 10,
    search,
    isPublished,
    rating,
    sortBy = "sortOrder",
    sortOrder = "asc",
} = {}) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { role: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
        ];
    }

    if (isPublished !== undefined) {
        where.isPublished = isPublished;
    }

    if (rating !== undefined) {
        where.rating = rating;
    }

    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),

        prisma.testimonial.count({ where }),
    ]);

    return {
        testimonials,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// GET SINGLE TESTIMONIAL (ADMIN)
export const getTestimonialById = async (id) => {
    const testimonial = await prisma.testimonial.findUnique({
        where: { id },
    });

    if (!testimonial) {
        const error = new Error("Testimonial not found.");
        error.statusCode = 404;
        throw error;
    }

    return testimonial;
};

// UPDATE TESTIMONIAL
export const updateTestimonial = async (id, data, files) => {
    const existingTestimonial = await getTestimonialById(id);

    const image = files?.image?.[0];
    const logoImage = files?.logoImage?.[0];

    const updateData = {
        ...data,
    };

    if (image) {
        updateData.imageUrl = buildImageUrl(image);
    }

    if (logoImage) {
        updateData.logoImageUrl = buildImageUrl(logoImage);
    }

    try {
        const updatedTestimonial = await prisma.testimonial.update({
            where: { id },
            data: updateData,
        });

        // Remove old images only after successful database update.
        if (image) {
            removeImage(existingTestimonial.imageUrl);
        }

        if (logoImage) {
            removeImage(existingTestimonial.logoImageUrl);
        }

        return updatedTestimonial;
    } catch (error) {
        removeImage(buildImageUrl(image));
        removeImage(buildImageUrl(logoImage));
        throw error;
    }
};

// UPDATE TESTIMONIAL PUBLISH STATUS
export const updateTestimonialStatus = async (id, isPublished) => {
    await getTestimonialById(id);

    return prisma.testimonial.update({
        where: { id },
        data: { isPublished },
    });
};

// DELETE TESTIMONIAL
export const deleteTestimonial = async (id) => {
    const testimonial = await getTestimonialById(id);

    await prisma.testimonial.delete({
        where: { id },
    });

    removeImage(testimonial.imageUrl);
    removeImage(testimonial.logoImageUrl);

    return testimonial;
};
