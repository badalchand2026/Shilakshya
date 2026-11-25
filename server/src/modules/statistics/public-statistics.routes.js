import express from "express";

import {
    getPublicStatistics,
    getPublicStatisticById,
} from "./public-statistics.controller.js";

const router = express.Router();

router.get("/", getPublicStatistics);
router.get("/:id", getPublicStatisticById);

export default router;