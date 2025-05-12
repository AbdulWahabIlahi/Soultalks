import { Groq } from "groq-sdk";  
import dotenv from "dotenv";  

// Ensure environment variables are loaded
dotenv.config();  

// Validate API key is present
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is missing in .env file');
  process.exit(1);
}

console.log('Initializing Groq client with API key...');

// Initialize Groq client with API key and custom base URL (if needed)  
export const groqClient = new Groq({  
  apiKey: process.env.GROQ_API_KEY,  
  baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com", 
});

// Test the configuration by making a simple request
export const testGroqConfig = async () => {
  try {
    const models = await groqClient.models.list();
    console.log('Groq connection successful. Available models:', models.data.map(m => m.id).join(', '));
    return true;
  } catch (error) {
    console.error('Groq connection test failed:', error.message);
    return false;
  }
};  
