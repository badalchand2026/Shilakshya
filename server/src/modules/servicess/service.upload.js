
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads/services");

// Create directory if it does not exist.
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${extension}`;

        cb(null, uniqueName);
    },
});

// Allow only supported image formats.
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error(
            "Only JPEG, PNG, and WebP images are allowed."
        );
        error.statusCode = 400;
        cb(error);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Single service image upload
const multerUpload = upload.single("image");

export const uploadServiceImage = (req, res, next) => {
    multerUpload(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError) {
                error.statusCode = 400;
                error.message =
                    error.code === "LIMIT_FILE_SIZE"
                        ? "Image size cannot exceed 5 MB."
                        : error.message;
            }

            return next(error);
        }

        next();
    });
};

// Delete an uploaded file safely.
export const removeServiceImage = async (imageUrl) => {
    if (!imageUrl) return;

    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadDirectory, filename);

    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Service image deletion error:", error);
        }
    }
};

// Build image URL for database.
export const buildServiceImageUrl = (file) => {
    if (!file) return undefined;

    return `/uploads/services/${file.filename}`;
};
