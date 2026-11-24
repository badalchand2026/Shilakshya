import { Router } from "express";

import {
    getPublicProjectsController,
    getPublicProjectBySlugController,
} from "./public-project.controller.js";

const router = Router();

// Get all published projects
router.get("/", getPublicProjectsController);

// Get one published project by slug
router.get("/:slug", getPublicProjectBySlugController);

export default router;
