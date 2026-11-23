import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { globalApiLimiter } from "./middlewares/rate-limit.middleware.js";
import contactRoutes from "./modules/contact/contact.routes.js";


const app = express();

// Middleware
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());



app.use("/api", globalApiLimiter);


// Authentication routes
app.use("/api/auth", authRoutes)
app.use("/api/contact", contactRoutes);

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication server is running successfully!",
    });
});

export default app;