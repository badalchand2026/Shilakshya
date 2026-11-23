
import express from "express";

import {
    createBlogTagController,
    getAllBlogTagsController,
    updateBlogTagController,
    deleteBlogTagController,
} from "./blog-tag.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// All blog tag routes require admin authentication
router.use(authenticate, authorizeRoles("ADMIN"));

// Create a blog tag
router.post("/", createBlogTagController);

// Get all blog tags
router.get("/", getAllBlogTagsController);

// Update a blog tag
router.patch("/:id", updateBlogTagController);

// Delete a blog tag
router.delete("/:id", deleteBlogTagController);

export default router;
