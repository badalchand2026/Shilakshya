
import { Router } from "express";
import { getMe, login, register } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", register);
router.post("/login", login)

// Protected route
router.get("/me", authenticate, getMe);

export default router;
