# API Setup Complete ✅

## Files Created

### 1. Database Connection Utility
**`lib/db.ts`**
- PostgreSQL connection pool using `pg` library
- Optimized for serverless environments (max 1 connection)
- Helper functions: `query()`, `queryOne()`, `closePool()`, `checkConnection()`
- Error handling and query logging

### 2. API Routes

#### Quiz Game
- **`app/api/quiz/submit-score/route.ts`**
  - POST endpoint to submit quiz scores
  - Validates player name, score, and total questions
  - Rate limiting (10 requests per minute per IP)
  - XSS prevention (sanitizes player names)
  - Returns rank and submission ID

- **`app/api/quiz/leaderboard/route.ts`**
  - GET endpoint to fetch quiz leaderboard
  - Supports pagination (limit/offset)
  - Returns top scores ordered by score DESC, then by time ASC

#### Wordsearch Game
- **`app/api/wordsearch/submit-score/route.ts`**
  - POST endpoint to submit wordsearch scores
  - Validates completion time, words found, total words
  - Rate limiting (10 requests per minute per IP)
  - Supports difficulty levels and word list IDs
  - Returns rank and submission ID

- **`app/api/wordsearch/leaderboard/route.ts`**
  - GET endpoint to fetch wordsearch leaderboard
  - Filters by difficulty (optional)
  - Only shows completed games (words_found = total_words)
  - Ordered by completion time ASC (fastest first)
  - Supports pagination

### 3. Utilities
**`lib/utils.ts`** (updated)
- Added `generateSessionId()` function for unique session tracking

### 4. Game Integration
**`app/games/page.tsx`** (updated)
- Quiz game now submits scores to API on completion
- Shows loading state during submission
- Displays success/error messages
- Uses session IDs to prevent duplicate submissions

## Environment Variables Required

Make sure you have this in your `.env.local`:

```env
DATABASE_URL=your-neon-connection-string
```

## API Endpoints

### Quiz Score Submission
```bash
POST /api/quiz/submit-score
Content-Type: application/json

{
  "playerName": "John Doe",
  "score": 7,
  "totalQuestions": 8,
  "timeTaken": 120,  // optional, in seconds
  "sessionId": "unique-session-id"  // optional
}
```

### Quiz Leaderboard
```bash
GET /api/quiz/leaderboard?limit=100&offset=0
```

### Wordsearch Score Submission
```bash
POST /api/wordsearch/submit-score
Content-Type: application/json

{
  "playerName": "John Doe",
  "completionTime": 45,  // in seconds
  "wordsFound": 8,
  "totalWords": 8,
  "difficulty": "medium",  // optional
  "wordListId": 1,  // optional
  "sessionId": "unique-session-id"  // optional
}
```

### Wordsearch Leaderboard
```bash
GET /api/wordsearch/leaderboard?limit=100&offset=0&difficulty=medium
```

## Security Features

✅ **Rate Limiting**: 10 requests per minute per IP  
✅ **Input Validation**: All inputs validated and sanitized  
✅ **XSS Prevention**: Player names sanitized (max 100 chars)  
✅ **SQL Injection Prevention**: Parameterized queries  
✅ **Session Tracking**: Prevents duplicate submissions  

## Next Steps

1. ✅ Database schema created
2. ✅ Database connection utility created
3. ✅ API routes created
4. ✅ Quiz game integrated with API
5. ⏳ Wordsearch game integration (when word selection is implemented)
6. ⏳ Leaderboard display on homepage
7. ⏳ Fetch random questions from database (currently using hardcoded questions)

## Testing

You can test the API endpoints using:

```bash
# Submit a quiz score
curl -X POST http://localhost:3000/api/quiz/submit-score \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test User","score":7,"totalQuestions":8}'

# Get leaderboard
curl http://localhost:3000/api/quiz/leaderboard?limit=10
```

## Notes

- Rate limiting uses in-memory Map (for production, consider Redis)
- Connection pool is optimized for serverless (max 1 connection)
- All database queries use parameterized statements for security
- Error messages are user-friendly but don't expose internal details
