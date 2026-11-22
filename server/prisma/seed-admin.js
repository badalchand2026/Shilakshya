import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const createAdmin = async () => {
  try {
    const fullName = process.env.ADMIN_FULL_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    // Check required environment variables
    if (!fullName || !email || !password) {
      throw new Error("Admin environment variables are missing");
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }

    // Check whether the admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("An account with this admin email already exists.");
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin account
    const admin = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    console.log("Admin account created successfully!");
    console.log(admin);

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();