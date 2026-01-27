'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BarChart3, RefreshCw, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function VotingResultsPage() {
  const [question, setQuestion] = useState<{ id: number; question: string } | null>(null)
  const [results, setResults] = useState<{
    optionId: number
    optionText: string
    voteCount: number
    percentage: number
  }[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadResults()
    // Poll for updates every 2 seconds
    const interval = setInterval(loadResults, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadResults = async () => {
    try {
      const response = await fetch('/api/voting/results')
      const data = await response.json()

      if (data.question) {
        setQuestion(data.question)
        setResults(data.results)
        setTotalVotes(data.totalVotes)
      } else {
        setQuestion(null)
        setResults([])
        setTotalVotes(0)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading results...</div>
      </div>
    )
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadResults}
              className="bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-background border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Voting Results</CardTitle>
                  <CardDescription>Live results update automatically</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">{question.question}</h2>
                <p className="text-muted-foreground">Total Votes: <span className="font-semibold text-foreground">{totalVotes}</span></p>
              </div>

              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.optionId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{result.optionText}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {result.voteCount} {result.voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {typeof result.percentage === 'number' ? result.percentage.toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${typeof result.percentage === 'number' ? result.percentage : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {totalVotes === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No votes yet. Be the first to vote!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
