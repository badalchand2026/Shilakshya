
import { registerSchema } from "./auth.validation.js";
import { registerUser } from "./auth.service.js";
import { loginSchema } from "./auth.validation.js";
import { loginUser } from "./auth.service.js";


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