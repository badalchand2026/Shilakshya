
import { Router } from "express";

import {
    createGalleryItemController,
    getAllGalleryItemsController,
    getGalleryItemByIdController,
    updateGalleryItemController,
    updateGalleryStatusController,
    deleteGalleryItemController,
} from "./gallery.controller.js";

import { uploadGalleryImage } from "../../middlewares/gallery-upload.middleware.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// All gallery admin routes require ADMIN authentication
router.use(authenticate, authorizeRoles("ADMIN"));

// Create gallery item
router.post(
    "/",
    uploadGalleryImage,
    createGalleryItemController
);

// Get all gallery items
router.get("/", getAllGalleryItemsController);

// Publish/unpublish gallery item
router.patch(
    "/:id/status",
    updateGalleryStatusController
);

// Update gallery item (supports image replacement)
router.patch(
    "/:id",
    uploadGalleryImage,
    updateGalleryItemController
);

// Get gallery item by ID
router.get("/:id", getGalleryItemByIdController);

// Delete gallery item
router.delete("/:id", deleteGalleryItemController);

export default router;
