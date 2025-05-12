import { analyzeTextWithGroq } from "./groqService.js";  

export const analyzeText = async (text) => {  
  try {  
    const analysis = await analyzeTextWithGroq(text);  
    return {  
      mood: analysis.mood,  
      anxietyScore: analysis.anxietyScore  
    };  
  } catch (error) {  
    throw new Error("Text analysis failed");  
  }  
};  
