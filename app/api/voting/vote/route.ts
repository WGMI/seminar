import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateSessionId } from '@/lib/utils'

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 5) { // Max 5 votes per minute
    return false
  }
  
  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, optionId, sessionId } = body

    // Validation
    if (!questionId || typeof questionId !== 'number') {
      return NextResponse.json(
        { error: 'Valid question ID is required' },
        { status: 400 }
      )
    }

    if (!optionId || typeof optionId !== 'number') {
      return NextResponse.json(
        { error: 'Valid option ID is required' },
        { status: 400 }
      )
    }

    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many votes. Please try again later.' },
        { status: 429 }
      )

    }

    // Use provided sessionId or generate one
    const voterSession = sessionId || generateSessionId()

    // Check if user already voted for this question
    const existingVote = await query<{ id: number }>(
      `SELECT id FROM votes 
       WHERE question_id = $1 AND voter_session = $2`,
      [questionId, voterSession]
    )

    if (existingVote.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted on this question' },
        { status: 400 }
      )
    }

    // Verify question is active and option belongs to question
    const validOption = await query<{ id: number }>(
      `SELECT vo.id 
       FROM voting_options vo
       JOIN voting_questions vq ON vo.question_id = vq.id
       WHERE vo.id = $1 AND vo.question_id = $2 AND vq.is_active = true`,
      [optionId, questionId]
    )

    if (validOption.length === 0) {
      return NextResponse.json(
        { error: 'Invalid option or question is not active' },
        { status: 400 }
      )
    }

    // Insert vote
    const result = await query<{ id: number }>(
      `INSERT INTO votes (question_id, option_id, voter_session)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [questionId, optionId, voterSession]
    )

    return NextResponse.json({
      success: true,
      voteId: result[0].id,
      sessionId: voterSession,
      message: 'Vote submitted successfully'
    }, { status: 201 })

  } catch (error: any) {
    // Handle unique constraint violation (duplicate vote)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have already voted on this question' },
        { status: 400 }
      )
    }

    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote. Please try again.' },
      { status: 500 }
    )
  }
}
