'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Lock, Save, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdminSessionPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const authToken = sessionStorage.getItem('adminAuth')
    if (authToken) {
      setIsAuthenticated(true)
      loadSession()
    }
  }, [])

  const loadSession = async () => {
    try {
      const token = sessionStorage.getItem('adminAuth')
      const response = await fetch('/api/admin/session/next', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        if (data.scheduledAt) {
          const d = new Date(data.scheduledAt)
          setScheduledAt(d.toISOString().slice(0, 16))
        } else {
          setScheduledAt('')
        }
      }
    } catch (e) {
      console.error('Error loading session:', e)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await fetch('/api/admin/session/next', {
        headers: { Authorization: `Bearer ${password}` }
      })
      if (response.ok) {
        setIsAuthenticated(true)
        sessionStorage.setItem('adminAuth', password)
        await loadSession()
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Failed to authenticate')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem('adminAuth')
      const payload: { scheduledAt?: string; title: string; description: string } = {
        title: title.trim(),
        description: description.trim()
      }
      if (scheduledAt.trim()) {
        payload.scheduledAt = new Date(scheduledAt).toISOString()
      }
      const response = await fetch('/api/admin/session/next', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess('Next session updated successfully.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update session')
      }
    } catch {
      setError('Failed to update session')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter admin password to manage next session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Admin - Next Session</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem('adminAuth')
                setIsAuthenticated(false)
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Next Session</h1>
            <p className="text-muted-foreground">
              Set the date/time, title, and description for the next session. This powers the countdown on the home page.
            </p>
          </div>

          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle>Session details</CardTitle>
              <CardDescription>
                Leave date/time empty to hide the countdown until you set a session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date & time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Session title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. React Hooks Workshop"
                    className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the session..."
                    className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-600 text-sm">
                    {success}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save next session'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
