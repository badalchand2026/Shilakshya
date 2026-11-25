
import {
    createTestimonialSchema,
    updateTestimonialSchema,
} from "./testimonial.validation.js";

import {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    updateTestimonialStatus,
    deleteTestimonial,
} from "./testimonial.service.js";

import { z } from "zod";

// CREATE TESTIMONIAL
export const createTestimonialController = async (req, res, next) => {
    try {
        const validatedData = createTestimonialSchema.parse(req.body);

        const testimonial = await createTestimonial(
            validatedData,
            req.files
        );

        return res.status(201).json({
            success: true,
            message: "Testimonial created successfully.",
            data: testimonial,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message || "Invalid testimonial data.",
            });
        }

        next(error);
    }
};

// GET ALL TESTIMONIALS
export const getAllTestimonialsController = async (req, res, next) => {
    try {
        const querySchema = z.object({
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(100).default(10),
            search: z.string().trim().optional(),
            isPublished: z.enum(["true", "false"]).optional(),
            rating: z.coerce.number().int().min(1).max(5).optional(),
            sortBy: z
                .enum(["name", "rating", "sortOrder", "createdAt", "updatedAt"])
                .default("sortOrder"),
            sortOrder: z.enum(["asc", "desc"]).default("asc"),
        });

        const query = querySchema.parse(req.query);

        const result = await getAllTestimonials({
            page: query.page,
            limit: query.limit,
            search: query.search,
            isPublished:
                query.isPublished === undefined
                    ? undefined
                    : query.isPublished === "true",
            rating: query.rating,
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

// GET SINGLE TESTIMONIAL
export const getTestimonialByIdController = async (req, res, next) => {
    try {
        const idSchema = z.string().uuid();
        const id = idSchema.parse(req.params.id);

        const testimonial = await getTestimonialById(id);

        return res.status(200).json({
            success: true,
            message: "Testimonial retrieved successfully.",
            data: testimonial,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID.",
            });
        }

        next(error);
    }
};

// UPDATE TESTIMONIAL
export const updateTestimonialController = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const validatedData = updateTestimonialSchema.parse(req.body);

        const testimonial = await updateTestimonial(
            id,
            validatedData,
            req.files
        );

        return res.status(200).json({
            success: true,
            message: "Testimonial updated successfully.",
            data: testimonial,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message || "Invalid testimonial data.",
            });
        }

        next(error);
    }
};

// UPDATE PUBLISH STATUS
export const updateTestimonialStatusController = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);

        const statusSchema = z.object({
            isPublished: z.boolean(),
        });

        const { isPublished } = statusSchema.parse(req.body);

        const testimonial = await updateTestimonialStatus(id, isPublished);

        return res.status(200).json({
            success: true,
            message: isPublished
                ? "Testimonial published successfully."
                : "Testimonial unpublished successfully.",
            data: testimonial,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message || "Invalid request data.",
            });
        }

        next(error);
    }
};

// DELETE TESTIMONIAL
export const deleteTestimonialController = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);

        await deleteTestimonial(id);

        return res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID.",
            });
        }

        next(error);
    }
};
