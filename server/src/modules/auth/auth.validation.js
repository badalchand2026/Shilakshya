
import { email, z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password is too long"
    ),
});


export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address").max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});



// forgot password

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
});



//verify otp

export const verifyResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  otp: z
    .string()
    .length(6, "OTP must contain exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});


//reset password

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  otp: z
    .string()
    .length(6, "OTP must contain exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
});



//Update Profile

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
});