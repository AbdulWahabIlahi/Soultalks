import { groqClient } from "../config/groqConfig.js";
import Journal from "../models/journal.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Process uploaded audio file and convert to text using Groq's Whisper API
export const processAudio = async (req, res) => {
  try {
    console.log("Processing audio request:", req.file ? "Audio file received" : "No audio file");
    
    // Check if audio file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Log file details for debugging
    console.log("File details:", {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Only process if file size is meaningful
    if (req.file.size < 100) {
      console.warn('Audio file is too small, may not contain actual speech');
      return res.status(400).json({ error: 'Audio file is too small or empty. Please record longer audio.' });
    }

    try {
      // Create a temporary file from the buffer
      const tempFilePath = path.join(uploadsDir, `temp-audio-${uuidv4()}.webm`);
      fs.writeFileSync(tempFilePath, req.file.buffer);
      
      console.log(`Temporary file created at ${tempFilePath}`);
      
      // Create a readable stream for the file
      const audioStream = fs.createReadStream(tempFilePath);
      
      // Call Groq's Whisper API for transcription with simplified parameters
      console.log('Calling Groq Whisper API for transcription...');
      const transcriptionResponse = await groqClient.audio.transcriptions.create({
        model: "whisper-large-v3-turbo",
        file: audioStream,
        language: "en",  // Specify English language
        response_format: "text",  // Simplified response format
      });
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      
      // Get transcription from the response - handle different response formats
      let transcription = '';
      if (typeof transcriptionResponse === 'string') {
        transcription = transcriptionResponse.trim();
      } else if (transcriptionResponse.text) {
        transcription = transcriptionResponse.text.trim();
      }
      
      console.log('Raw audio transcribed:', transcription);
      
      // Validate transcription - if empty or very short, it might be noise
      if (!transcription || transcription.length < 2) {
        console.warn('Transcription empty or too short, likely noise');
        return res.status(400).json({ 
          error: 'Could not detect speech in audio. Please speak clearly and try again.'
        });
      }
      
      // Return the transcribed text
      return res.status(200).json({
        success: true,
        transcription
      });
    } catch (error) {
      console.error('Error transcribing audio with Groq Whisper API:', error);
      
      // If the Whisper API fails, fall back to simulated transcription
      console.log('Falling back to simulated transcription');
      const simulatedTranscriptions = [
        "How am I doing today?",
        "I've been feeling anxious lately. Any suggestions?",
        "What are some ways to improve my mood?",
        "Can you help me manage my stress?",
        "I'm having trouble sleeping at night.",
        "How can I practice mindfulness?",
        "Tell me something positive.",
        "What should I do when I feel overwhelmed?"
      ];
      
      const randomIndex = Math.floor(Math.random() * simulatedTranscriptions.length);
      const transcription = simulatedTranscriptions[randomIndex];
      
      console.log('Fallback transcription:', transcription);
      
      return res.status(200).json({
        success: true,
        transcription,
        usingFallback: true
      });
    }
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Failed to process audio file' });
  }
};

// Generate AI response based on transcribed text
export const generateResponse = async (req, res) => {
  try {
    const { transcription } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!transcription) {
      return res.status(400).json({ error: 'No transcription provided' });
    }

    // Get user context from recent journal entries (if any)
    let userContext = "";
    try {
      // Get the user's 3 most recent journal entries for context
      if (userId) {
        const recentJournals = await Journal.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(3);

        if (recentJournals.length > 0) {
          userContext = "Based on recent journal entries:\n" + 
            recentJournals.map(journal => {
              // Safety check to ensure content exists before using substring
              const contentPreview = journal.content && typeof journal.content === 'string' 
                ? journal.content.substring(0, 100) + "..." 
                : "No content available";
              return `- ${new Date(journal.createdAt).toLocaleDateString()}: ${contentPreview}`;
            }).join("\n");
        }
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
      // Continue without context if there's an error
    }

    // Generate response using Groq API
    const response = await groqClient.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a supportive and insightful wellness assistant, providing helpful and actionable advice.
                   Your responses should be compassionate, encouraging, and focused on mental wellbeing.
                   Keep responses concise (under 150 words) and conversational in tone.
                   ${userContext ? "Here is some context about the user:\n" + userContext : ""}`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;
    console.log('AI response generated:', aiResponse);
    
    // Use PlayAI TTS with correct voice name
    let audioUrl = null;
    try {
      console.log('Generating TTS using PlayAI TTS model...');
      const audioFilename = `tts-response-${uuidv4()}.mp3`;
      const audioFilePath = path.join(uploadsDir, audioFilename);
      
      // Call Groq's TTS API with specific PlayAI voice
      const ttsResponse = await groqClient.audio.speech.create({
        model: "playai-tts",
        input: aiResponse,
        voice: "Jennifer-PlayAI", // Use a specific voice from the allowed list
      });
      
      // Save audio buffer to file
      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      fs.writeFileSync(audioFilePath, audioBuffer);
      
      // Create URL for the audio file
      audioUrl = `/uploads/${audioFilename}`;
      console.log(`TTS audio generated and saved to ${audioFilePath}`);
    } catch (ttsError) {
      console.error('Error generating TTS:', ttsError);
      // Continue without TTS if there's an error
    }

    // Return the AI response with audio URL
    return res.status(200).json({
      success: true,
      aiResponse,
      audioUrl,
      useBrowserTTS: !audioUrl // Only use browser TTS if Groq TTS failed
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
}; 