const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join("uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter for accepting only .pdf and .txt files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "text/plain"];
    const allowedExtensions = [".pdf", ".txt"];

    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error("Only .pdf and .txt files are allowed!"), false);
    }
};


const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
