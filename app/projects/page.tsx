import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Calendar, DollarSign, MessageSquare, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const projects = [
    {
      id: 'daily-planner',
      title: 'Build a Daily Planner with AI',
      description: 'Create an intelligent daily planner that helps you organize your tasks, schedule meetings, and optimize your day using AI-powered suggestions.',
      icon: Calendar,
      color: 'primary',
      features: [
        'AI-powered task prioritization',
        'Smart scheduling suggestions',
        'Calendar integration',
        'Daily goal tracking',
        'Reminder notifications'
      ],
      difficulty: 'Intermediate',
      duration: '2-3 weeks',
      tech: ['React', 'Next.js', 'OpenAI API', 'LocalStorage']
    },
    {
      id: 'budget-app',
      title: 'Build a Personal Budget App with AI',
      description: 'Develop a smart budgeting application that analyzes your spending patterns and provides personalized financial advice using AI.',
      icon: DollarSign,
      color: 'secondary',
      features: [
        'Expense tracking and categorization',
        'AI spending analysis',
        'Budget recommendations',
        'Financial goal setting',
        'Spending predictions'
      ],
      difficulty: 'Intermediate',
      duration: '3-4 weeks',
      tech: ['React', 'Next.js', 'OpenAI API', 'Chart.js']
    },
    {
      id: 'personal-assistant',
      title: 'Build Your Own Personal Assistant with AI',
      description: 'Design and build a custom AI assistant that can help with tasks, answer questions, manage your schedule, and learn from your preferences.',
      icon: MessageSquare,
      color: 'primary',
      features: [
        'Natural language processing',
        'Task management',
        'Voice interaction',
        'Personalized responses',
        'Multi-platform support'
      ],
      difficulty: 'Advanced',
      duration: '4-5 weeks',
      tech: ['React', 'Next.js', 'OpenAI API', 'Web Speech API']
    }
  ]

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
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Projects</span>
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-balance">
              Project
              <span className="block text-primary">Guides</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Step-by-step guides to build real-world applications with AI integration. Learn by building projects that solve real problems.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project) => {
              const Icon = project.icon
              const isPrimary = project.color === 'primary'
              
              return (
                <Card 
                  key={project.id} 
                  className="bg-background border-border hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 ${isPrimary ? 'bg-primary/10' : 'bg-secondary/10'} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${isPrimary ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Key Features:</h4>
                        <ul className="space-y-1.5">
                          {project.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isPrimary ? 'bg-primary' : 'bg-secondary'}`} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Difficulty</div>
                            <div className="font-semibold text-foreground">{project.difficulty}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Duration</div>
                            <div className="font-semibold text-foreground">{project.duration}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <div className="text-muted-foreground text-sm mb-2">Technologies:</div>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, idx) => (
                            <span 
                              key={idx}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                isPrimary 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-secondary/10 text-secondary'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full mt-auto ${isPrimary ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'} text-primary-foreground`}
                    >
                      Start Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-primary-foreground">
              Ready to Start Building?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Choose a project guide and start building real applications with AI today.
            </p>
          </div>
          <Link href="/">
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white hover:bg-white/90 text-primary h-12 px-10 text-base font-semibold"
            >
              Explore More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
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
                <li><Link href="#" className="hover:text-primary transition-colors">Games</Link></li>
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
