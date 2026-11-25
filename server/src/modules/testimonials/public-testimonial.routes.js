
import express from "express";

import {
    getPublicTestimonialsController,
} from "./public-testimonial.controller.js";

const router = express.Router();

// GET PUBLISHED TESTIMONIALS
router.get("/", getPublicTestimonialsController);

export default router;
