
import express from "express";

import {deleteUserController, getAllUsersController, getUserByIdController, updateUserStatusController,} from "./users.admin.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Admin: Get all users
router.get("/admin",authenticate,authorizeRoles("ADMIN"),getAllUsersController);

// Admin: Get a single user by ID
router.get("/admin/:id", authenticate, authorizeRoles("ADMIN"), getUserByIdController);

// Admin: Activate or deactivate a user
router.patch("/admin/:id/status",authenticate,authorizeRoles("ADMIN"),updateUserStatusController);

// Admin: Delete a user
router.delete("/admin/:id", authenticate, authorizeRoles("ADMIN"), deleteUserController);

export default router;
