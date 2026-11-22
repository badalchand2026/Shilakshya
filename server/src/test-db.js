
import dotenv from "dotenv";
dotenv.config();

import prisma from "./config/prisma.js";

const testDatabaseConnection = async () => {
    try {
        await prisma.$connect();

        console.log("PostgreSQL connected successfully!");
        console.log("Database: shilakshya");

    } catch (error) {
        console.error("Database connection failed:", error.message);

    } finally {
        await prisma.$disconnect();
    }
};

testDatabaseConnection();
