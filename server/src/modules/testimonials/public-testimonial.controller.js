
import { z } from "zod";
import { getPublicTestimonials } from "./public-testimonial.service.js";

// GET PUBLIC TESTIMONIALS
export const getPublicTestimonialsController = async (req, res, next) => {
    try {
        const querySchema = z.object({
            page: z.coerce.number().int().min(1).default(1),

            limit: z.coerce.number().int().min(1).max(100).default(10),

            search: z.string().trim().optional(),

            sortBy: z
                .enum(["name", "rating", "sortOrder", "createdAt"])
                .default("sortOrder"),

            sortOrder: z
                .enum(["asc", "desc"])
                .default("asc"),
        });

        const query = querySchema.parse(req.query);

        const result = await getPublicTestimonials({
            page: query.page,
            limit: query.limit,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return res.status(200).json({
            success: true,
            message: "Testimonials retrieved successfully.",
            data: result.testimonials,
            pagination: result.pagination,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message || "Invalid query parameters.",
            });
        }

        next(error);
    }
};
