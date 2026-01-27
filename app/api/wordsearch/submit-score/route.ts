import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Rate limiting map (in production, use Redis or a proper rate limiting service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)
  
  // Reset after 1 minute
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 })
    return true
  }
  
  // Allow max 10 submissions per minute
  if (limit.count >= 10) {
    return false
  }
  
  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { playerName, completionTime, wordsFound, totalWords, difficulty, wordListId, sessionId } = body

    // Validation
    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    if (typeof completionTime !== 'number' || completionTime <= 0) {
      return NextResponse.json(
        { error: 'Valid completion time is required' },
        { status: 400 }
      )
    }

    if (typeof wordsFound !== 'number' || wordsFound < 0) {
      return NextResponse.json(
        { error: 'Valid words found count is required' },
        { status: 400 }
      )
    }

    if (typeof totalWords !== 'number' || totalWords <= 0) {
      return NextResponse.json(
        { error: 'Valid total words count is required' },
        { status: 400 }
      )
    }

    if (wordsFound > totalWords) {
      return NextResponse.json(
        { error: 'Words found cannot exceed total words' },
        { status: 400 }
      )
    }

    // Sanitize player name (basic XSS prevention)
    const sanitizedName = playerName.trim().slice(0, 100)

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Insert score into database
    const result = await query<{ id: number; rank: number }>(
      `INSERT INTO wordsearch_scores (player_name, completion_time, words_found, total_words, difficulty, word_list_id, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id,
         (SELECT COUNT(*) + 1 FROM wordsearch_scores 
          WHERE words_found = total_words 
          AND (completion_time < $2 OR (completion_time = $2 AND created_at < NOW()))) as rank`,
      [
        sanitizedName,
        completionTime,
        wordsFound,
        totalWords,
        difficulty || 'medium',
        wordListId || null,
        sessionId || null
      ]
    )

    const insertedScore = result[0]

    return NextResponse.json({
      success: true,
      id: insertedScore.id,
      rank: parseInt(insertedScore.rank.toString()),
      message: 'Score submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting wordsearch score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score. Please try again.' },
      { status: 500 }
    )
  }
}
