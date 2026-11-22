import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  getMe,
  getAdminDashboard,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateProfile,
  changePassword,
} from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, getMe);

router.get(
  "/admin/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  getAdminDashboard
);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);



export default router;