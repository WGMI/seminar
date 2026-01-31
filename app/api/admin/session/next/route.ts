import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.ADMIN_TOKEN
  if (!expectedToken) return false
  return authHeader === `Bearer ${expectedToken}`
}

// Admin GET: current next session
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const row = await queryOne<{
      scheduled_at: Date | null
      title: string | null
      description: string | null
      updated_at: Date
    }>(
      `SELECT scheduled_at, title, description, updated_at
       FROM next_session
       WHERE id = 1`
    )

    if (!row) {
      return NextResponse.json({
        scheduledAt: null,
        title: '',
        description: '',
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      scheduledAt: row.scheduled_at ? row.scheduled_at.toISOString() : null,
      title: row.title ?? '',
      description: row.description ?? '',
      updatedAt: row.updated_at.toISOString()
    })
  } catch (error) {
    console.error('Error fetching next session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch next session' },
      { status: 500 }
    )
  }
}

// Admin PUT: set next session (time, title, description)
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { scheduledAt, title, description } = body

    // scheduledAt: ISO string or null to clear
    const scheduledAtParsed =
      scheduledAt != null && scheduledAt !== ''
        ? new Date(scheduledAt)
        : null
    if (scheduledAt != null && scheduledAt !== '' && isNaN(scheduledAtParsed!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledAt date' },
        { status: 400 }
      )
    }

    const titleStr = typeof title === 'string' ? title : ''
    const descriptionStr = typeof description === 'string' ? description : ''

    await query(
      `INSERT INTO next_session (id, scheduled_at, title, description, updated_at)
       VALUES (1, $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         scheduled_at = EXCLUDED.scheduled_at,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         updated_at = NOW()`,
      [scheduledAtParsed, titleStr, descriptionStr]
    )

    const row = await queryOne<{
      scheduled_at: Date | null
      title: string | null
      description: string | null
      updated_at: Date
    }>(
      `SELECT scheduled_at, title, description, updated_at
       FROM next_session WHERE id = 1`
    )

    return NextResponse.json({
      scheduledAt: row?.scheduled_at ? row.scheduled_at.toISOString() : null,
      title: row?.title ?? '',
      description: row?.description ?? '',
      updatedAt: row?.updated_at.toISOString() ?? new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating next session:', error)
    return NextResponse.json(
      { error: 'Failed to update next session' },
      { status: 500 }
    )
  }
}
