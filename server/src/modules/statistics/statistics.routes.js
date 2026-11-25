import express from "express";

import {
    createStatistic,
    getAllStatistics,
    getStatisticById,
    updateStatistic,
    updateStatisticStatus,
    reorderStatistics,
    deleteStatistic,
} from "./statistics.controller.js";

import {
    authenticate,
    authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.post("/", createStatistic);
router.get("/", getAllStatistics);

// Keep this route before /:id routes.
router.patch("/reorder", reorderStatistics);

router.patch("/:id/status", updateStatisticStatus);
router.get("/:id", getStatisticById);
router.patch("/:id", updateStatistic);
router.delete("/:id", deleteStatistic);

export default router;