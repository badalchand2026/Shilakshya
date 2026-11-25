
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
import projectCategoryRoutes from "./modules/project-categories/project-category.routes.js";
import path from "path";
import projectAdminRoutes from "./modules/projects/project.routes.js";
import publicProjectRoutes from "./modules/public-projects/public-project.routes.js";
import publicProjectCategoryRoutes from "./modules/public-project-categories/public-project-category.routes.js";
import galleryCategoryRoutes from "./modules/gallery-categories/gallery-category.routes.js";
import galleryRoutes from "./modules/gallery/gallery.routes.js";
import publicGalleryRoutes from "./modules/public-gallery/public-gallery.routes.js";
import mediaCoverageRoutes from "./modules/media-coverage/media-coverage.routes.js";
import publicMediaCoverageRoutes from "./modules/public-media-coverage/public-media-coverage.routes.js";
import teamMemberRoutes from "./modules/team-members/team-member.routes.js";
import publicTeamMemberRoutes from "./modules/team-members/public-team-member.routes.js";
import testimonialRoutes from "./modules/testimonials/testimonial.routes.js";
import publicTestimonialRoutes from "./modules/testimonials/public-testimonial.routes.js";

import serviceRoutes from "./modules/servicess/service.routes.js";
import publicServiceRoutes from "./modules/servicess/public-service.routes.js";



const app = express();

// Serve uploaded files
const uploadsPath = path.resolve("uploads");

app.use("/uploads", express.static(uploadsPath));


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

// Project category routes
app.use("/api/project-categories/admin", projectCategoryRoutes);

// Project Management Routes
app.use("/api/projects/admin", projectAdminRoutes);
app.use("/api/projects", publicProjectRoutes);
app.use("/api/project-categories", publicProjectCategoryRoutes);
app.use("/api/gallery-categories/admin", galleryCategoryRoutes);
app.use("/api/gallery/admin", galleryRoutes);

app.use("/api/gallery", publicGalleryRoutes);
app.use("/api/media-coverage/admin", mediaCoverageRoutes);
app.use("/api/media-coverage", publicMediaCoverageRoutes);
app.use("/api/team-members/admin", teamMemberRoutes);
app.use("/api/team-members", publicTeamMemberRoutes);
app.use("/api/testimonials/admin", testimonialRoutes);
app.use("/api/testimonials", publicTestimonialRoutes);

// Admin Services
app.use("/api/servicess/admin", serviceRoutes);

// Public Services
app.use("/api/servicess", publicServiceRoutes);

// Health Check
app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Shilakshya backend is running successfully!",
    });
});

// Global Error Handling Middleware
app.use((error, req, res, next) => {
    // If response has already been sent, pass error to Express
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;

    // Log unexpected server errors
    if (statusCode >= 500) {
        console.error("Global Error:", error);
    }

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Internal server error."
                : error.message || "Something went wrong.",
    });
});

export default app;