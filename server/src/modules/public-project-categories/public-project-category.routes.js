
import { Router } from "express";

import {
    getPublicProjectCategoriesController,
    getPublicProjectCategoryBySlugController,
} from "./public-project-category.controller.js";

const router = Router();

// Get all public project categories
router.get("/", getPublicProjectCategoriesController);

// Get one public project category by slug
router.get("/:slug", getPublicProjectCategoryBySlugController);

export default router;
