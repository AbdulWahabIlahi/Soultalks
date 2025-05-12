import { groqClient } from "../config/groqConfig.js";  
import { analyzeText } from "../services/textService.js";  
import { transcribeAudio } from "../services/audioService.js";  
import { analyzeImage } from "../services/visionService.js";
import { logError } from "../utils/logger.js";

// POST /api/ai/text  
export const analyzeTextRoute = async (req, res) => {  
  try {  
    console.log('Text analysis request received:', req.body);
    const { text } = req.body;  
    
    if (!text) {
      return res.status(400).json({ error: "Text input is required" });
    }
    
    console.log('Analyzing text with Groq...');
    const analysis = await analyzeText(text);
    console.log('Analysis result:', analysis);
    
    res.status(200).json(analysis);  
  } catch (error) {  
    console.error('Text analysis failed:', error);
    logError(error);
    res.status(500).json({ 
      error: "Text analysis failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });  
  }  
};  

// POST /api/ai/audio  
export const analyzeAudioRoute = async (req, res) => {  
  try {  
    console.log('Audio analysis request received');
    const audioBuffer = req.file?.buffer;
    
    if (!audioBuffer) {
      return res.status(400).json({ error: "Audio file is required" });
    }
    
    console.log('Transcribing audio with Groq...');
    const transcription = await transcribeAudio(audioBuffer);  
    console.log('Transcription complete');
    
    res.status(200).json({ transcription });  
  } catch (error) {  
    console.error('Audio analysis failed:', error);
    logError(error);
    res.status(500).json({ 
      error: "Audio analysis failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });  
  }  
};  

// POST /api/ai/image  
export const analyzeImageRoute = async (req, res) => {  
  try {  
    console.log('Image analysis request received:', req.body);
    const imageUrl = req.body.imageUrl;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }
    
    console.log('Analyzing image with Groq...');
    const analysis = await analyzeImage(imageUrl);  
    console.log('Analysis result:', analysis);
    
    res.status(200).json(analysis);  
  } catch (error) {  
    console.error('Image analysis failed:', error);
    logError(error);
    res.status(500).json({ 
      error: "Image analysis failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });  
  }  
};  
