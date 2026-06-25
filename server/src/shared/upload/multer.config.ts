import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Use memory storage to keep files in memory (useful for processing before upload to cloud/S3)
const storage = multer.memoryStorage();

// File filter to allow only specific image formats
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Invalid file type. Only PNG, JPEG, JPG, and WEBP images are allowed.'));
  }
};

// Configure and export the multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});
