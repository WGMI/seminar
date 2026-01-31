'use client'

import { NextSessionCountdown } from '@/components/next-session-countdown'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface NextSessionWidgetProps {
  className?: string
}

export function NextSessionWidget({ className = '' }: NextSessionWidgetProps) {
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchSession() {
      try {
        const res = await fetch('/api/session/next')
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setScheduledAt(json.scheduledAt ?? null)
      } catch {
        if (!cancelled) setScheduledAt(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSession()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/80 border border-border text-sm text-muted-foreground ${className}`}
      >
        <Calendar className="w-4 h-4 shrink-0" />
        <span>...</span>
      </div>
    )
  }

  if (!scheduledAt) {
    return null
  }

  const target = new Date(scheduledAt)
  if (isNaN(target.getTime()) || target.getTime() <= Date.now()) {
    return null
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/80 border border-border text-sm ${className}`}
      title="Time to next session"
    >
      <Calendar className="w-4 h-4 shrink-0 text-primary" />
      <NextSessionCountdown
        scheduledAt={scheduledAt}
        compact
        noSessionLabel="—"
        className="font-medium tabular-nums text-foreground"
      />
    </div>
  )
}
