
import {
    createServiceSchema,
    updateServiceSchema,
    updateServiceStatusSchema,
    reorderServicesSchema,
} from "./service.validation.js";

import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    updateServiceStatus,
    reorderServices,
    deleteService,
} from "./service.service.js";

import { removeServiceImage } from "./service.upload.js";

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

// CREATE SERVICE
export const createServiceController = async (req, res, next) => {
    try {
        const validation = createServiceSchema.safeParse(req.body);

        if (!validation.success) {
            if (req.file) {
                await removeServiceImage(
                    `/uploads/services/${req.file.filename}`
                );
            }

            return handleValidationError(validation.error, res);
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Service image is required.",
            });
        }

        const service = await createService(
            validation.data,
            req.file
        );

        return res.status(201).json({
            success: true,
            message: "Service created successfully.",
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL SERVICES
export const getAllServicesController = async (req, res, next) => {
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

        const result = await getAllServices({
            page,
            limit,
            search: req.query.search?.trim(),
            category: req.query.category?.trim(),
            isPublished,
            sortBy,
            sortOrder,
        });

        return res.status(200).json({
            success: true,
            message: "Services retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET SERVICE BY ID
export const getServiceByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID.",
            });
        }

        const service = await getServiceById(id);

        return res.status(200).json({
            success: true,
            message: "Service retrieved successfully.",
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE SERVICE
export const updateServiceController = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            if (req.file) {
                await removeServiceImage(
                    `/uploads/services/${req.file.filename}`
                );
            }

            return res.status(400).json({
                success: false,
                message: "Invalid service ID.",
            });
        }

        const validation = updateServiceSchema.safeParse(req.body);

        if (!validation.success) {
            if (req.file) {
                await removeServiceImage(
                    `/uploads/services/${req.file.filename}`
                );
            }

            return handleValidationError(validation.error, res);
        }

        const service = await updateService(
            id,
            validation.data,
            req.file
        );

        return res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE SERVICE STATUS
export const updateServiceStatusController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID.",
            });
        }

        const validation = updateServiceStatusSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return handleValidationError(validation.error, res);
        }

        const service = await updateServiceStatus(
            id,
            validation.data.isPublished
        );

        return res.status(200).json({
            success: true,
            message: validation.data.isPublished
                ? "Service published successfully."
                : "Service unpublished successfully.",
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

// REORDER SERVICES
export const reorderServicesController = async (
    req,
    res,
    next
) => {
    try {
        const validation = reorderServicesSchema.safeParse(req.body);

        if (!validation.success) {
            return handleValidationError(validation.error, res);
        }

        const services = await reorderServices(validation.data.ids);

        return res.status(200).json({
            success: true,
            message: "Services reordered successfully.",
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE SERVICE
export const deleteServiceController = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID.",
            });
        }

        await deleteService(id);

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};
