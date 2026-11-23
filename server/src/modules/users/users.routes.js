
import express from "express";

import {
  getAllUsersController,
  getUserByIdController,
} from "./users.admin.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Admin: Get all users
router.get("/admin",authenticate,authorizeRoles("ADMIN"),getAllUsersController);

// Admin: Get a single user by ID
router.get("/admin/:id", authenticate, authorizeRoles("ADMIN"), getUserByIdController);

export default router;
