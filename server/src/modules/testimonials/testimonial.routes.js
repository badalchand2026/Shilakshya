
import express from "express";

import {
    createTestimonialController,
    getAllTestimonialsController,
    getTestimonialByIdController,
    updateTestimonialController,
    updateTestimonialStatusController,
    deleteTestimonialController,
} from "./testimonial.controller.js";

import { authenticate, authorizeRoles } from "../../middlewares/auth.middleware.js";

import { uploadTestimonialImages } from "./testimonial.upload.js";

const router = express.Router();

// All routes require authentication and ADMIN role.
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// CREATE TESTIMONIAL
router.post(
    "/",
    uploadTestimonialImages,
    createTestimonialController
);

// GET ALL TESTIMONIALS
router.get("/", getAllTestimonialsController);

// GET SINGLE TESTIMONIAL
router.get("/:id", getTestimonialByIdController);

// UPDATE TESTIMONIAL
router.patch(
    "/:id",
    uploadTestimonialImages,
    updateTestimonialController
);

// UPDATE PUBLISH STATUS
router.patch("/:id/status", updateTestimonialStatusController);

// DELETE TESTIMONIAL
router.delete("/:id", deleteTestimonialController);

export default router;
