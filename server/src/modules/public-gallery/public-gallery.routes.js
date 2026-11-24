
import { Router } from "express";

import {
    getPublicGalleryItemsController,
    getPublicGalleryItemByIdController,
    getPublicGalleryCategoriesController,
} from "./public-gallery.controller.js";

const router = Router();

// GET /api/gallery/categories
router.get("/categories", getPublicGalleryCategoriesController);

// GET /api/gallery
router.get("/", getPublicGalleryItemsController);

// GET /api/gallery/:id
router.get("/:id", getPublicGalleryItemByIdController);

export default router;
