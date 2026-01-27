import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate limit and offset
    const validLimit = Math.min(Math.max(1, limit), 100) // Between 1 and 100
    const validOffset = Math.max(0, offset)

    // Fetch leaderboard
    const leaderboard = await query<{
      rank: number
      player_name: string
      score: number
      total_questions: number
      percentage: number
      time_taken: number | null
      created_at: Date
    }>(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank,
        player_name,
        score,
        total_questions,
        percentage,
        time_taken,
        created_at
       FROM quiz_scores
       ORDER BY score DESC, created_at ASC
       LIMIT $1 OFFSET $2`,
      [validLimit, validOffset]
    )

    // Get total count
    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM quiz_scores'
    )
    const total = parseInt(countResult[0].count)

    return NextResponse.json({
      leaderboard,
      pagination: {
        total,
        limit: validLimit,
        offset: validOffset,
        hasMore: offset + validLimit < total
      }
    })

  } catch (error) {
    console.error('Error fetching quiz leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
