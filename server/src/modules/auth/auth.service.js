import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { sendEmail } from "../../services/email.service.js";

//register
export const registerUser = async ({ fullName, email, password }) => {
  // Check whether the email is already registered
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Create the user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: "USER",
      },

      // Return only safe user information
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    // Handle a duplicate email if two requests arrive simultaneously
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "An account with this email already exists"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};


//Login

export const loginUser = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Check whether user exists
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 3. Check whether account is active
  if (!user.isActive) {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  // 4. Compare entered password with hashed password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 5. Check JWT secrets
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are not configured");
  }

  // 6. Generate access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    accessSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    }
  );

  // 7. Generate refresh token
  const refreshTokenId = crypto.randomUUID();

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      jti: refreshTokenId,
    },
    refreshSecret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );

  // 8. Hash refresh token before saving it
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // 9. Calculate refresh token expiration
  const decodedToken = jwt.decode(refreshToken);

  const expiresAt = new Date(decodedToken.exp * 1000);

  // 10. Store hashed refresh token in PostgreSQL
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  // 11. Return safe user data and tokens
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
};


//refresh token

export const refreshUserToken = async (refreshToken) => {
  // 1. Check refresh token
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify refresh token
  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    const authError = new Error("Invalid or expired refresh token");
    authError.statusCode = 401;
    throw authError;
  }

  // 3. Validate token payload
  if (!decoded.sub || !decoded.jti) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  // 4. Hash the refresh token
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // 5. Find refresh token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken) {
    const error = new Error("Refresh token not found");
    error.statusCode = 401;
    throw error;
  }

  // 6. Check whether token belongs to the user in the JWT
  if (storedToken.userId !== decoded.sub) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  // 7. Detect reuse of an already-revoked token
  if (storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const error = new Error(
      "Refresh token reuse detected. Please log in again."
    );
    error.statusCode = 401;
    throw error;
  }

  // 8. Check database expiration
  const now = new Date();

  if (storedToken.expiresAt <= now) {
    await prisma.refreshToken.updateMany({
      where: {
        id: storedToken.id,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    const error = new Error("Refresh token has expired");
    error.statusCode = 401;
    throw error;
  }

  // 9. Check current user
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.sub,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    const error = new Error("User account is unavailable");
    error.statusCode = 401;
    throw error;
  }

  // 10. Generate new access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    }
  );

  // 11. Generate new refresh token
  const newRefreshTokenId = crypto.randomUUID();

  const newRefreshToken = jwt.sign(
    {
      sub: user.id,
      jti: newRefreshTokenId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );

  // 12. Hash the new refresh token
  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const newDecodedToken = jwt.decode(newRefreshToken);
  const newExpiresAt = new Date(newDecodedToken.exp * 1000);

  // 13. Atomically revoke old token and save new token
  const rotationResult = await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: {
        id: storedToken.id,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        revokedAt: now,
      },
    });

    // Another request may have already rotated this token
    if (revoked.count !== 1) {
      return false;
    }

    await tx.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt: newExpiresAt,
      },
    });

    return true;
  });

  if (!rotationResult) {
    // Reuse detected: revoke all remaining active refresh tokens
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const error = new Error(
      "Refresh token reuse detected. Please log in again."
    );
    error.statusCode = 401;
    throw error;
  }

  // 14. Return new tokens and safe user information
  return {
    accessToken,
    refreshToken: newRefreshToken,
    user,
  };
};



//logout

export const logoutUser = async (refreshToken) => {
  // If no refresh token exists, there is nothing to revoke.
  if (!refreshToken) {
    return;
  }

  // Generate the SHA-256 hash of the refresh token.
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Revoke the matching refresh token in the database.
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};




// send email


export const forgotPassword = async (email) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Do not reveal whether an email is registered
  if (!user || !user.isActive) {
    return {
      message: "If an account exists with this email, an OTP will be sent.",
    };
  }

  // Generate a secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Hash OTP before storing it
  const otpHash = await bcrypt.hash(otp, 10);

  // OTP expires after 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate previous unused OTPs
  await prisma.passwordResetOtp.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Store hashed OTP
  await prisma.passwordResetOtp.create({
    data: {
      otpHash,
      userId: user.id,
      expiresAt,
    },
  });

  // Send OTP to user's email
  await sendEmail({
    to: user.email,
    subject: "Shilakshya - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your password reset OTP is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  return {
    message: "If an account exists with this email, an OTP will be sent.",
  };
};





export const verifyResetOtp = async (email, otp) => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid or expired OTP");
  }

  // Find the latest OTP for this user
  const resetOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetOtp) {
    throw new Error("Invalid or expired OTP");
  }

  // Check OTP expiration
  if (resetOtp.expiresAt < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  // Compare submitted OTP with stored hash
  const isOtpValid = await bcrypt.compare(
    otp,
    resetOtp.otpHash
  );

  if (!isOtpValid) {
    throw new Error("Invalid or expired OTP");
  }

  return {
    message: "OTP verified successfully",
  };
};





export const resetPassword = async (email, otp, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid or expired OTP");
  }

  // Find the latest unused OTP
  const resetOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetOtp || resetOtp.expiresAt <= new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  // Verify the OTP again
  const isOtpValid = await bcrypt.compare(
    otp,
    resetOtp.otpHash
  );

  if (!isOtpValid) {
    throw new Error("Invalid or expired OTP");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password, consume OTP and revoke sessions atomically
  await prisma.$transaction(async (tx) => {
    const consumedOtp = await tx.passwordResetOtp.updateMany({
      where: {
        id: resetOtp.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumedOtp.count !== 1) {
      throw new Error("Invalid or expired OTP");
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    await tx.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });

  return {
    message: "Password reset successfully. Please log in again.",
  };
};



//Update Profile
export const updateUserProfile = async (userId, fullName) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      fullName,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};