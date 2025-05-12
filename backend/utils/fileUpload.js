import multer from "multer";  

// Configure Multer to store files in memory (buffers)  
const storage = multer.memoryStorage();  

// File filter (allow only images and audio)  
const fileFilter = (req, file, cb) => {  
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "audio/mpeg", "audio/wav", "audio/webm"];  
  
  if (allowedTypes.includes(file.mimetype)) {  
    cb(null, true);  
  } else {  
    cb(new Error(`Invalid file type. Only JPG, PNG, GIF, MP3, WAV, and WEBM allowed. Got: ${file.mimetype}`), false);  
  }  
};  

// Max file size: 10MB  
const limits = {  
  fileSize: 10 * 1024 * 1024, // 10MB  
};  

// Create and export configured Multer instance  
export const upload = multer({ 
  storage, 
  fileFilter, 
  limits 
});

// Middleware to handle file uploads for journals
export const handleJournalUpload = (req, res, next) => {
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'audio', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    
    // If we have audio files, add them to req.audioFile
    if (req.files && req.files.audio && req.files.audio.length > 0) {
      req.audioFile = req.files.audio[0].buffer;
    }
    
    next();
  });
};  
