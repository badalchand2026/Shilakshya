
import { registerSchema } from "./auth.validation.js";
import { loginSchema } from "./auth.validation.js";
import { forgotPasswordSchema } from "./auth.validation.js";


import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "./auth.service.js";


import {
  forgotPassword as forgotPasswordService,
} from "./auth.service.js";

import { verifyResetOtpSchema } from "./auth.validation.js";
import { verifyResetOtp as verifyResetOtpService } from "./auth.service.js";

import { resetPasswordSchema } from "./auth.validation.js";

import { resetPassword as resetPasswordService } from "./auth.service.js";



// register controller
export const register = async (req, res) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Register the user
    const user = await registerUser(validation.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
};


//login controller

export const login = async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Authenticate user
    const result = await loginUser(validation.data);

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    // Return access token and user information
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Something went wrong while logging in",
    });
  }
};


export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: {
      user: req.user,
    },
  });
};


export const getAdminDashboard = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the Admin Dashboard",
    data: {
      user: req.user,
      dashboard: {
        message: "You have access to admin resources",
      },
    },
  });
};


// refresh token rotation

export const refresh = async (req, res) => {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = req.cookies?.refreshToken;

    // Generate new tokens
    const result = await refreshUserToken(refreshToken);

    // Replace old refresh cookie with new refresh cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });

  } catch (error) {
    console.error("Refresh token error:", error.message);

    // Remove invalid or rejected refresh cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Something went wrong while refreshing the token",
    });
  }
};


//Logout


export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Revoke the current refresh token.
    await logoutUser(refreshToken);

    // Clear the refresh token cookie.
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging out",
    });
  }
};




// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const result = await forgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again later.",
    });
  }
};




export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = verifyResetOtpSchema.parse(req.body);

    const result = await verifyResetOtpService(email, otp);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and 6-digit OTP",
      });
    }

    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Verify reset OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP. Please try again later.",
    });
  }
};




export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const result = await resetPasswordService(
      email,
      otp,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email, OTP and password.",
      });
    }

    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reset password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again later.",
    });
  }
};
