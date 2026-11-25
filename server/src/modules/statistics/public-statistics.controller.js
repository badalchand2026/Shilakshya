import { validate as isUUID } from "uuid";
import * as publicStatisticsService from "./public-statistics.service.js";

const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};

export const getPublicStatistics = asyncHandler(async (req, res) => {
    const statistics =
        await publicStatisticsService.getPublicStatistics();

    return res.status(200).json({
        success: true,
        message: "Public statistics retrieved successfully.",
        data: { statistics },
    });
});

export const getPublicStatisticById = asyncHandler(async (req, res) => {
    if (!isUUID(req.params.id)) {
        const error = new Error("Invalid statistic ID.");
        error.statusCode = 400;
        throw error;
    }

    const statistic =
        await publicStatisticsService.getPublicStatisticById(req.params.id);

    if (!statistic) {
        const error = new Error("Statistic not found.");
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Public statistic retrieved successfully.",
        data: { statistic },
    });
});