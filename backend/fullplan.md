backend/  
├── config/  
│   ├── db.js            # Connects to MongoDB (stores API keys securely)  
│   └── groqConfig.js    # Groq API key and endpoint configuration  
├── controllers/  
│   ├── journalController.js  # Handles journal CRUD operations  
│   ├── aiController.js       # Manages AI analysis requests  
│   └── chatController.js     # Powers the positivity chatbot  
├── models/  
│   └── Journal.js       # Schema for user journals (text, images, AI insights)  
├── routes/  
│   ├── journalRoutes.js # Endpoints for journal submissions/queries  
│   ├── aiRoutes.js      # Endpoints for AI analysis (text/audio/image)  
│   └── chatRoutes.js    # Endpoints for positivity chat interactions  
├── services/  
│   ├── groqService.js   # Core logic for Groq API calls (text/audio/vision)  
│   ├── audioService.js  # Processes audio files (stt + sentiment)  
│   ├── visionService.js # Analyzes images for emotional impact  
│   └── textService.js   # Handles text sentiment/mood detection  
├── utils/  
│   ├── fileUpload.js    # Uploads images/audio to cloud (e.g., AWS S3)  
│   └── errorHandling.js # Custom error middleware  
├── .env                 # Stores secrets (MONGO_URI, GROQ_API_KEY)  
└── server.js            # Initializes Express server and routes  
