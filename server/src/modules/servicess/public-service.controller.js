
import {
    getPublicServices,
    getPublicServiceBySlug,
} from "./public-service.service.js";

// GET PUBLIC SERVICES
export const getPublicServicesController = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters.",
            });
        }

        const allowedSortFields = [
            "title",
            "category",
            "sortOrder",
            "createdAt",
        ];

        const sortBy = req.query.sortBy || "sortOrder";
        const sortOrder = req.query.sortOrder || "asc";

        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort field.",
            });
        }

        if (!["asc", "desc"].includes(sortOrder)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort order.",
            });
        }

        const result = await getPublicServices({
            page,
            limit,
            search: req.query.search?.trim(),
            category: req.query.category?.trim(),
            sortBy,
            sortOrder,
        });

        return res.status(200).json({
            success: true,
            message: "Public services retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET PUBLIC SERVICE BY SLUG
export const getPublicServiceBySlugController = async (
    req,
    res,
    next
) => {
    try {
        const { slug } = req.params;

        const service = await getPublicServiceBySlug(slug);

        return res.status(200).json({
            success: true,
            message: "Service retrieved successfully.",
            data: service,
        });
    } catch (error) {
        next(error);
    }
};
