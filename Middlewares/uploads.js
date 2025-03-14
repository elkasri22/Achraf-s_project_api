const path = require("path");
const multer = require("multer");
const generateRandomAlphanumeric = require("../utils/generateRandomAlphanumeric");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${generateRandomAlphanumeric(10)}-${file.originalname}`);
  },
});

// Initialize multer with storage and file filter
const uploads = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Validation logic (e.g., file type, size)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only image files are allowed!"), false); // Reject the file
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

module.exports = uploads;
