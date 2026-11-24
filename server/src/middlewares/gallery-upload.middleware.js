
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads", "gallery");

// Create gallery directory automatically
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName = `gallery-${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${extension}`;

        cb(null, uniqueName);
    },
});

// Validate image type
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    const error = new Error(
        "Only JPEG, PNG, and WebP images are allowed."
    );

    error.statusCode = 400;

    return cb(error);
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
});

// Export upload middleware
export const uploadGalleryImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            let message = error.message || "Image upload failed.";

            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    message = "Image size must not exceed 5 MB.";
                } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
                    message = "Unexpected file field. Use the field name 'image'.";
                }
            }

            return res.status(error.statusCode || 400).json({
                success: false,
                message,
            });
        }

        next();
    });
};
