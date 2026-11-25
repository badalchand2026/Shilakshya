
import express from "express";

import {
    createServiceController,
    getAllServicesController,
    getServiceByIdController,
    updateServiceController,
    updateServiceStatusController,
    reorderServicesController,
    deleteServiceController,
} from "./service.controller.js";

import { uploadServiceImage } from "./service.upload.js";

import {
    authenticate,
    authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and ADMIN role.
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// Create
router.post(
    "/",
    uploadServiceImage,
    createServiceController
);

// List
router.get("/", getAllServicesController);

// Reorder (must be before /:id)
router.patch("/reorder", reorderServicesController);

// Status
router.patch("/:id/status", updateServiceStatusController);

// Get single
router.get("/:id", getServiceByIdController);

// Update
router.patch(
    "/:id",
    uploadServiceImage,
    updateServiceController
);

// Delete
router.delete("/:id", deleteServiceController);

export default router;
