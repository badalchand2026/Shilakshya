import express from "express";

import {
    getPublicProcessSteps,
    getPublicProcessStepById,
} from "./public-process-steps.controller.js";

const router = express.Router();

router.get("/", getPublicProcessSteps);
router.get("/:id", getPublicProcessStepById);

export default router;