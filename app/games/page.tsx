'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Gamepad2, Search, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { generateSessionId } from '@/lib/utils'

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1]
  return value ? decodeURIComponent(value) : null
}

// Quiz Game Component
function QuizGame() {
  // Initialize state with cookie value directly (lazy initialization)
  const [playerName, setPlayerName] = useState(() => getCookie('playerName') || '')
  const [nameSet, setNameSet] = useState(() => !!getCookie('playerName'))
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [sessionId] = useState(() => generateSessionId())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Sample questions (8 out of 25)
  const questions = [
    {
      id: 1,
      question: 'What is React?',
      options: ['A programming language', 'A JavaScript library for building UIs', 'A database', 'A CSS framework'],
      correct: 1
    },
    {
      id: 2,
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Programming Interface', 'Application Process Integration'],
      correct: 0
    },
    {
      id: 3,
      question: 'Which method is used to update state in React?',
      options: ['setState()', 'updateState()', 'changeState()', 'modifyState()'],
      correct: 0
    },
    {
      id: 4,
      question: 'What is the purpose of useEffect in React?',
      options: ['To style components', 'To handle side effects', 'To create components', 'To manage routing'],
      correct: 1
    },
    {
      id: 5,
      question: 'What is TypeScript?',
      options: ['A database', 'JavaScript with type definitions', 'A CSS preprocessor', 'A testing framework'],
      correct: 1
    },
    {
      id: 6,
      question: 'What is the virtual DOM?',
      options: ['A real DOM element', 'A JavaScript representation of the DOM', 'A CSS concept', 'A database table'],
      correct: 1
    },
    {
      id: 7,
      question: 'What does npm stand for?',
      options: ['Node Package Manager', 'New Package Manager', 'Network Package Manager', 'Node Program Manager'],
      correct: 0
    },
    {
      id: 8,
      question: 'What is JSX?',
      options: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'Java XML'],
      correct: 0
    }
  ]

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      // Store name in cookie
      document.cookie = `playerName=${encodeURIComponent(playerName)}; path=/; max-age=31536000` // 1 year
      setNameSet(true)
    }
  }

  const handleAnswerSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct
    if (isCorrect) {
      setScore(score + 1)
    }
    
    setShowResult(true)
    
    // Clear any existing countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    
    // Start countdown (1.5 seconds)
    let countdownValue = 1.5
    setCountdown(countdownValue)
    
    // Countdown interval (update every 0.5 seconds for smoother display)
    countdownRef.current = setInterval(() => {
      countdownValue -= 0.5
      if (countdownValue <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
        }
        setCountdown(null)
        handleNextQuestion()
      } else {
        setCountdown(countdownValue)
      }
    }, 500)
  }
  
  // Cleanup countdown on unmount or question change
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [currentQuestion])

  const handleNextQuestion = async () => {
    // Clear countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setCountdown(null)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz completed - submit score
      setIsSubmitting(true)
      setSubmitError(null)
      
      try {
        const response = await fetch('/api/quiz/submit-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerName: playerName,
            score: score,
            totalQuestions: questions.length,
            sessionId: sessionId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to submit score')
        }

        setQuizCompleted(true)
      } catch (error) {
        console.error('Error submitting score:', error)
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit score')
        // Still show completion screen even if submission fails
        setQuizCompleted(true)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizCompleted(false)
    setQuizStarted(false)
  }

  if (!nameSet) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Enter Your Name</CardTitle>
          <CardDescription>Your name will be stored and used for the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" className="w-full">Start Quiz</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (!quizStarted) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Tech Quiz</CardTitle>
          <CardDescription>Answer 8 questions from our pool of 25. Test your knowledge!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Player: <span className="font-semibold text-foreground">{playerName}</span></p>
            <p className="text-sm text-muted-foreground">Questions: 8</p>
          </div>
          <Button onClick={() => setQuizStarted(true)} className="w-full">Start Quiz</Button>
        </CardContent>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
          <CardDescription>Great job, {playerName}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 bg-card rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">{score} / {questions.length}</div>
            <div className="text-muted-foreground">Your Score</div>
            {isSubmitting && (
              <div className="mt-4 text-sm text-muted-foreground">Submitting score...</div>
            )}
            {submitError && (
              <div className="mt-4 text-sm text-red-500">⚠️ {submitError}</div>
            )}
            {!isSubmitting && !submitError && (
              <div className="mt-4 text-sm text-green-600">✓ Score submitted to leaderboard!</div>
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleRestart} className="w-full">Play Again</Button>
            <Button onClick={handleRestart} variant="outline" className="w-full">Change Name</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
          <div className="text-sm text-muted-foreground">Score: {score}</div>
        </div>
        <CardDescription>{question.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === question.correct
            const showCorrect = showResult && isCorrect
            const showIncorrect = showResult && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : showCorrect
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border bg-card hover:border-primary/50'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : showCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <span className="text-green-500">✓</span>}
                  {showIncorrect && <span className="text-red-500">✗</span>}
                </div>
              </button>
            )
          })}
        </div>
        
        <div className="space-y-3">
          {!showResult ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion} 
              className="w-full"
              disabled={countdown !== null && countdown > 0}
            >
              {currentQuestion < questions.length - 1 
                ? (countdown !== null && countdown > 0 
                    ? `Next Question (${countdown.toFixed(1)})` 
                    : 'Next Question')
                : (countdown !== null && countdown > 0 
                    ? `Finish Quiz (${countdown.toFixed(1)})` 
                    : 'Finish Quiz')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Wordsearch Game Component
function WordsearchGame() {
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  // Sample word list
  const wordsToFind = ['REACT', 'JAVASCRIPT', 'TYPESCRIPT', 'NODE', 'HTML', 'CSS', 'API', 'NPM']

  // Sample grid (15x15) - placeholder
  const grid = [
    ['R', 'E', 'A', 'C', 'T', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['J', 'A', 'V', 'A', 'S', 'C', 'R', 'I', 'P', 'T', 'H', 'I', 'J', 'K', 'L'],
    ['T', 'Y', 'P', 'E', 'S', 'C', 'R', 'I', 'P', 'T', 'M', 'N', 'O', 'P', 'Q'],
    ['N', 'O', 'D', 'E', 'X', 'Y', 'Z', 'A', 'B', 'C', 'R', 'S', 'T', 'U', 'V'],
    ['H', 'T', 'M', 'L', 'X', 'Y', 'Z', 'A', 'B', 'C', 'W', 'X', 'Y', 'Z', 'A'],
    ['C', 'S', 'S', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'B', 'C', 'D', 'E', 'F'],
    ['A', 'P', 'I', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'G', 'H', 'I', 'J', 'K'],
    ['N', 'P', 'M', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'L', 'M', 'N', 'O', 'P'],
    ['X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Q', 'R', 'S', 'T', 'U'],
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'V', 'W', 'X', 'Y', 'Z'],
    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'A', 'B', 'C', 'D', 'E'],
    ['U', 'V', 'W', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J'],
    ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
    ['T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
  ]

  const handleStartGame = () => {
    setGameStarted(true)
  }

  if (!gameStarted) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Wordsearch</CardTitle>
          <CardDescription>Find all the hidden words in the grid!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-card rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">Words to find:</p>
            <div className="flex flex-wrap gap-2">
              {wordsToFind.map((word, index) => (
                <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {word}
                </span>
              ))}
            </div>
          </div>
          <Button onClick={handleStartGame} className="w-full">Start Game</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wordsearch</CardTitle>
          <div className="text-sm text-muted-foreground">
            Found: {foundWords.length} / {wordsToFind.length}
          </div>
        </div>
        <CardDescription>Click and drag to select words</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-card rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-2">Words to find:</p>
          <div className="flex flex-wrap gap-2">
            {wordsToFind.map((word, index) => (
              <span 
                key={index} 
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  foundWords.includes(word)
                    ? 'bg-green-500/20 text-green-600 line-through'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="border-2 border-border rounded-lg p-4 bg-card overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-8 h-8 flex items-center justify-center text-sm font-semibold bg-background border border-border rounded hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  {cell}
                </div>
              ))
            )}
          </div>
        </div>

        {foundWords.length === wordsToFind.length && (
          <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-center">
            <p className="text-green-600 font-semibold">🎉 Congratulations! You found all words!</p>
            <Button onClick={() => { setGameStarted(false); setFoundWords([]) }} className="mt-4 w-full" variant="outline">
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface LeaderboardEntry {
  rank: number
  player_name: string
  score: number
  game: string
}

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<'quiz' | 'wordsearch' | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true)
      
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
        wordsearchData.leaderboard.slice(0, 2).forEach((entry: any) => {
          combined.push({
            rank: combined.length + 1,
            player_name: entry.player_name,
            score: entry.completion_time, // Use completion time as score (lower is better)
            game: 'Wordsearch'
          })
        })
      }
      
      setLeaderboard(combined.slice(0, 5))
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoadingLeaderboard(false)
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
          <Link href="/">
            <Button 
              variant="outline"
              className="bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance">
              Play
              <span className="block text-primary">Games</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Test your knowledge, challenge yourself, and compete on the leaderboard!
            </p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {!activeGame ? (
            <>
              {/* Leaderboard Section */}
              <div className="mb-12">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-secondary" />
                      </div>
                      <CardTitle>Top Players</CardTitle>
                    </div>
                    <CardDescription>See who's leading the competition!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLeaderboard ? (
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

              {/* Game Selection Cards */}
              <div className="grid md:grid-cols-2 gap-8">
              <Card 
                className="bg-background border-border p-8 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setActiveGame('quiz')}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Answer 8 questions from our pool of 25. Test your programming knowledge and compete on the leaderboard!
                </p>
                <Button className="w-full">Play Quiz</Button>
              </Card>

              <Card 
                className="bg-background border-border p-8 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setActiveGame('wordsearch')}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wordsearch</h3>
                <p className="text-muted-foreground mb-4">
                  Find all the hidden words in the grid. Challenge yourself with tech-related terms!
                </p>
                <Button variant="secondary" className="w-full">Play Wordsearch</Button>
              </Card>
              </div>
            </>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveGame(null)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              
              {activeGame === 'quiz' && <QuizGame />}
              {activeGame === 'wordsearch' && <WordsearchGame />}
            </div>
          )}
        </div>
      </section>

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
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
                <li><Link href="/games" className="hover:text-primary transition-colors">Games</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Classes</Link></li>
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
