
import { z } from "zod";

import {
    publicMediaCoverageQuerySchema,
} from "./public-media-coverage.validation.js";

import {
    getPublicMediaCoverage,
    getFeaturedMediaCoverage,
} from "./public-media-coverage.service.js";

// Get all published media coverage
export const getPublicMediaCoverageController = async (req, res) => {
    try {
        const validation = publicMediaCoverageQuerySchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters.",
                errors: z.treeifyError(validation.error),
            });
        }

        const result = await getPublicMediaCoverage(validation.data);

        return res.status(200).json({
            success: true,
            message: "Media coverage retrieved successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Get public media coverage error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve media coverage.",
        });
    }
};

// Get featured published media coverage
export const getFeaturedMediaCoverageController = async (req, res) => {
    try {
        const featuredItem = await getFeaturedMediaCoverage();

        return res.status(200).json({
            success: true,
            message: "Featured media coverage retrieved successfully.",
            data: {
                mediaCoverage: featuredItem,
            },
        });
    } catch (error) {
        console.error("Get featured media coverage error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve featured media coverage.",
        });
    }
};
