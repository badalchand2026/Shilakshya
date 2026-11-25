
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads/team-members");

// Create directory automatically if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName = `team-${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname).toLowerCase()}`;

        cb(null, uniqueName);
    },
});

// Accept only supported image formats
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only JPG, JPEG, PNG and WebP images are allowed."),
            false
        );
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Single profile image upload
export const uploadTeamMemberImage = upload.single("image");
