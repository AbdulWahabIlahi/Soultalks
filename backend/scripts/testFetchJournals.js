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

// Function to test fetching journals for a user
const testFetchJournals = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Find the test user
    const testUser = await User.findOne({ email: 'test@test.com' });
    
    if (!testUser) {
      console.error('Test user not found! Make sure there is a user with email test@test.com');
      process.exit(1);
    }
    
    console.log(`Found test user: ${testUser.username} with ID: ${testUser._id}`);
    
    // Count journals for this user
    const journalCount = await Journal.countDocuments({ user: testUser._id });
    console.log(`Found ${journalCount} journals for test user`);
    
    // Fetch example journals
    const journals = await Journal.find({ user: testUser._id }).sort({ date: -1 }).limit(5);
    
    if (journals.length > 0) {
      console.log('Example journal entries:');
      journals.forEach((journal, index) => {
        console.log(`Journal #${index + 1} (${journal._id}):`);
        console.log(`  - Text: ${journal.textEntry.substring(0, 50)}...`);
        console.log(`  - Date: ${journal.date}`);
        console.log(`  - Mood: ${journal.textAnalysis?.mood || 'None'}`);
        console.log(`  - Anxiety Score: ${journal.textAnalysis?.anxietyScore || 'None'}`);
        console.log('---');
      });
    } else {
      console.log('No journals found for test user!');
    }
    
    // Fetch journals by week
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekJournals = await Journal.find({ 
      user: testUser._id,
      date: { $gte: lastWeek }
    }).sort({ date: -1 });
    
    console.log(`Found ${lastWeekJournals.length} journals from the last week`);
    
    // Count journals by month for the last year
    const months = [];
    for (let i = 0; i < 12; i++) {
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() - i - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(today);
      endDate.setMonth(today.getMonth() - i);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const count = await Journal.countDocuments({
        user: testUser._id,
        date: { $gte: startDate, $lte: endDate }
      });
      
      const monthName = startDate.toLocaleString('default', { month: 'long' });
      months.push({ month: `${monthName} ${startDate.getFullYear()}`, count });
    }
    
    console.log('Journals per month (last year):');
    months.forEach(m => {
      console.log(`  - ${m.month}: ${m.count} entries`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing journal fetch:', error);
    process.exit(1);
  }
};

// Run the test
testFetchJournals(); 