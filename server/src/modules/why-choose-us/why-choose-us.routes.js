
import express from "express";

import {
    authenticate,
    authorizeRoles,
} from "../../middlewares/auth.middleware.js";

import {
    createWhyChooseUsController,
    getAllWhyChooseUsController,
    getWhyChooseUsByIdController,
    updateWhyChooseUsController,
    updateWhyChooseUsStatusController,
    reorderWhyChooseUsController,
    deleteWhyChooseUsController,
} from "./why-choose-us.controller.js";

const router = express.Router();

// Authentication and authorization
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// Create
router.post("/", createWhyChooseUsController);

// Get all
router.get("/", getAllWhyChooseUsController);

// Reorder (keep before /:id)
router.patch("/reorder", reorderWhyChooseUsController);

// Update publish status
router.patch(
    "/:id/status",
    updateWhyChooseUsStatusController
);

// Get single
router.get("/:id", getWhyChooseUsByIdController);

// Update
router.patch("/:id", updateWhyChooseUsController);

// Delete
router.delete("/:id", deleteWhyChooseUsController);

export default router;
