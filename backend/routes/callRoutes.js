import express from "express";
import { handleAudioUpload, uploadErrorHandler } from "../middleware/upload.js";
import { processAudio, generateResponse } from "../controllers/callController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/process", handleAudioUpload, uploadErrorHandler, processAudio);

router.post("/response", generateResponse);

router.post('/process-audio', handleAudioUpload, processAudio);

router.post('/generate-response', generateResponse);

export default router;