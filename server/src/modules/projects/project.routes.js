
import { Router } from "express";

import {
    createProjectController,
    getAllAdminProjectsController,
    getAdminProjectByIdController,
    updateProjectController,
    deleteProjectController,
} from "./project.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { uploadProjectImage } from "../../middlewares/upload.middleware.js";

const router = Router();

// Create Project
router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    uploadProjectImage,
    createProjectController
);

// Get All Projects
router.get(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    getAllAdminProjectsController
);

// Get Project By ID
router.get(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    getAdminProjectByIdController
);

// Update Project
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    uploadProjectImage,
    updateProjectController
);

// delete
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    deleteProjectController
);
export default router;
