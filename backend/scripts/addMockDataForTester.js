import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.js';
import Journal from '../models/journal.js';
import connectDB from '../config/db.js';

// Get current directory and resolve path to .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Load environment variables with absolute path
dotenv.config({ path: envPath });

console.log('MongoDB URI:', process.env.MONGO_URI ? 'Found' : 'Not found');

// Function to generate mock journal entries over multiple years
const generateMockJournals = async (userId) => {
  const moods = ['happy', 'sad', 'anxious', 'calm', 'stressed', 'neutral', 'excited'];
  const entries = [
    "Today was a great day. I accomplished a lot and felt productive.",
    "Feeling a bit down today. The weather doesn't help either.",
    "Anxiety is getting to me. Too many deadlines approaching.",
    "Had a peaceful day. Meditation in the morning really helped.",
    "Work stress is mounting. Need to find better coping mechanisms.",
    "Just an ordinary day, nothing special happened.",
    "Something exciting happened! Can't wait to see what comes next.",
    "Grateful for the small things today. It's the little moments that count.",
    "Feeling overwhelmed with everything going on. Need to take a step back.",
    "Had a good conversation with a friend. It lifted my spirits.",
    "Took some time for self-care today and it made a difference.",
    "Struggling with motivation lately, need to find ways to stay focused.",
    "Made progress on a personal project, feeling satisfied with the results.",
    "Dealing with some challenges but trying to stay positive.",
    "Reflecting on past decisions and how they've shaped where I am now."
  ];

  // Generate entries for the past 3 years
  const journals = [];
  const today = new Date();
  
  // Start 3 years ago
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 3);
  
  // Generate entries (about one every 3-5 days on average)
  let currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    // Random skip (don't create entries for every day)
    const skipDays = Math.floor(Math.random() * 5) + 1; // Skip 1-5 days
    currentDate.setDate(currentDate.getDate() + skipDays);
    
    if (currentDate > today) break;
    
    // Random entry text and mood
    const entryIndex = Math.floor(Math.random() * entries.length);
    const moodIndex = Math.floor(Math.random() * moods.length);
    const anxietyScore = Math.floor(Math.random() * 10) + 1; // 1-10
    
    const journal = {
      user: userId,
      textEntry: entries[entryIndex],
      date: new Date(currentDate),
      textAnalysis: {
        mood: moods[moodIndex],
        anxietyScore: anxietyScore
      }
    };
    
    journals.push(journal);
  }
  
  console.log(`Generated ${journals.length} mock journal entries`);
  return journals;
};

// Main function to run the script
const addMockDataForTester = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Find the test user
    const testUser = await User.findOne({ email: 'test@test.com' });
    
    if (!testUser) {
      console.error('Test user not found! Please create a user with email test@test.com first.');
      process.exit(1);
    }
    
    console.log(`Found test user: ${testUser.username} with ID: ${testUser._id}`);
    
    // Check if user already has journal entries
    const existingEntries = await Journal.countDocuments({ user: testUser._id });
    
    if (existingEntries > 0) {
      console.log(`Test user already has ${existingEntries} journal entries.`);
      const confirmation = process.argv.includes('--force') ? 'y' : 
        await new Promise(resolve => {
          process.stdout.write('Do you want to delete existing entries and add new ones? (y/n): ');
          process.stdin.once('data', data => {
            resolve(data.toString().trim().toLowerCase());
          });
        });
      
      if (confirmation === 'y') {
        console.log('Deleting existing journal entries...');
        await Journal.deleteMany({ user: testUser._id });
      } else {
        console.log('Keeping existing entries. Exiting script.');
        process.exit(0);
      }
    }
    
    // Generate mock journals
    const mockJournals = await generateMockJournals(testUser._id);
    
    // Save to database
    console.log('Saving mock journals to database...');
    await Journal.insertMany(mockJournals);
    
    console.log(`Successfully added ${mockJournals.length} mock journal entries for test user!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
addMockDataForTester(); 