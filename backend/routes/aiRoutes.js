import express from "express";
import { analyzeTextRoute, analyzeAudioRoute, analyzeImageRoute } from "../controllers/aiController.js";
import { upload } from "../utils/fileUpload.js";

const router = express.Router();

router.post("/text", analyzeTextRoute);

router.post("/audio", upload.single("audio"), analyzeAudioRoute);

router.post("/image", analyzeImageRoute);

export default router;