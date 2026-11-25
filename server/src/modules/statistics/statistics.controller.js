import { validate as isUUID } from "uuid";

import {
    createStatisticSchema,
    updateStatisticSchema,
    updateStatisticStatusSchema,
    reorderStatisticsSchema,
} from "./statistics.validation.js";

import * as statisticsService from "./statistics.service.js";

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
        const error = new Error("Invalid statistic ID.");
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

export const createStatistic = asyncHandler(async (req, res) => {
    const data = validateData(createStatisticSchema, req.body);

    const statistic = await statisticsService.createStatistic(data);

    return res.status(201).json({
        success: true,
        message: "Statistic created successfully.",
        data: { statistic },
    });
});

export const getAllStatistics = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
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

    const allowedSortFields = ["sortOrder", "createdAt", "updatedAt", "label"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : "sortOrder";

    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const result = await statisticsService.getAllStatistics({
        page,
        limit,
        search,
        isPublished,
        sortBy,
        sortOrder,
    });

    return res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully.",
        data: result,
    });
});

export const getStatisticById = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const statistic = await statisticsService.getStatisticById(req.params.id);

    if (!statistic) {
        const error = new Error("Statistic not found.");
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Statistic retrieved successfully.",
        data: { statistic },
    });
});

export const updateStatistic = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const data = validateData(updateStatisticSchema, req.body);

    const existingStatistic = await statisticsService.getStatisticById(
        req.params.id
    );

    if (!existingStatistic) {
        const error = new Error("Statistic not found.");
        error.statusCode = 404;
        throw error;
    }

    const statistic = await statisticsService.updateStatistic(
        req.params.id,
        data
    );

    return res.status(200).json({
        success: true,
        message: "Statistic updated successfully.",
        data: { statistic },
    });
});

export const updateStatisticStatus = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const { isPublished } = validateData(
        updateStatisticStatusSchema,
        req.body
    );

    const existingStatistic = await statisticsService.getStatisticById(
        req.params.id
    );

    if (!existingStatistic) {
        const error = new Error("Statistic not found.");
        error.statusCode = 404;
        throw error;
    }

    const statistic = await statisticsService.updateStatisticStatus(
        req.params.id,
        isPublished
    );

    return res.status(200).json({
        success: true,
        message: isPublished
            ? "Statistic published successfully."
            : "Statistic unpublished successfully.",
        data: { statistic },
    });
});

export const reorderStatistics = asyncHandler(async (req, res) => {
    const { ids } = validateData(reorderStatisticsSchema, req.body);

    const existingStatistics = await Promise.all(
        ids.map((id) => statisticsService.getStatisticById(id))
    );

    if (existingStatistics.some((item) => !item)) {
        const error = new Error(
            "One or more statistic IDs were not found."
        );
        error.statusCode = 404;
        throw error;
    }

    const statistics = await statisticsService.reorderStatistics(ids);

    return res.status(200).json({
        success: true,
        message: "Statistics reordered successfully.",
        data: { statistics },
    });
});

export const deleteStatistic = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const existingStatistic = await statisticsService.getStatisticById(
        req.params.id
    );

    if (!existingStatistic) {
        const error = new Error("Statistic not found.");
        error.statusCode = 404;
        throw error;
    }

    await statisticsService.deleteStatistic(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Statistic deleted successfully.",
    });
});