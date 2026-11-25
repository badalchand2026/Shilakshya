
import {
    createWhyChooseUsSchema,
    updateWhyChooseUsSchema,
    updateWhyChooseUsStatusSchema,
    reorderWhyChooseUsSchema,
} from "./why-choose-us.validation.js";

import {
    createWhyChooseUs,
    getAllWhyChooseUs,
    getWhyChooseUsById,
    updateWhyChooseUs,
    updateWhyChooseUsStatus,
    reorderWhyChooseUs,
    deleteWhyChooseUs,
} from "./why-choose-us.service.js";

// Validation error handler
const handleValidationError = (error, res) => {
    return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })),
    });
};

// UUID validation
const isValidUUID = (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

// CREATE
export const createWhyChooseUsController = async (
    req,
    res,
    next
) => {
    try {
        const validation = createWhyChooseUsSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return handleValidationError(
                validation.error,
                res
            );
        }

        const item = await createWhyChooseUs(validation.data);

        return res.status(201).json({
            success: true,
            message: "Why Choose Us item created successfully.",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL
export const getAllWhyChooseUsController = async (
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
            "sortOrder",
            "createdAt",
            "updatedAt",
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

        let isPublished;

        if (req.query.isPublished !== undefined) {
            if (!["true", "false"].includes(req.query.isPublished)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid published status.",
                });
            }

            isPublished = req.query.isPublished === "true";
        }

        const result = await getAllWhyChooseUs({
            page,
            limit,
            search: req.query.search?.trim(),
            isPublished,
            sortBy,
            sortOrder,
        });

        return res.status(200).json({
            success: true,
            message: "Why Choose Us items retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET SINGLE
export const getWhyChooseUsByIdController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Why Choose Us ID.",
            });
        }

        const item = await getWhyChooseUsById(id);

        return res.status(200).json({
            success: true,
            message: "Why Choose Us item retrieved successfully.",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE
export const updateWhyChooseUsController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Why Choose Us ID.",
            });
        }

        const validation = updateWhyChooseUsSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return handleValidationError(
                validation.error,
                res
            );
        }

        if (Object.keys(validation.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update.",
            });
        }

        const item = await updateWhyChooseUs(
            id,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Why Choose Us item updated successfully.",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE STATUS
export const updateWhyChooseUsStatusController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Why Choose Us ID.",
            });
        }

        const validation = updateWhyChooseUsStatusSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return handleValidationError(
                validation.error,
                res
            );
        }

        const item = await updateWhyChooseUsStatus(
            id,
            validation.data.isPublished
        );

        return res.status(200).json({
            success: true,
            message: validation.data.isPublished
                ? "Why Choose Us item published successfully."
                : "Why Choose Us item unpublished successfully.",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

// REORDER
export const reorderWhyChooseUsController = async (
    req,
    res,
    next
) => {
    try {
        const validation = reorderWhyChooseUsSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return handleValidationError(
                validation.error,
                res
            );
        }

        const items = await reorderWhyChooseUs(
            validation.data.ids
        );

        return res.status(200).json({
            success: true,
            message: "Why Choose Us items reordered successfully.",
            data: items,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE
export const deleteWhyChooseUsController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Why Choose Us ID.",
            });
        }

        await deleteWhyChooseUs(id);

        return res.status(200).json({
            success: true,
            message: "Why Choose Us item deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};
