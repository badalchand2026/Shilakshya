import express from "express";

import {
    createProcessStep,
    getAllProcessSteps,
    getProcessStepById,
    updateProcessStep,
    updateProcessStepStatus,
    reorderProcessSteps,
    deleteProcessStep,
} from "./process-steps.controller.js";

import {
    authenticate,
    authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.post("/", createProcessStep);
router.get("/", getAllProcessSteps);

// Keep reorder before /:id routes.
router.patch("/reorder", reorderProcessSteps);

router.patch("/:id/status", updateProcessStepStatus);
router.get("/:id", getProcessStepById);
router.patch("/:id", updateProcessStep);
router.delete("/:id", deleteProcessStep);

export default router;