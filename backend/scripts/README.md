# Scripts Directory

This directory contains utility scripts for the backend.

## Available Scripts

### Add Mock Data for Tester

The `addMockDataForTester.js` script adds mock journal entries for the test user (email: test@test.com) to provide a rich dataset for testing insights and graphs.

#### Prerequisites

1. Make sure MongoDB is running
2. Ensure the test user (email: test@test.com) is already created in the database

#### How to Run

```bash
# Navigate to the backend directory
cd backend

# Run the script
node scripts/addMockDataForTester.js

# If you want to force overwrite existing entries
node scripts/addMockDataForTester.js --force
```

#### What it does

This script:
1. Finds the user with email test@test.com
2. Generates approximately 200-250 mock journal entries spread over the past 3 years
3. Each entry has a random mood and anxiety score
4. The data will be visible in the Insights and Dashboard pages

#### Important Note

This script is specifically designed to only add mock data for the test user. No other users will receive mock data. 