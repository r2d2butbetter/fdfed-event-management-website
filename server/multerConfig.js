import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Ensure the directory exists
const uploadDir = './uploads/events';
if (!fs.existsSync(uploadDir)) {
    console.log('Upload directory does not exist. Creating...');
    fs.mkdirSync(uploadDir, { recursive: true });
  } else {
    console.log('Upload directory exists.');
  }

// Define storage for multer
const storage = multer.diskStorage({
  destination: "./uploads/events",
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueName);  },
});

// Initialize multer
const upload = multer({ storage });
export default upload;
