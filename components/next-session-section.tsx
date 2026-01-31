'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NextSessionCountdown } from '@/components/next-session-countdown'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface NextSessionData {
  scheduledAt: string | null
  title: string
  description: string
  updatedAt: string
}

export function NextSessionSection() {
  const [data, setData] = useState<NextSessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchSession() {
      try {
        const res = await fetch('/api/session/next')
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) {
          setData({
            scheduledAt: json.scheduledAt ?? null,
            title: json.title ?? '',
            description: json.description ?? '',
            updatedAt: json.updatedAt ?? ''
          })
        }
      } catch (e) {
        if (!cancelled) setData(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSession()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Time to next session</h2>
          <Card className="bg-background border-border max-w-2xl mx-auto">
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const hasSession = data?.scheduledAt != null && data.scheduledAt !== ''
  const targetDate = hasSession ? new Date(data.scheduledAt!) : null
  const isPast = targetDate ? targetDate.getTime() <= Date.now() : true

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Time to next session</h2>

        <Card className="bg-background border-border max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {data?.title?.trim() ? data.title : hasSession ? 'Upcoming session' : 'Next session'}
                </CardTitle>
                <CardDescription>
                  {hasSession && !isPast
                    ? 'Countdown and details for the next scheduled session'
                    : 'No session scheduled yet. Check back later or ask your admin to set one.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <NextSessionCountdown
              scheduledAt={data?.scheduledAt ?? null}
              noSessionLabel="No upcoming session set"
            />
            {hasSession && targetDate && !isPast && (
              <>
                <div className="text-sm text-muted-foreground">
                  Session date & time:{' '}
                  <span className="text-foreground font-medium">
                    {targetDate.toLocaleString(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                {data?.title?.trim() && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                    <p className="text-foreground font-medium">{data.title}</p>
                  </div>
                )}
                {data?.description?.trim() && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-foreground text-sm whitespace-pre-wrap">{data.description}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
