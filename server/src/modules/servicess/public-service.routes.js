
import express from "express";

import {
    getPublicServicesController,
    getPublicServiceBySlugController,
} from "./public-service.controller.js";

const router = express.Router();

// Public service listing
router.get("/", getPublicServicesController);

// Public service details
router.get("/:slug", getPublicServiceBySlugController);

export default router;
