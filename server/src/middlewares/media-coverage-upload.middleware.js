
import multer from "multer";
import fs from "fs";
import path from "path";

// Local upload directory
const uploadDirectory = path.resolve("uploads/media-coverage");

// Create directory if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Allowed image MIME types and extensions
const allowedMimeTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = allowedMimeTypes[file.mimetype];

        const filename = `media-${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${extension}`;

        cb(null, filename);
    },
});

// Validate uploaded file
const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes[file.mimetype]) {
        return cb(
            new Error("Only JPEG, PNG, and WebP images are allowed.")
        );
    }

    cb(null, true);
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Export upload middleware with error handling
export const uploadMediaCoverageImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            let message = "Image upload failed.";

            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    message = "Image size cannot exceed 5 MB.";
                } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
                    message = "Unexpected file field. Use the field name 'image'.";
                }
            } else {
                message = error.message;
            }

            return res.status(400).json({
                success: false,
                message,
            });
        }

        next();
    });
};
