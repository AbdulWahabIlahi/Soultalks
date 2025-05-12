import morgan from "morgan";

// Custom format that includes timestamp, method, url, status, and response time
const customFormat = ':date[iso] :method :url :status :response-time ms';

// Morgan logger middleware
export const logger = morgan(customFormat, {
  skip: (req, res) => {
    // Skip logging for successful static asset requests to reduce noise
    return res.statusCode < 400 && req.originalUrl.startsWith('/static');
  }
});

// Function to log errors for internal application logging
export const logError = (error) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
}; 