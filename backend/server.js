import express from "express";  
import dotenv from "dotenv";  
import cors from "cors";  
import helmet from "helmet";  
import morgan from "morgan";  
import rateLimit from "express-rate-limit";  
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandling.js";  
import { logger } from "./utils/logger.js";  
import connectDB from "./config/db.js";
import { testGroqConfig } from "./config/groqConfig.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import journalRoutes from "./routes/journalRoutes.js";  
import aiRoutes from "./routes/aiRoutes.js";  
import chatRoutes from "./routes/chatRoutes.js";  
import authRoutes from "./routes/authRoutes.js";
import callRoutes from "./routes/callRoutes.js";

dotenv.config();  

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(logger);

app.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.mp3') || req.path.endsWith('.wav') || req.path.endsWith('.webm')) {
    res.set({
      'Accept-Ranges': 'bytes',
      'Content-Type': req.path.endsWith('.mp3') ? 'audio/mpeg' : (req.path.endsWith('.wav') ? 'audio/wav' : 'audio/webm'),
      'Cache-Control': 'public, max-age=86400'
    });
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/') && (req.path.endsWith('.mp3') || req.path.endsWith('.wav') || req.path.endsWith('.webm'))) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');
  }
  next();
});

const limiter = rateLimit({  
  windowMs: 60 * 1000,  
  max: 100,  
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",  
});  
app.use(limiter);  

connectDB();

testGroqConfig()
  .then(success => {
    if (!success) {
      console.warn('Groq API connection issues detected. AI features may not work properly.');
    }
  })
  .catch(err => {
    console.error('Failed to test Groq connection:', err);
  });

app.use("/api/journals", (req, res, next) => {
  console.log('Journal route called:', req.method, req.path);
  console.log('User:', req.user);
  next();
}, journalRoutes);  
app.use("/api/ai", aiRoutes);  
app.use("/api/positivity-chat", chatRoutes);  
app.use("/api/auth", authRoutes);
app.use("/api/call", callRoutes);

app.use(errorHandler);  

const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => {  
  console.log(`Server running on port ${PORT}`);  
});
