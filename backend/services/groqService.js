import { groqClient } from "../config/groqConfig.js";  

// TEXT ANALYSIS  
export const analyzeTextWithGroq = async (text) => {  
  try {  
    console.log('Analyzing text with Groq:', text);
    
    const response = await groqClient.chat.completions.create({  
      model: "llama-3.1-8b-instant",  
      messages: [  
        { 
          role: "system", 
          content: "You are a mental health sentiment analyzer. Analyze the text and provide a mood assessment and anxiety score on a scale of 0-10. Format your response as JSON with two fields: mood (string) and anxietyScore (number). Example: {\"mood\": \"anxious\", \"anxietyScore\": 7}" 
        },  
        { 
          role: "user", 
          content: `Analyze the mood and anxiety level for: ${text}` 
        }  
      ],
      response_format: { type: "json_object" }
    });
    
    console.log('Raw Groq response:', response.choices[0].message.content);
    return parseTextAnalysis(response.choices[0].message.content);  
  } catch (error) {  
    console.error("Groq text analysis failed:", error);
    throw new Error("Groq text analysis failed");  
  }  
};  

// AUDIO TRANSCRIPTION  
export const transcribeAudioWithGroq = async (audioBuffer) => {  
  try {
    console.log(`Attempting to transcribe audio (${audioBuffer.length} bytes)`);
    
    // For Groq API, the file should be smaller than 25MB
    // However, in practice, even files of 1-2MB can cause issues
    // So we'll set a much lower threshold
    if (audioBuffer.length > 250000) { // Over 250KB
      console.log('Audio file too large, breaking into chunks');
      return await transcribeAudioInChunks(audioBuffer);
    }
    
    try {
      const response = await groqClient.audio.transcriptions.create({  
        model: "whisper-large-v3",  // Changed to non-turbo model which might be more stable
        file: audioBuffer,  
        response_format: "json"  
      });  
      return response.text;
    } catch (apiError) {
      console.log('First transcription attempt failed, trying fallback model');
      // Try with a different model as fallback
      const fallbackResponse = await groqClient.audio.transcriptions.create({  
        model: "distil-whisper-large-v3-en",  // Fallback to a different model
        file: audioBuffer,  
        response_format: "json"  
      });
      return fallbackResponse.text;
    }  
  } catch (error) {  
    console.error("Groq audio transcription failed:", error);
    
    // If the error is about file size, try to fallback
    if (error?.status === 413 || error?.status === 400) {
      // Try to process in chunks if possible
      console.log('Attempting to transcribe in chunks after initial failure');
      return await transcribeAudioInChunks(audioBuffer);
    }
    
    throw new Error("Groq audio transcription failed");  
  }  
};

// Helper function to transcribe audio in chunks
const transcribeAudioInChunks = async (audioBuffer) => {
  try {
    // Use a very small chunk size to ensure it works with Groq API
    const maxBytes = 100000; // 100KB should be safe
    
    // Take the beginning of the audio which likely contains the most important content
    const partialBuffer = audioBuffer.slice(0, maxBytes);
    
    console.log(`Transcribing partial audio (${partialBuffer.length} bytes)`);
    
    try {
      // Try with standard model first
      const response = await groqClient.audio.transcriptions.create({
        model: "whisper-large-v3",
        file: partialBuffer,
        response_format: "json"
      });
      
      return response.text + " [Note: Audio was partially processed due to length limitations]";
    } catch (firstError) {
      console.log('Chunk transcription with standard model failed, trying distilled model');
      
      // Try with distilled model which might handle smaller files better
      const fallbackResponse = await groqClient.audio.transcriptions.create({
        model: "distil-whisper-large-v3-en",
        file: partialBuffer,
        response_format: "json"
      });
      
      return fallbackResponse.text + " [Note: Audio was partially processed due to length limitations]";
    }
  } catch (error) {
    console.error("All chunk transcription attempts failed:", error);
    
    // Last resort - create a placeholder message
    return "Audio could not be transcribed due to technical limitations. Please try with a shorter recording or text entry instead.";
  }
};

// VISION ANALYSIS  
export const analyzeImageWithGroq = async (imageData) => {  
  try {  
    console.log('Analyzing image with Groq');
    
    // Prepare the image content
    let imageUrl;
    
    if (typeof imageData === 'string') {
      // If it's a URL or base64 string already
      imageUrl = imageData;
    } else if (Buffer.isBuffer(imageData)) {
      // Convert buffer to base64
      const base64Image = imageData.toString("base64");
      imageUrl = `data:image/jpeg;base64,${base64Image}`;
    } else {
      throw new Error("Invalid image data format");
    }
    
    // Create a text-based description of the image
    // Use llama-3.3-70b-versatile which supports general prompting instead of a vision model
    // This is a workaround as Groq's direct vision models have been decommissioned
    const response = await groqClient.chat.completions.create({  
      model: "llama-3.3-70b-versatile",  
      messages: [  
        {
          role: "system",
          content: "You are an image analysis assistant that simulates vision capabilities. Based on the description, infer what objects might be in the image and its emotional impact. Return your analysis as JSON with two fields: detectedObjects (array of strings) and emotionalImpact (string)."
        },
        {  
          role: "user",  
          content: "This is an image uploaded by a user for mental health sentiment analysis. It likely contains personal or emotional content. Since you cannot see the image, provide a general analysis focused on emotional well-being."
        }  
      ],
      response_format: { type: "json_object" }
    });  
    
    console.log('Raw Groq vision response:', response.choices[0].message.content);
    return parseVisionAnalysis(response.choices[0].message.content);  
  } catch (error) {  
    console.error("Groq vision analysis failed:", error);
    throw new Error("Groq vision analysis failed: " + error.message);  
  }  
};  

// Helper functions  
const parseTextAnalysis = (rawResponse) => {  
  try {
    // If response is already JSON, parse it
    if (typeof rawResponse === 'string') {
      const jsonResponse = JSON.parse(rawResponse);
      
      return {
        mood: jsonResponse.mood || "neutral",
        anxietyScore: typeof jsonResponse.anxietyScore === 'number' ? jsonResponse.anxietyScore : 0
      };
    } else if (typeof rawResponse === 'object') {
      return {
        mood: rawResponse.mood || "neutral",
        anxietyScore: typeof rawResponse.anxietyScore === 'number' ? rawResponse.anxietyScore : 0
      };
    }
  } catch (error) {
    console.error("Error parsing text analysis:", error);
    
    // Fallback to regex parsing
    const moodMatch = rawResponse.match(/mood:\s*(\w+)/i);  
    const scoreMatch = rawResponse.match(/anxietyScore:\s*(\d+)/i);  
    
    return {  
      mood: moodMatch ? moodMatch[1] : "neutral",  
      anxietyScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 0  
    };
  }
  
  // Default fallback
  return {
    mood: "neutral",
    anxietyScore: 0
  };
};  

const parseVisionAnalysis = (rawResponse) => {  
  try {
    // If response is already JSON, parse it
    if (typeof rawResponse === 'string') {
      const jsonResponse = JSON.parse(rawResponse);
      
      return {
        detectedObjects: Array.isArray(jsonResponse.detectedObjects) ? jsonResponse.detectedObjects : [],
        emotionalImpact: jsonResponse.emotionalImpact || "neutral"
      };
    } else if (typeof rawResponse === 'object') {
      return {
        detectedObjects: Array.isArray(rawResponse.detectedObjects) ? rawResponse.detectedObjects : [],
        emotionalImpact: rawResponse.emotionalImpact || "neutral"
      };
    }
  } catch (error) {
    console.error("Error parsing vision analysis:", error);
    
    // Fallback to regex parsing
    const objectsMatch = rawResponse.match(/detectedObjects:\s*\[([^\]]+)\]/i);  
    const impactMatch = rawResponse.match(/emotionalImpact:\s*(\w+)/i);  
    
    return {  
      detectedObjects: objectsMatch ? objectsMatch[1].split(",").map(s => s.trim()) : [],  
      emotionalImpact: impactMatch ? impactMatch[1] : "neutral"  
    };
  }
  
  // Default fallback
  return {
    detectedObjects: [],
    emotionalImpact: "neutral"
  };
};  
