import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { globalApiLimiter } from "./middlewares/rate-limit.middleware.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import blogCategoryRoutes from "./modules/blogs/blog-category.routes.js";
import blogAdminRoutes from "./modules/blogs/blog.admin.routes.js";

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
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/blogs/admin", blogAdminRoutes);
app.use("/api/blog-categories/admin", blogCategoryRoutes)

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication server is running successfully!",
    });
});

export default app;