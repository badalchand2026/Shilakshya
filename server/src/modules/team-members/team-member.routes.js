
import express from "express";

import {
    createTeamMemberController,
    getAllTeamMembersController,
    getTeamMemberByIdController,
    updateTeamMemberController,
    updateTeamMemberStatusController,
    deleteTeamMemberController,
} from "./team-member.controller.js";

import { uploadTeamMemberImage } from "../../middlewares/team-member-upload.middleware.js";

import {
    authenticate,
    authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authenticate, authorizeRoles("ADMIN"));

// Create team member
router.post(
    "/",
    uploadTeamMemberImage,
    createTeamMemberController
);

// Get all team members
router.get("/", getAllTeamMembersController);

// Get team member by ID
router.get("/:id", getTeamMemberByIdController);

// Update team member
router.patch(
    "/:id",
    uploadTeamMemberImage,
    updateTeamMemberController
);

// Publish / unpublish
router.patch("/:id/status", updateTeamMemberStatusController);

// Delete team member
router.delete("/:id", deleteTeamMemberController);

export default router;
