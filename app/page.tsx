'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Gamepad2, Trophy, Vote, Zap } from 'lucide-react'
import { NextSessionSection } from '@/components/next-session-section'
import { NextSessionWidget } from '@/components/next-session-widget'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  player_name: string
  score: number
  game: string
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      
      // Fetch quiz leaderboard
      const quizResponse = await fetch('/api/quiz/leaderboard?limit=3')
      const quizData = await quizResponse.json()
      
      // Fetch wordsearch leaderboard
      const wordsearchResponse = await fetch('/api/wordsearch/leaderboard?limit=2')
      const wordsearchData = await wordsearchResponse.json()
      
      // Combine and format leaderboard entries
      const combined: LeaderboardEntry[] = []
      
      // Add top 3 quiz scores
      if (quizData.leaderboard) {
        quizData.leaderboard.slice(0, 3).forEach((entry: any) => {
          combined.push({
            rank: entry.rank,
            player_name: entry.player_name,
            score: entry.score,
            game: 'Quiz Game'
          })
        })
      }
      
      // Add top 2 wordsearch scores
      if (wordsearchData.leaderboard) {
        wordsearchData.leaderboard.slice(0, 2).forEach((entry: any, index: number) => {
          combined.push({
            rank: combined.length + 1,
            player_name: entry.player_name,
            score: entry.completion_time, // Use completion time as score (lower is better)
            game: 'Wordsearch'
          })
        })
      }
      
      // Sort by score (higher is better, but wordsearch uses time so we'll show them separately)
      // For now, just show quiz first, then wordsearch
      setLeaderboard(combined.slice(0, 5))
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      // Fallback to empty array or show error
    } finally {
      setIsLoading(false)
    }
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
          <NextSessionWidget />
        </div>
      </nav>

      {/* Hero Section - Welcome */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="rounded-lg border border-border bg-muted/30 p-3 shadow-sm">
              <Image
                src="/qr.gif"
                alt="Scan to visit this site"
                width={160}
                height={160}
                className="rounded"
                priority
              />
              <p className="text-sm text-muted-foreground mt-2">Scan to visit</p>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance">
              Welcome to The
              <span className="block text-primary">Pathways Software Dev Department</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Explore innovative projects, compete in games, join classes, and participate in our community. Your journey in software development starts here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/projects">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
              >
                Explore Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/games">
              <Button 
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-transparent"
              >
                Play Games
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Play Games Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Play Games</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/games">
              <Card className="bg-background border-border p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Answer 8 questions from our pool of 25. Test your knowledge and compete on the leaderboard!
                </p>
                <Button variant="outline" className="w-full">
                  Play Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </Link>

            <Link href="/games">
              <Card className="bg-background border-border p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Gamepad2 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wordsearch</h3>
                <p className="text-muted-foreground mb-4">
                  Find all the hidden words in the grid. Challenge yourself with tech-related terms!
                </p>
                <Button variant="outline" className="w-full">
                  Play Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Games Leaderboard Section */}
      <section className="bg-card py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Games Leaderboard</h2>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-background border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-secondary" />
                  </div>
                  <CardTitle>Top Players</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading leaderboard...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No scores yet. Be the first to play!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((player) => (
                      <div key={`${player.rank}-${player.player_name}`} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1 ? 'bg-secondary text-secondary-foreground' :
                          player.rank === 2 ? 'bg-muted text-muted-foreground' :
                          player.rank === 3 ? 'bg-primary/20 text-primary' :
                          'bg-background text-foreground'
                        }`}>
                          {player.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{player.player_name}</div>
                          <div className="text-sm text-muted-foreground">{player.game}</div>
                        </div>
                        <div className="font-bold text-primary">
                          {player.game === 'Wordsearch' 
                            ? `${player.score}s` 
                            : `${player.score} pts`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voting Widget Section */}
      <section className="bg-card py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Community Vote</h2>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-background border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Vote className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Community Voting</CardTitle>
                    <CardDescription>Cast your vote and help shape our next project</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Participate in our community voting system. Admin sets questions and you vote on your preferred option.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/voting" className="flex-1">
                      <Button className="w-full">
                        <Vote className="w-4 h-4 mr-2" />
                        Vote Now
                      </Button>
                    </Link>
                    <Link href="/voting/results" className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Time to next session */}
      <NextSessionSection />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Pathways Software Dev</span>
              </div>
              <p className="text-sm text-muted-foreground">Building the future of software development education.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Games</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Classes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:dev@pathways.edu" className="hover:text-primary transition-colors">Email</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Get updates about new projects and classes</p>
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-3 py-2 rounded bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 Pathways Software Dev Department. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
