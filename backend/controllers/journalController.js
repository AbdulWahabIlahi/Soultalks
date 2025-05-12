import Journal from "../models/journal.js";  
import { groqClient } from "../config/groqConfig.js";  
import { analyzeText } from "../services/textService.js";  
import { transcribeAudio } from "../services/audioService.js";  
import { analyzeImage } from "../services/visionService.js";
import { compressAudio } from "../utils/audioProcessor.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE a new journal entry  
export const createJournal = async (req, res) => {  
  try {  
    console.log('Creating journal entry:', req.body);
    console.log('Files:', req.files || 'No files');
    
    const { textEntry } = req.body;
    
    if (!textEntry) {
      return res.status(400).json({ error: "Text entry is required" });
    }
    
    // Handle image files
    let imageUrls = [];
    let imageFiles = [];
    let imageMetadata = [];
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log('Processing uploaded image files');
      req.files.images.forEach(file => {
        imageFiles.push(file.buffer);
        imageMetadata.push({
          filename: file.originalname,
          mimetype: file.mimetype
        });
        
        // Create data URL from buffer for vision analysis
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        imageUrls.push(dataUrl);
      });
    }

    // Handle audio file
    let audioFile = null;
    let audioMetadata = null;
    let compressedAudioBuffer = null;

    if (req.files && req.files.audio && req.files.audio.length > 0) {
      const file = req.files.audio[0];
      audioFile = file.buffer;
      audioMetadata = {
        filename: file.originalname,
        mimetype: file.mimetype
      };
      
      // Compress audio for API processing if needed
      if (audioFile.length > 1000000) { // Over 1MB
        try {
          compressedAudioBuffer = await compressAudio(audioFile, file.mimetype);
        } catch (err) {
          console.error('Audio compression error:', err);
          // Continue with original file, but it might fail with Groq API
        }
      } else {
        compressedAudioBuffer = audioFile;
      }
    }

    // Save raw data to database  
    const newJournal = new Journal({ 
      user: req.user.id, // Associate with logged in user
      textEntry, 
      imageFiles,
      imageMetadata,
      audioFile,
      audioMetadata
    });  
    await newJournal.save();  

    console.log('Journal saved, analyzing with AI');
    
    // Trigger AI analysis (parallel processing)  
    const [textAnalysis, audioAnalysis, visionAnalysis] = await Promise.all([  
      analyzeText(textEntry),  
      compressedAudioBuffer ? transcribeAudio(compressedAudioBuffer) : null,  
      imageUrls.length > 0 ? analyzeImage(imageUrls[0]) : null  
    ]);  

    // Update journal with AI insights  
    newJournal.textAnalysis = textAnalysis;  
    newJournal.audioAnalysis = audioAnalysis;  
    newJournal.visionAnalysis = visionAnalysis;  
    await newJournal.save();  

    res.status(201).json(newJournal);  
  } catch (error) {  
    console.error("Failed to create journal:", error);
    res.status(500).json({ error: "Failed to create journal", details: error.message });  
  }  
};  

// GET all journals for a user  
export const getAllJournals = async (req, res) => {  
  try {  
    // Only get journals for the current user
    const journals = await Journal.find({ user: req.user.id }).sort({ date: -1 });  
    res.status(200).json(journals);  
  } catch (error) {  
    res.status(500).json({ error: "Failed to fetch journals" });  
  }  
};  

// GET a single journal by ID  
export const getJournalById = async (req, res) => {  
  try {  
    const journal = await Journal.findById(req.params.id);  
    
    // Check if journal exists
    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }
    
    // Check if journal belongs to user
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to access this journal" });
    }
    
    res.status(200).json(journal);  
  } catch (error) {  
    res.status(404).json({ error: "Journal not found" });  
  }  
};

// GET media files (audio/images) from a journal
export const getJournalMedia = async (req, res) => {
  try {
    const { id, type, index } = req.params;
    
    const journal = await Journal.findById(id);
    
    // Check if journal exists
    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }
    
    // Check if journal belongs to user
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to access this journal" });
    }

    // Handle audio file
    if (type === 'audio') {
      if (!journal.audioFile) {
        return res.status(404).json({ error: "No audio file found" });
      }
      
      const mimetype = journal.audioMetadata?.mimetype || 'audio/mpeg';
      res.set('Content-Type', mimetype);
      return res.send(journal.audioFile);
    }
    
    // Handle image file
    if (type === 'image') {
      const imageIndex = parseInt(index) || 0;
      
      if (!journal.imageFiles || journal.imageFiles.length === 0 || !journal.imageFiles[imageIndex]) {
        return res.status(404).json({ error: "No image file found" });
      }
      
      const mimetype = journal.imageMetadata[imageIndex]?.mimetype || 'image/jpeg';
      res.set('Content-Type', mimetype);
      return res.send(journal.imageFiles[imageIndex]);
    }
    
    return res.status(400).json({ error: "Invalid media type" });
  } catch (error) {
    console.error("Failed to fetch journal media:", error);
    res.status(500).json({ error: "Failed to fetch journal media" });
  }
};  
