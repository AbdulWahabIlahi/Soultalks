import Journal from "../models/journal.js";  
import { groqClient } from "../config/groqConfig.js";
import { logError } from "../utils/logger.js";

// GET /api/positivity-chat  
export const generatePositivityChat = async (req, res) => {  
  try {  
    console.log('Generating positivity chat response...');
    
    // Fetch user history  
    const journals = await Journal.find().sort({ date: -1 }).limit(7); // Last 7 days
    console.log(`Found ${journals.length} journal entries for prompt generation`);

    // Generate prompt for Groq  
    const prompt = `  
      User's recent journals: ${journals.map(j => j.textEntry).join("; ")}  
      
      The user is chatting with you. Respond in a natural, conversational way like a good friend would.
      
      Guidelines:
      - Keep responses concise and natural - like texting with a friend
      - Don't be overly enthusiastic or motivational unless the user is specifically seeking encouragement
      - Respond appropriately to casual greetings with simple friendly responses (e.g., "Hey there!" or "Hi, how's it going?")
      - Only reference the journal entries if the user asks something related to their past entries or feelings
      - Use a casual, friendly tone but maintain emotional intelligence
      - Avoid generic, preachy or overly positive responses
      - Respond as you would in a real human conversation - with warmth but authenticity
      - Don't introduce yourself in every message or explain that you're an AI
    `;  

    console.log('Calling Groq API...');
    // Call Groq's LLM  
    const chatResponse = await groqClient.chat.completions.create({  
      model: "llama-3.1-8b-instant",  
      messages: [  
        { role: "system", content: "You are a supportive friend having a natural conversation. You speak casually but thoughtfully, like a real person. You don't overdo positivity or motivation unless specifically asked. You're genuine, warm, and authentic." },  
        { role: "user", content: prompt }  
      ]  
    });  

    console.log('Successfully received response from Groq');
    res.status(200).json({ message: chatResponse.choices[0].message.content });  
  } catch (error) {  
    console.error('Chat generation failed:', error);
    logError(error);
    res.status(500).json({ 
      error: "Chat generation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });  
  }  
};

// POST /api/positivity-chat - Chat with conversation history
export const generateChatResponse = async (req, res) => {
  try {
    console.log('Generating chat response with conversation history...');
    
    // Get conversation history from request
    const { conversationHistory } = req.body;
    
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'Invalid conversation history' });
    }
    
    console.log(`Received ${conversationHistory.length} messages in conversation history`);
    
    // Fetch user journals for context
    const journals = await Journal.find().sort({ date: -1 }).limit(7);
    console.log(`Found ${journals.length} journal entries for context`);
    
    // Create messages array with system prompt and conversation history
    const messages = [
      { 
        role: "system", 
        content: `You are a supportive friend having a natural conversation. You speak casually but thoughtfully, like a real person. You don't overdo positivity or motivation unless specifically asked. You're genuine, warm, and authentic.
        
        The user has these recent journal entries that might provide context about how they're feeling:
        ${journals.map(j => j.textEntry).join("; ")}
        
        Guidelines:
        - Keep responses concise and natural - like texting with a friend
        - Don't be overly enthusiastic or motivational unless specifically asked
        - Use a casual, friendly tone but maintain emotional intelligence
        - Avoid generic, preachy or overly positive responses
        - Don't introduce yourself in every message
        - Only reference journal entries if directly relevant to the conversation
        - Always maintain the context of the ongoing conversation`
      },
      ...conversationHistory
    ];
    
    console.log('Calling Groq API with conversation history...');
    
    // Call Groq's LLM with the full conversation history
    const chatResponse = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages
    });
    
    console.log('Successfully received response from Groq');
    res.status(200).json({ message: chatResponse.choices[0].message.content });
  } catch (error) {
    console.error('Chat generation failed:', error);
    logError(error);
    res.status(500).json({
      error: "Chat generation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};  
