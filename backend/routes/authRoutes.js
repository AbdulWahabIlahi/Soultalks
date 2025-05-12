import express from "express";
import { 
  register, 
  login, 
  logout,
  getCurrentUser,
  updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);

export default router;