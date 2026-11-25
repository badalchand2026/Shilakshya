import { validate as isUUID } from "uuid";

import * as publicProcessStepsService from "./public-process-steps.service.js";

const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};

// Get all published process steps
export const getPublicProcessSteps = asyncHandler(async (req, res) => {
    const processSteps =
        await publicProcessStepsService.getPublicProcessSteps();

    return res.status(200).json({
        success: true,
        message: "Public process steps retrieved successfully.",
        data: { processSteps },
    });
});

// Get one published process step
export const getPublicProcessStepById = asyncHandler(async (req, res) => {
    if (!isUUID(req.params.id)) {
        const error = new Error("Invalid process step ID.");
        error.statusCode = 400;
        throw error;
    }

    const processStep =
        await publicProcessStepsService.getPublicProcessStepById(
            req.params.id
        );

    if (!processStep) {
        const error = new Error("Process step not found.");
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Public process step retrieved successfully.",
        data: { processStep },
    });
});