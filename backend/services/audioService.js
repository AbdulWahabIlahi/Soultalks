import { transcribeAudioWithGroq } from "./groqService.js";  
import { analyzeText } from "./textService.js";  

export const transcribeAudio = async (audioBuffer) => {  
  try {  
    // Transcribe audio to text  
    const transcription = await transcribeAudioWithGroq(audioBuffer);  

    // Analyze transcribed text for sentiment  
    const textAnalysis = await analyzeText(transcription);  

    return {  
      transcription,  
      ...textAnalysis  
    };  
  } catch (error) {  
    throw new Error("Audio processing failed");  
  }  
};  
