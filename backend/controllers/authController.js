import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandling.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profileImage');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Send token as cookie and response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  // Remove password from output
  user.password = undefined;

  // Send cookie and response
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        user
      }
    });
};

// REGISTER - POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: "User with that email or username already exists" 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Registration failed" 
    });
  }
};

// LOGIN - POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide email and password" 
      });
    }

    // Check if user exists & password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Login failed" 
    });
  }
};

// LOGOUT - GET /api/auth/logout
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// GET CURRENT USER - GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get current user" 
    });
  }
};

// UPDATE PROFILE - PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  // Create multer upload handler
  const uploadHandler = (req, res) => {
    return new Promise((resolve, reject) => {
      upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          reject({ status: 400, message: `Upload error: ${err.message}` });
        } else if (err) {
          // An unknown error occurred
          reject({ status: 500, message: `Unknown error: ${err.message}` });
        }
        // Everything went fine
        resolve();
      });
    });
  };

  try {
    // Handle file upload
    await uploadHandler(req, res);
    
    // Fields to update
    const updateFields = {};
    
    // Check username
    if (req.body.username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: req.body.username,
        _id: { $ne: req.user.id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username is already taken"
        });
      }
      
      updateFields.username = req.body.username;
    }
    
    // Handle profile image if uploaded
    if (req.file) {
      updateFields.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    
    // Return updated user
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    const status = error.status || 500;
    const message = error.message || "Failed to update profile";
    
    res.status(status).json({
      success: false,
      error: message
    });
  }
}; 