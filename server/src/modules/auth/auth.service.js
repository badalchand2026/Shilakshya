
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";

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
