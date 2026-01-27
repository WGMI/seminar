import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const difficulty = searchParams.get('difficulty') // Optional filter

    // Validate limit and offset
    const validLimit = Math.min(Math.max(1, limit), 100) // Between 1 and 100
    const validOffset = Math.max(0, offset)

    // Build query with optional difficulty filter
    let queryText = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY completion_time ASC, created_at ASC) as rank,
        player_name,
        completion_time,
        words_found,
        total_words,
        percentage,
        difficulty,
        created_at
      FROM wordsearch_scores
      WHERE words_found = total_words
    `
    const params: any[] = []

    if (difficulty) {
      queryText += ' AND difficulty = $1'
      params.push(difficulty)
    }

    queryText += ' ORDER BY completion_time ASC, created_at ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(validLimit, validOffset)

    // Fetch leaderboard
    const leaderboard = await query<{
      rank: number
      player_name: string
      completion_time: number
      words_found: number
      total_words: number
      percentage: number
      difficulty: string
      created_at: Date
    }>(queryText, params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM wordsearch_scores WHERE words_found = total_words'
    const countParams: any[] = []
    
    if (difficulty) {
      countQuery += ' AND difficulty = $1'
      countParams.push(difficulty)
    }

    const countResult = await query<{ count: string }>(countQuery, countParams)
    const total = parseInt(countResult[0].count)

    return NextResponse.json({
      leaderboard,
      pagination: {
        total,
        limit: validLimit,
        offset: validOffset,
        hasMore: offset + validLimit < total
      },
      filter: difficulty ? { difficulty } : null
    })

  } catch (error) {
    console.error('Error fetching wordsearch leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
