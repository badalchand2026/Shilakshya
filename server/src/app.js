
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middlewares
import { globalApiLimiter } from "./middlewares/rate-limit.middleware.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

import blogCategoryRoutes from "./modules/blog-categories/blog-category.routes.js";
import blogAdminRoutes from "./modules/blogs/blog.admin.routes.js";
import blogTagRoutes from "./modules/blog-tags/blog-tag.routes.js";
import publicBlogRoutes from "./modules/public-blogs/public-blog.routes.js";

const app = express();


// Global Middlewares


app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());

// Apply rate limiting to all API routes
app.use("/api", globalApiLimiter);


// Authentication Routes


app.use("/api/auth", authRoutes);


// Contact Routes


app.use("/api/contact", contactRoutes);


// User Management Routes

app.use("/api/users", usersRoutes);


// Blog Management Routes


// Admin blog routes
app.use("/api/blogs/admin", blogAdminRoutes);

// Public blog routes
app.use("/api/blogs", publicBlogRoutes);

// Blog category routes
app.use("/api/blog-categories/admin", blogCategoryRoutes);

// Blog tag routes
app.use("/api/blog-tags/admin", blogTagRoutes);

// Health Check
app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Shilakshya backend is running successfully!",
    });
});

export default app;
