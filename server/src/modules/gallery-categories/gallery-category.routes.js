
import { Router } from "express";

import {
    createGalleryCategoryController,
    getAllGalleryCategoriesController,
    getGalleryCategoryByIdController,
    updateGalleryCategoryController,
    deleteGalleryCategoryController,
} from "./gallery-category.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// All routes require ADMIN authentication
router.use(authenticate, authorizeRoles("ADMIN"));

// Create category
router.post("/", createGalleryCategoryController);

// Get all categories
router.get("/", getAllGalleryCategoriesController);

// Get category by ID
router.get("/:id", getGalleryCategoryByIdController);

// Update category
router.patch("/:id", updateGalleryCategoryController);

// Delete category
router.delete("/:id", deleteGalleryCategoryController);

export default router;
