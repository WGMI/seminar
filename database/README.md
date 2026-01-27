# Database Setup for Neon

This directory contains the SQL schema and setup instructions for the Pathways Software Dev games database.

## Setup Instructions

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string

### 2. Run the Schema

You can run the schema in one of two ways:

#### Option A: Using Neon Console
1. Open the Neon SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Execute the script

#### Option B: Using psql
```bash
psql "your-neon-connection-string" -f schema.sql
```

#### Option C: Using a Database Client
- Use DBeaver, pgAdmin, or any PostgreSQL client
- Connect to your Neon database
- Run the `schema.sql` file

### 3. Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check quiz questions count (should be 25)
SELECT COUNT(*) FROM quiz_questions;

-- Check word lists count (should be 5)
SELECT COUNT(*) FROM word_lists;

-- Test random question function
SELECT * FROM get_random_quiz_questions(8);

-- Check leaderboard views
SELECT * FROM quiz_leaderboard LIMIT 10;
SELECT * FROM wordsearch_leaderboard LIMIT 10;
```

## Database Structure

### Tables

1. **quiz_questions** - Pool of 25 quiz questions
2. **quiz_scores** - Quiz game scores and leaderboard
3. **word_lists** - Word lists for wordsearch games
4. **wordsearch_scores** - Wordsearch game scores and leaderboard

### Views

1. **quiz_leaderboard** - Top 100 quiz scores
2. **wordsearch_leaderboard** - Top 100 wordsearch completion times

### Functions

1. **get_random_quiz_questions(question_count)** - Returns random questions from the pool

## Environment Variables

Add these to your `.env.local`:

```env
DATABASE_URL=your-neon-connection-string
```

## Next Steps

After setting up the database:

1. Set up Prisma or Drizzle ORM (recommended)
2. Create API routes to interact with the database
3. Implement score submission endpoints
4. Connect games to the database

## Notes

- All tables include `created_at` timestamps
- Indexes are created for performance on frequently queried columns
- The `session_id` field helps prevent duplicate score submissions
- Percentage is automatically calculated using generated columns
- Questions and word lists can be marked as inactive without deletion
