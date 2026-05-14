import { Link } from 'react-router-dom'
import { GraduationCap, Vote, Shield, BarChart3, Users, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import useThemeStore from '@/context/themeStore'
import { Sun, Moon } from 'lucide-react'

const features = [
  { icon: Vote, title: 'Secure Voting', desc: 'One vote per student per position with duplicate prevention and audit trails.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate dashboards for admins, candidates, and students.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time vote counts and election statistics with beautiful charts.' },
  { icon: Users, title: 'Candidate Profiles', desc: 'Browse candidate manifestos, positions, and campaign materials.' },
  { icon: CheckCircle, title: 'Transparent Results', desc: 'Published results with full vote breakdowns by position.' },
  { icon: Star, title: 'Modern UI', desc: 'Clean, responsive design that works on all devices.' },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">UniElect</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Election 2024 is now active
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Student Union
            <span className="text-primary block">Election System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A modern, secure, and transparent platform for university student elections.
            Vote for your representatives with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Start Voting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[
              { label: 'Students', value: '5,000+' },
              { label: 'Candidates', value: '24' },
              { label: 'Positions', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need for a fair election</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with security, transparency, and ease of use in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make your voice heard?</h2>
          <p className="text-muted-foreground mb-8">
            Register now and participate in shaping your university's future.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Register Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 UniElect — Student Union Election System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
