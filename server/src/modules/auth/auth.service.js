
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";



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