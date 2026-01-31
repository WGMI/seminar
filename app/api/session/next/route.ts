import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

export interface NextSessionResponse {
  scheduledAt: string | null
  title: string
  description: string
  updatedAt: string
}

// Public API: get the next session (for countdown and details)
export async function GET() {
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
      } as NextSessionResponse)
    }

    return NextResponse.json({
      scheduledAt: row.scheduled_at ? row.scheduled_at.toISOString() : null,
      title: row.title ?? '',
      description: row.description ?? '',
      updatedAt: row.updated_at.toISOString()
    } as NextSessionResponse)
  } catch (error) {
    console.error('Error fetching next session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch next session' },
      { status: 500 }
    )
  }
}
