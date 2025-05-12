import multer from "multer";

// Custom error class for operational errors  
export class AppError extends Error {  
  constructor(message, statusCode) {  
    super(message);  
    this.statusCode = statusCode;  
    this.isOperational = true;  
  }  
}  

// Error-handling middleware  
export const errorHandler = (err, req, res, next) => {  
  // Default error values  
  err.statusCode = err.statusCode || 500;  
  err.message = err.message || "Internal Server Error";  

  // Handle specific operational errors  
  if (err instanceof AppError) {  
    return res.status(err.statusCode).json({  
      error: err.message,  
    });  
  }  

  // Handle Multer file upload errors  
  if (err instanceof multer.MulterError) {  
    return res.status(400).json({  
      error: `File upload error: ${err.message}`,  
    });  
  }  

  // Handle unexpected errors (log and respond generically)  
  console.error("UNHANDLED ERROR:", err);  
  res.status(500).json({  
    error: "Something went wrong. Please try again later.",  
  });  
};  
