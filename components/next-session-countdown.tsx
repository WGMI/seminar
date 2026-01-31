'use client'

import { useState, useEffect } from 'react'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isPast: false }
}

export interface NextSessionCountdownProps {
  /** ISO date string or null if no session set */
  scheduledAt: string | null
  /** Compact: show single line (e.g. "2d 5h 12m 3s"); default false = show boxes */
  compact?: boolean
  /** When past or no date, show this instead of zeros */
  noSessionLabel?: string
  className?: string
}

export function NextSessionCountdown({
  scheduledAt,
  compact = false,
  noSessionLabel = 'No upcoming session',
  className = ''
}: NextSessionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!scheduledAt) {
      setTimeLeft(null)
      return
    }
    const target = new Date(scheduledAt)
    if (isNaN(target.getTime())) {
      setTimeLeft(null)
      return
    }

    const update = () => setTimeLeft(getTimeLeft(target))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [scheduledAt])

  if (scheduledAt == null || scheduledAt === '') {
    return (
      <span className={className} data-countdown="none">
        {noSessionLabel}
      </span>
    )
  }

  if (timeLeft === null) {
    return (
      <span className={className} data-countdown="loading">
        ...
      </span>
    )
  }

  if (timeLeft.isPast) {
    return (
      <span className={className} data-countdown="past">
        Session started
      </span>
    )
  }

  if (compact) {
    const parts = []
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`)
    parts.push(`${timeLeft.hours}h`)
    parts.push(`${timeLeft.minutes}m`)
    parts.push(`${timeLeft.seconds}s`)
    return (
      <span className={className} data-countdown="compact">
        {parts.join(' ')}
      </span>
    )
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ]

  return (
    <div className={`flex flex-wrap justify-center gap-3 sm:gap-6 ${className}`} data-countdown="boxes">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] px-3 py-4 rounded-lg bg-muted/80 border border-border"
        >
          <span className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</span>
        </div>
      ))}
    </div>
  )
}
