'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, Vote, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { generateSessionId } from '@/lib/utils'

export default function VotingPage() {
  const [question, setQuestion] = useState<{ id: number; question: string } | null>(null)
  const [options, setOptions] = useState<{ id: number; text: string }[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('votingSessionId')
      if (stored) return stored
      const newId = generateSessionId()
      sessionStorage.setItem('votingSessionId', newId)
      return newId
    }
    return generateSessionId()
  })

  useEffect(() => {
    loadQuestion()
  }, [])

  const loadQuestion = async () => {
    try {
      const response = await fetch('/api/voting/question')
      const data = await response.json()

      if (data.question) {
        setQuestion(data.question)
        setOptions(data.options)
      }
    } catch (error) {
      console.error('Error loading question:', error)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || !question) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          optionId: selectedOption,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setHasVoted(true)
      } else {
        setError(data.error || 'Failed to submit vote')
        if (data.error?.includes('already voted')) {
          setHasVoted(true)
        }
      }
    } catch (error) {
      setError('Failed to submit vote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">No active voting question at the moment.</p>
              <Link href="/">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Thank you for voting!</h2>
              <p className="text-muted-foreground">Your vote has been recorded.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/voting/results">
                  <Button>View Results</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Pathways Software Dev</span>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-background border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>Select an option below</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">{question.question}</h2>
              </div>

              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOption === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                        selectedOption === option.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {selectedOption === option.id ? '✓' : ''}
                      </div>
                      <span className="flex-1 text-lg">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVote}
                disabled={!selectedOption || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
