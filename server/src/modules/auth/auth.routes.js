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

import {
  registerLimiter,
  loginLimiter,
  refreshLimiter,
  forgotPasswordLimiter,
  verifyResetOtpLimiter,
  resetPasswordLimiter,
} from "../../middlewares/rate-limit.middleware.js";

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);

router.get("/me", authenticate, getMe);

router.get(
  "/admin/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  getAdminDashboard
);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-otp", verifyResetOtpLimiter, verifyResetOtp);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);



export default router;