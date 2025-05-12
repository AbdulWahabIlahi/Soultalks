import axios from 'axios';

// Test API calls to the backend with manual token authentication

// Enter your token here (you can get it from localStorage after logging in)
const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with your actual token after logging in

// Test function to fetch journals
const testFetchJournals = async () => {
  try {
    // Create axios instance with auth header
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Testing journal fetch with token:', TOKEN);
    
    // Try to fetch journals
    const response = await api.get('/journals');
    
    console.log(`Fetched ${response.data.length} journals`);
    console.log('Sample journal:', response.data[0]);
    
    // Check if there's any data
    if (response.data.length === 0) {
      console.warn('No journals returned from API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return null;
  }
};

// You can run this file directly with Node.js:
// node testApi.js
// Or you can import and call this function from your browser console
window.testFetchJournals = testFetchJournals;

// Export for use in browser
export { testFetchJournals }; 