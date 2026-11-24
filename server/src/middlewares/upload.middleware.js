
import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Define upload directory
const uploadDirectory = path.resolve("uploads/projects");

// 2. Create directory if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// 3. Configure local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname).toLowerCase();

        cb(null, `project-${uniqueSuffix}${extension}`);
    },
});

// 4. Allow only supported image types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }
};

// 5. Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Maximum 5 MB
    },
});

// 6. Handle upload errors
const uploadSingleProjectImage = upload.single("image");

export const uploadProjectImage = (req, res, next) => {
    uploadSingleProjectImage(req, res, (error) => {
        if (error) {
            let message = error.message || "Image upload failed.";

            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    message = "Image size must not exceed 5 MB.";
                }
            }

            return res.status(400).json({
                success: false,
                message,
            });
        }

        next();
    });
};
