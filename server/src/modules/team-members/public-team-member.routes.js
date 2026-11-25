
import express from "express";

import {
    getPublicTeamMembersController,
    getPublicTeamMemberByIdController,
} from "./public-team-member.controller.js";

const router = express.Router();

// Get all published team members
router.get("/", getPublicTeamMembersController);

// Get one published team member by ID
router.get("/:id", getPublicTeamMemberByIdController);

export default router;
