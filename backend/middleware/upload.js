import multer from 'multer';

// Set storage for file uploads
const storage = multer.memoryStorage();

// Create upload middleware for different file types
const fileFilter = (req, file, cb) => {
  // Accept images and audio
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and audio files are allowed.'), false);
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
  },
});

// Middleware to handle image uploads for journals
export const handleImageUpload = upload.single('image');

// Middleware to handle audio uploads for voice calls
export const handleAudioUpload = upload.single('audio');

// Error handler for upload issues
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error occurred during upload
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    // Non-multer error
    return res.status(400).json({ error: err.message });
  }
  next();
}; 