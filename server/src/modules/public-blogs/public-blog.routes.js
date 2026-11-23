
import express from "express";

import {
    getPublicBlogsController,
    getPublicBlogBySlugController,
    getFeaturedBlogsController,
} from "./public-blog.controller.js";

const router = express.Router();

// Get all published blogs with search and filters
router.get("/", getPublicBlogsController);

// Get featured published blogs
router.get("/featured", getFeaturedBlogsController);

// Get a single published blog by slug
router.get("/:slug", getPublicBlogBySlugController);

export default router;
