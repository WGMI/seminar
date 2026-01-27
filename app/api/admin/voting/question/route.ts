import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// Simple admin authentication
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.ADMIN_TOKEN

  if (!expectedToken) {
    console.error('ADMIN_TOKEN not set in environment variables')
    return false
  }

  return authHeader === `Bearer ${expectedToken}`
}

// Get current question (admin)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const question = await queryOne<{
      id: number
      question: string
      is_active: boolean
      created_at: Date
    }>(
      `SELECT id, question, is_active, created_at 
       FROM voting_questions 
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
        isActive: question.is_active,
        createdAt: question.created_at
      },
      options: options.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        displayOrder: opt.display_order
      }))
    })

  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

// Create or update question
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { question, options } = body

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    // Deactivate all existing questions
    await query('UPDATE voting_questions SET is_active = false')

    // Create new question
    const questionResult = await query<{ id: number }>(
      `INSERT INTO voting_questions (question, is_active)
       VALUES ($1, true)
       RETURNING id`,
      [question.trim()]
    )

    const questionId = questionResult[0].id

    // Insert options
    const optionValues = options.map((opt: string, index: number) => 
      [questionId, opt.trim(), index]
    )

    for (const [qId, optText, displayOrder] of optionValues) {
      await query(
        `INSERT INTO voting_options (question_id, option_text, display_order)
         VALUES ($1, $2, $3)`,
        [qId, optText, displayOrder]
      )
    }

    return NextResponse.json({
      success: true,
      questionId,
      message: 'Question created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
