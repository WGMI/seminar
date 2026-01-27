# Voting System Setup Guide

## Overview

The voting system allows admins to create questions with multiple options, and users can vote on them. Results update live on the results page.

## Database Setup

Run the voting schema SQL file:

```bash
# In Neon SQL Editor or via psql
psql "your-neon-connection-string" -f database/voting-schema.sql
```

Or copy and paste the contents of `database/voting-schema.sql` into the Neon SQL Editor.

## Environment Variables

Add to your `.env.local`:

```env
DATABASE_URL=your-neon-connection-string
ADMIN_TOKEN=your-secure-admin-password-here
```

**Important:** Choose a strong password for `ADMIN_TOKEN`. This is used to authenticate admin access.

## Features

### Admin Side (`/admin/voting`)
- **Authentication**: Password-protected (uses `ADMIN_TOKEN` from env)
- **Create Questions**: Set a question and multiple options
- **Auto-deactivate**: New questions automatically deactivate old ones
- **Session-based**: Login persists in sessionStorage

### User Side (`/voting`)
- **Vote Interface**: Clean UI to select and submit votes
- **One Vote Per Session**: Prevents duplicate votes using session IDs
- **Rate Limiting**: Max 5 votes per minute per IP

### Results Page (`/voting/results`)
- **Live Updates**: Automatically refreshes every 2 seconds
- **Real-time Counts**: Shows vote counts and percentages
- **Visual Progress Bars**: Animated bars showing vote distribution
- **Manual Refresh**: Button to manually refresh results

## API Endpoints

### Public Endpoints

#### Get Current Question
```
GET /api/voting/question
```
Returns the active question and its options.

#### Submit Vote
```
POST /api/voting/vote
Content-Type: application/json

{
  "questionId": 1,
  "optionId": 2,
  "sessionId": "optional-session-id"
}
```

#### Get Results
```
GET /api/voting/results
```
Returns current vote counts and percentages.

### Admin Endpoints

#### Get Question (Admin)
```
GET /api/admin/voting/question
Authorization: Bearer {ADMIN_TOKEN}
```

#### Create Question (Admin)
```
POST /api/admin/voting/question
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "question": "What should we build next?",
  "options": [
    "AI Chatbot Integration",
    "Real-time Collaboration Tool",
    "Mobile App for Students",
    "Data Visualization Dashboard"
  ]
}
```

## Security Features

✅ **Admin Authentication**: Bearer token authentication  
✅ **Rate Limiting**: 5 votes per minute per IP  
✅ **Duplicate Prevention**: One vote per session per question  
✅ **Input Validation**: All inputs validated and sanitized  
✅ **SQL Injection Prevention**: Parameterized queries  

## Usage Flow

1. **Admin Setup**:
   - Go to `/admin/voting`
   - Enter admin password (from `ADMIN_TOKEN`)
   - Create a question with options
   - Submit

2. **User Voting**:
   - Go to `/voting` (or click "Vote Now" on homepage)
   - See the current question
   - Select an option
   - Submit vote
   - See confirmation

3. **View Results**:
   - Go to `/voting/results` (or click "View Results" on homepage)
   - See live updating results
   - Results refresh automatically every 2 seconds

## Database Schema

- **voting_questions**: Stores questions (only one active at a time)
- **voting_options**: Stores options for each question
- **votes**: Stores individual votes with session tracking
- **voting_results**: View that calculates vote counts and percentages

## Notes

- Only one question can be active at a time
- Creating a new question automatically deactivates the previous one
- Votes are tracked by session ID to prevent duplicates
- Results page uses polling (2-second intervals) for live updates
- Admin password is stored in sessionStorage (cleared on logout)

## Troubleshooting

**Admin can't login:**
- Check that `ADMIN_TOKEN` is set in `.env.local`
- Restart dev server after adding env variable
- Check browser console for errors

**Votes not submitting:**
- Check database connection
- Verify question is active
- Check rate limiting (wait 1 minute if hit limit)

**Results not updating:**
- Check browser console for errors
- Verify database connection
- Try manual refresh button
