import { validate as isUUID } from "uuid";

import {
    createProcessStepSchema,
    updateProcessStepSchema,
    updateProcessStepStatusSchema,
    reorderProcessStepsSchema,
} from "./process-steps.validation.js";

import * as processStepsService from "./process-steps.service.js";

const validateData = (schema, data) => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const error = new Error(
            result.error.issues[0]?.message || "Validation failed."
        );

        error.statusCode = 400;
        throw error;
    }

    return result.data;
};

const validateId = (id) => {
    if (!isUUID(id)) {
        const error = new Error("Invalid process step ID.");
        error.statusCode = 400;
        throw error;
    }
};

const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};

// Create process step
export const createProcessStep = asyncHandler(async (req, res) => {
    const data = validateData(createProcessStepSchema, req.body);

    const processStep =
        await processStepsService.createProcessStep(data);

    return res.status(201).json({
        success: true,
        message: "Process step created successfully.",
        data: { processStep },
    });
});

// Get all process steps
export const getAllProcessSteps = asyncHandler(async (req, res) => {
    const page = Math.max(
        1,
        Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search = req.query.search?.trim() || undefined;

    let isPublished;

    if (req.query.isPublished !== undefined) {
        if (
            req.query.isPublished !== "true" &&
            req.query.isPublished !== "false"
        ) {
            const error = new Error(
                "isPublished must be either true or false."
            );

            error.statusCode = 400;
            throw error;
        }

        isPublished = req.query.isPublished === "true";
    }

    const allowedSortFields = [
        "position",
        "title",
        "createdAt",
        "updatedAt",
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : "position";

    const sortOrder = req.query.sortOrder === "desc"
        ? "desc"
        : "asc";

    const result = await processStepsService.getAllProcessSteps({
        page,
        limit,
        search,
        isPublished,
        sortBy,
        sortOrder,
    });

    return res.status(200).json({
        success: true,
        message: "Process steps retrieved successfully.",
        data: result,
    });
});

// Get one process step
export const getProcessStepById = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const processStep =
        await processStepsService.getProcessStepById(req.params.id);

    if (!processStep) {
        const error = new Error("Process step not found.");
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Process step retrieved successfully.",
        data: { processStep },
    });
});

// Update process step
export const updateProcessStep = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const data = validateData(updateProcessStepSchema, req.body);

    const existingProcessStep =
        await processStepsService.getProcessStepById(req.params.id);

    if (!existingProcessStep) {
        const error = new Error("Process step not found.");
        error.statusCode = 404;
        throw error;
    }

    const processStep =
        await processStepsService.updateProcessStep(req.params.id, data);

    return res.status(200).json({
        success: true,
        message: "Process step updated successfully.",
        data: { processStep },
    });
});

// Publish or unpublish process step
export const updateProcessStepStatus = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const { isPublished } = validateData(
        updateProcessStepStatusSchema,
        req.body
    );

    const existingProcessStep =
        await processStepsService.getProcessStepById(req.params.id);

    if (!existingProcessStep) {
        const error = new Error("Process step not found.");
        error.statusCode = 404;
        throw error;
    }

    const processStep =
        await processStepsService.updateProcessStepStatus(
            req.params.id,
            isPublished
        );

    return res.status(200).json({
        success: true,
        message: isPublished
            ? "Process step published successfully."
            : "Process step unpublished successfully.",
        data: { processStep },
    });
});

// Reorder process steps
export const reorderProcessSteps = asyncHandler(async (req, res) => {
    const { ids } = validateData(
        reorderProcessStepsSchema,
        req.body
    );

    const existingProcessSteps = await Promise.all(
        ids.map((id) =>
            processStepsService.getProcessStepById(id)
        )
    );

    if (existingProcessSteps.some((item) => !item)) {
        const error = new Error(
            "One or more process step IDs were not found."
        );

        error.statusCode = 404;
        throw error;
    }

    const processSteps =
        await processStepsService.reorderProcessSteps(ids);

    return res.status(200).json({
        success: true,
        message: "Process steps reordered successfully.",
        data: { processSteps },
    });
});

// Delete process step
export const deleteProcessStep = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const existingProcessStep =
        await processStepsService.getProcessStepById(req.params.id);

    if (!existingProcessStep) {
        const error = new Error("Process step not found.");
        error.statusCode = 404;
        throw error;
    }

    await processStepsService.deleteProcessStep(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Process step deleted successfully.",
    });
});