import mongoose from "mongoose";  

const journalSchema = new mongoose.Schema({  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  textEntry: {  
    type: String,  
    required: [true, "Text entry is required"],  
  },  
  imageFiles: {  
    type: [Buffer],       // Stores image data as binary buffers  
    default: [],  
  },  
  imageMetadata: {  
    type: [{  
      filename: String,  // Original filename (e.g., "sunset.jpg")  
      mimetype: String,  // MIME type (e.g., "image/jpeg")  
    }],  
    default: [],  
  },
  audioFile: {
    type: Buffer,         // Stores audio data as binary buffer
  },
  audioMetadata: {
    filename: String,    // Original filename
    mimetype: String,    // MIME type (e.g., "audio/mpeg")
  },
  audioAnalysis: {  
    transcription: String,
    mood: String,
    anxietyScore: Number,
  },  
  textAnalysis: {  
    mood: String,  
    anxietyScore: Number,  
  },  
  visionAnalysis: {  
    detectedObjects: [String],  
    emotionalImpact: String,  
  },  
  date: {  
    type: Date,  
    default: Date.now,  
  },  
});  

export default mongoose.model("Journal", journalSchema);  
