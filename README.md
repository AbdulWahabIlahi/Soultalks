# 🚀 Soultalks

> Your AI-powered mental wellness companion for journaling, mood tracking, and positive conversation.

---

## 🎯 Objective

Soultalks addresses mental health challenges by providing users with an AI-powered companion to track moods, journal thoughts, and engage in supportive conversations. It serves individuals seeking to understand their emotional patterns and improve mental well-being through regular reflection.

The application leverages Groq's powerful LLMs to analyze user-generated content (text, audio, images) and provide personalized insights, fostering self-awareness and emotional intelligence in a private, judgment-free space.

---

## 🛠️ Tech Stack

### Core Technologies Used:
- **Frontend:** React 19, Chart.js, Styled Components
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **APIs:** Groq LLM (llama-3.1-8b-instant, llama-3.3-70b-versatile, whisper-large-v3, PlayAI TTS)
- **Hosting:** Local development environment

---

## ✨ Key Features

- ✅ **AI Journal Analysis:** Automatically analyzes journal entries to track mood and anxiety levels
- ✅ **Multi-Modal Input:** Journal using text, voice recordings, or images
- ✅ **Emotion Tracking Dashboard:** Visualizes mood and anxiety trends over time
- ✅ **Supportive AI Chat:** Engage in natural conversations with an AI companion trained to provide emotional support
- ✅ **Voice Chat:** Record voice messages for transcription and AI response
- ✅ **Personalized Insights:** Get AI-generated insights about emotional patterns based on journal history

---

## 🧪 How to Run the Project

### Requirements:
- Node.js (v16+)
- MongoDB (running locally)
- Groq API key

### Local Setup:
```bash
# Clone the repo
git clone https://github.com/AbdulWahabIlahi/Soultalks

# Setup backend
cd Soultalks/backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# GROQ_API_KEY=your_groq_api_key
# JWT_SECRET=your_jwt_secret
# Frontend URL
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm run dev

# Setup frontend (in another terminal)
cd ../frontend
npm install

# Start frontend development server
npm start
```

### Features to Try:
- Create an account
- Add journal entries via text, voice, or images
- View your mood trends in the dashboard
- Chat with the AI companion about how you're feeling

---

## 🧬 Future Scope

- 📈 **Advanced Analytics:** More sophisticated pattern recognition and personalized recommendations
- 🧘 **Guided Exercises:** Adding meditation and breathing exercises based on mood detection
- 👥 **Community Features:** Optional anonymous sharing of insights and support groups
- 🏆 **Achievement System:** Gamification elements to encourage regular journaling
- 🌐 **Multi-language Support:** Expanding to serve non-English speaking users

---

## 📎 Resources / Credits

- **APIs:** Groq API for language models and audio transcription
- **Libraries:** Chart.js for data visualization, React Icons for UI elements
- **Frameworks:** React for frontend, Express for backend API
- **Design:** Inspired by Catppuccin Mocha theme for a calming, modern interface

---

## 🏁 Final Words

This project has been an incredible journey of exploration at the intersection of AI and mental wellness. The biggest challenge was creating an AI companion that felt genuinely supportive without being artificial. I'm proud of how Soultalks balances technological innovation with human-centered design, and I hope it helps people develop greater emotional self-awareness in their daily lives.

---
