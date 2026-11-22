
import { Router } from "express";
import { getAdminDashboard, getMe, login, refresh, register } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected route
router.get("/me", authenticate, getMe);


//Admin route
router.get("/admin/dashboard", authenticate, authorizeRoles("ADMIN"), getAdminDashboard);
export default router;
