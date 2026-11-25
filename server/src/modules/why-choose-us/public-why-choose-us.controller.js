
import {
    getPublicWhyChooseUs,
    getPublicWhyChooseUsById,
} from "./public-why-choose-us.service.js";

// GET ALL
export const getPublicWhyChooseUsController = async (
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

        const result = await getPublicWhyChooseUs({
            page,
            limit,
            search: req.query.search?.trim(),
        });

        return res.status(200).json({
            success: true,
            message: "Public Why Choose Us items retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET SINGLE
export const getPublicWhyChooseUsByIdController = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Why Choose Us ID.",
            });
        }

        const item = await getPublicWhyChooseUsById(id);

        return res.status(200).json({
            success: true,
            message: "Why Choose Us item retrieved successfully.",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};
