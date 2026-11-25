
import { Router } from "express";

import {
    getPublicMediaCoverageController,
    getFeaturedMediaCoverageController,
} from "./public-media-coverage.controller.js";

const router = Router();

// Get featured published media coverage
router.get("/featured", getFeaturedMediaCoverageController);

// Get all published media coverage
router.get("/", getPublicMediaCoverageController);

export default router;
