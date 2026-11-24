
import { Router } from "express";

import {
  createProjectCategoryController,
  getAllProjectCategoriesController,
  updateProjectCategoryController,
  deleteProjectCategoryController,
} from "./project-category.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();


// Create Project Category
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createProjectCategoryController
);


// Get All Project Categories
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllProjectCategoriesController
);


// Update Project Category
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateProjectCategoryController
);


// Delete Project Category
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteProjectCategoryController
);


export default router;
