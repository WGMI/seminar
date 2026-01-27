import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Get current active question
    const question = await query<{
      id: number
      question: string
    }>(
      `SELECT id, question 
       FROM voting_questions 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 1`
    )

    if (question.length === 0) {
      return NextResponse.json({
        question: null,
        results: [],
        totalVotes: 0
      })
    }

    const questionId = question[0].id

    // Get results with vote counts
    const results = await query<{
      option_id: number
      option_text: string
      display_order: number
      vote_count: string
      percentage: number | string
    }>(
      `SELECT 
        option_id,
        option_text,
        display_order,
        vote_count,
        percentage::numeric as percentage
       FROM voting_results
       WHERE question_id = $1
       ORDER BY display_order ASC`,
      [questionId]
    )

    // Get total votes
    const totalResult = await query<{ total: string }>(
      `SELECT COUNT(*) as total FROM votes WHERE question_id = $1`,
      [questionId]
    )
    const totalVotes = parseInt(totalResult[0].total)

    return NextResponse.json({
      question: {
        id: question[0].id,
        question: question[0].question
      },
      results: results.map(r => ({
        optionId: r.option_id,
        optionText: r.option_text,
        voteCount: parseInt(r.vote_count),
        percentage: typeof r.percentage === 'number' 
          ? r.percentage 
          : parseFloat(String(r.percentage || '0')),
        displayOrder: r.display_order
      })),
      totalVotes
    })

  } catch (error) {
    console.error('Error fetching voting results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting results' },
      { status: 500 }
    )
  }
}
