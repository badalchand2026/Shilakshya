
import { Router } from "express";

import {
  createBlogCategoryController,
  getAllBlogCategoriesController,
  updateBlogCategoryController,
  deleteBlogCategoryController
} from "./blog-category.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// Create Blog Category
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createBlogCategoryController
);

// Get All Blog Categories
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllBlogCategoriesController
);

// Update Blog Category
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateBlogCategoryController
);



// Delete Blog Category
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteBlogCategoryController
);


export default router;
