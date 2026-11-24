
import { Router } from "express";

import {
    createMediaCoverageController,
    getAllMediaCoverageController,
    getMediaCoverageByIdController,
    updateMediaCoverageController,
    updateMediaCoverageStatusController,
    deleteMediaCoverageController,
} from "./media-coverage.controller.js";

import { uploadMediaCoverageImage } from "../../middlewares/media-coverage-upload.middleware.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// Protect all Media Coverage admin routes
router.use(authenticate, authorizeRoles("ADMIN"));

// POST /api/media-coverage/admin
router.post(
    "/",
    uploadMediaCoverageImage,
    createMediaCoverageController
);

// GET /api/media-coverage/admin
router.get(
    "/",
    getAllMediaCoverageController
);

// PATCH /api/media-coverage/admin/:id/status
router.patch(
    "/:id/status",
    updateMediaCoverageStatusController
);

// PATCH /api/media-coverage/admin/:id
router.patch(
    "/:id",
    uploadMediaCoverageImage,
    updateMediaCoverageController
);

// GET /api/media-coverage/admin/:id
router.get(
    "/:id",
    getMediaCoverageByIdController
);

// DELETE /api/media-coverage/admin/:id
router.delete(
    "/:id",
    deleteMediaCoverageController
);

export default router;
