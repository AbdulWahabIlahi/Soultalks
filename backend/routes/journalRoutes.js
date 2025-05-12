import express from "express";
import { createJournal, getAllJournals, getJournalById, getJournalMedia } from "../controllers/journalController.js";
import { handleJournalUpload } from "../utils/fileUpload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", handleJournalUpload, createJournal);

router.get("/", getAllJournals);

router.get("/:id", getJournalById);

router.get("/:id/media/:type/:index?", getJournalMedia);

export default router;