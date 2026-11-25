
import prisma from "../../config/prisma.js";

// GET PUBLIC TESTIMONIALS
export const getPublicTestimonials = async ({
    page = 1,
    limit = 10,
    search,
    sortBy = "sortOrder",
    sortOrder = "asc",
} = {}) => {
    const skip = (page - 1) * limit;

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
                role: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                content: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            skip,
            take: limit,

            orderBy: {
                [sortBy]: sortOrder,
            },

            select: {
                id: true,
                name: true,
                role: true,
                imageUrl: true,
                imageAlt: true,
                logoImageUrl: true,
                logoImageAlt: true,
                content: true,
                rating: true,
                sortOrder: true,
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
