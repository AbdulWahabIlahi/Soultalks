import { analyzeImageWithGroq } from "./groqService.js";  

export const analyzeImage = async (imageData) => {  
  try {  
    // Pass imageData as is to the Groq service
    // It might be a Buffer, URL string, or base64 string
    const analysis = await analyzeImageWithGroq(imageData);  
    return {  
      detectedObjects: analysis.detectedObjects || [],  
      emotionalImpact: analysis.emotionalImpact || "neutral"  
    };  
  } catch (error) {  
    console.error("Image analysis failed:", error);
    // Return default values on error
    return {
      detectedObjects: [],
      emotionalImpact: "neutral"
    };
  }  
};  
