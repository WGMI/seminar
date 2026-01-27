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
    const { playerName, score, totalQuestions, timeTaken, sessionId } = body

    // Validation
    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Valid score is required' },
        { status: 400 }
      )
    }

    if (typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return NextResponse.json(
        { error: 'Valid total questions count is required' },
        { status: 400 }
      )
    }

    if (score > totalQuestions) {
      return NextResponse.json(
        { error: 'Score cannot exceed total questions' },
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
      `INSERT INTO quiz_scores (player_name, score, total_questions, time_taken, session_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id,
         (SELECT COUNT(*) + 1 FROM quiz_scores WHERE score > $2 OR (score = $2 AND created_at < NOW())) as rank`,
      [sanitizedName, score, totalQuestions, timeTaken || null, sessionId || null]
    )

    const insertedScore = result[0]

    return NextResponse.json({
      success: true,
      id: insertedScore.id,
      rank: parseInt(insertedScore.rank.toString()),
      message: 'Score submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting quiz score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score. Please try again.' },
      { status: 500 }
    )
  }
}
