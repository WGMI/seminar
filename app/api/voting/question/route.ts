import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// Get current active question
export async function GET() {
  try {
    const question = await queryOne<{
      id: number
      question: string
      created_at: Date
    }>(
      `SELECT id, question, created_at 
       FROM voting_questions 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 1`
    )

    if (!question) {
      return NextResponse.json({
        question: null,
        options: []
      })
    }

    const options = await query<{
      id: number
      option_text: string
      display_order: number
    }>(
      `SELECT id, option_text, display_order 
       FROM voting_options 
       WHERE question_id = $1 
       ORDER BY display_order ASC`,
      [question.id]
    )

    return NextResponse.json({
      question: {
        id: question.id,
        question: question.question,
        createdAt: question.created_at
      },
      options: options.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        displayOrder: opt.display_order
      }))
    })

  } catch (error) {
    console.error('Error fetching voting question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting question' },
      { status: 500 }
    )
  }
}
