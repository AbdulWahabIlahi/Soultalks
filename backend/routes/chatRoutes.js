import express from "express";
import { generatePositivityChat, generateChatResponse } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", generatePositivityChat);
router.post("/", generateChatResponse);

export default router;