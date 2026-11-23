
import { Router } from "express";

import { createBlogController, getAllBlogsController, getBlogByIdController, updateBlogController } from "./blog.admin.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// Create a new blog (ADMIN only)
router.post("/", authenticate, authorizeRoles("ADMIN"), createBlogController);
router.get("/", authenticate,authorizeRoles("ADMIN"), getAllBlogsController);
router.get("/:id",authenticate, authorizeRoles("ADMIN"), getBlogByIdController);
router.patch("/:id", authenticate, authorizeRoles("ADMIN"), updateBlogController )


export default router;
