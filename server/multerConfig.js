import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { errorResponse } from './utils/responseHelpers.js';

// Ensure the directory exists
const uploadDir = './uploads/events';
if (!fs.existsSync(uploadDir)) {
  console.log('Upload directory does not exist. Creating...');
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log('Upload directory exists.');
}

// File filter for React frontend - only allow images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Define storage for multer
const storage = multer.diskStorage({
  destination: "./uploads/events",
  filename: function (req, file, cb) {
    // Sanitize filename for React frontend compatibility
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizedName}`;
    cb(null, uniqueName);
  },
});

// Enhanced multer configuration for React frontend
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files per request
    fieldSize: 2 * 1024 * 1024, // 2MB for text fields
  }
});

// Error handling middleware for file uploads
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Upload error occurred';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 5 files allowed.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too large.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name for file upload.';
        break;
      default:
        message = `Upload error: ${err.message}`;
    }

    return errorResponse(res, message, 400);
  } else if (err) {
    return errorResponse(res, err.message, 400);
  }
  next();
};

// Specific upload configurations for different use cases
export const eventImageUpload = upload.single('eventImage');
export const multipleEventImagesUpload = upload.array('eventImages', 5);
export const profileImageUpload = upload.single('profileImage');

// Field-specific uploads for forms with mixed content
export const eventFormUpload = upload.fields([
  { name: 'eventImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 }
]);

export default upload;
