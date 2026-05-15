import { Link } from 'react-router-dom'
import { GraduationCap, Vote, Shield, BarChart3, Users, CheckCircle, ArrowRight, MapPin, Calendar, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import useThemeStore from '@/context/themeStore'
import { Sun, Moon } from 'lucide-react'

const features = [
  { icon: Vote,        title: 'Secure Voting',        desc: 'One vote per student per position. Duplicate prevention enforced at database level with full audit trail.' },
  { icon: Shield,      title: 'Role-Based Access',    desc: 'Separate dashboards for Election Commission, candidates, and student voters.' },
  { icon: BarChart3,   title: 'Live Analytics',       desc: 'Real-time vote counts and election statistics with charts — updated as votes come in.' },
  { icon: Users,       title: 'Candidate Profiles',   desc: 'Browse manifestos, party affiliations, positions, and campaign materials for all 169 candidates.' },
  { icon: CheckCircle, title: 'Transparent Results',  desc: 'Published results with full vote breakdowns by position and party alliance.' },
  { icon: Award,       title: 'Alliance Tracking',    desc: 'Track ABVP–SLVD, BSF–DSU–SFI–TSF, ASA–AISA–Fraternity–MSF and all other alliances.' },
]

const parties = [
  { name: 'ABVP',     full: 'Akhil Bharatiya Vidyarthi Parishad',    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',  ideology: 'Right / Nationalist' },
  { name: 'SLVD',     full: 'Sevalal Vidyarthi Dal',                  color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',  ideology: 'OBC / Tribal Rights' },
  { name: 'SFI',      full: 'Students\' Federation of India',         color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',              ideology: 'Left / CPI(M)' },
  { name: 'ASA',      full: 'Ambedkar Students\' Association',        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',          ideology: 'Ambedkarite / Dalit' },
  { name: 'AISA',     full: 'All India Students\' Association',       color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',              ideology: 'Left / CPI(ML)' },
  { name: 'NSUI',     full: 'National Students\' Union of India',     color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',              ideology: 'Congress-backed' },
  { name: 'DSU',      full: 'Democratic Students\' Union',            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',  ideology: 'Left / Ambedkarite' },
  { name: 'BSF',      full: 'Bahujan Students\' Front',               color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',  ideology: 'Bahujan / BSP-linked' },
  { name: 'MSF',      full: 'Muslim Students Federation',             color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',      ideology: 'Minority Rights' },
  { name: 'PDSU',     full: 'Progressive Democratic Students Union',  color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',          ideology: 'Progressive / Left' },
  { name: 'TSF',      full: 'Telangana Students\' Front',             color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',          ideology: 'Telangana Regional' },
  { name: 'AIOBCSA', full: 'All India OBC Students Association',      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',  ideology: 'OBC Rights' },
]

const winners2025 = [
  { position: 'President',          name: 'Siva Palepu',    alliance: 'ABVP–SLVD' },
  { position: 'Vice President',     name: 'Debendra',       alliance: 'ABVP–SLVD' },
  { position: 'General Secretary',  name: 'Shruti Priya',   alliance: 'ABVP–SLVD' },
  { position: 'Joint Secretary',    name: 'Saurabh Shukla', alliance: 'ABVP–SLVD' },
  { position: 'Sports Secretary',   name: 'Jwala',          alliance: 'ABVP–SLVD' },
  { position: 'Cultural Secretary', name: 'Venus',          alliance: 'ABVP–SLVD' },
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
              <div>
                <span className="font-bold text-base leading-none">UoH Election Portal</span>
                <p className="text-xs text-muted-foreground leading-none hidden sm:block">University of Hyderabad</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register to Vote</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Students' Union Election 2025–26 is now ACTIVE
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            University of Hyderabad
            <span className="text-primary block mt-1">Students' Union Elections</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
            The official digital voting platform for UoH / HCU student union elections.
            Secure, transparent, and accessible to every registered student.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <MapPin className="h-4 w-4" />
            <span>Prof. C.R. Rao Road, Gachibowli, Hyderabad — 500046</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Register to Vote <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">View Results & Candidates</Button>
            </Link>
          </div>

          {/* Election Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16">
            {[
              { label: 'Candidates',     value: '169' },
              { label: 'Voter Turnout',  value: '81%+' },
              { label: 'Polling Booths', value: '29' },
              { label: 'Positions',      value: '6' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2025-26 Winners */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-1.5 text-sm font-medium mb-4">
              <Award className="h-4 w-4" /> ABVP–SLVD Alliance Victory
            </div>
            <h2 className="text-3xl font-bold mb-2">Election Results 2025–26</h2>
            <p className="text-muted-foreground">Winning candidates of the University of Hyderabad Students' Union</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {winners2025.map((w) => (
              <Card key={w.position} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{w.position}</p>
                  <p className="text-lg font-bold">{w.name}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 font-medium">
                    {w.alliance}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Ananya Dash (BSF-HCU alliance) contested for President and lost by a narrow margin.
          </p>
        </div>
      </section>

      {/* Student Organizations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Student Organizations at UoH</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              12 major student organizations and alliances contest elections every year at the University of Hyderabad.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((p) => (
              <Card key={p.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className={`text-xs px-2 py-1 rounded font-bold flex-shrink-0 ${p.color}`}>{p.name}</span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{p.full}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.ideology}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Alliances 2025-26 */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Alliance Map — 2025–26</h2>
            <p className="text-muted-foreground">Three major alliances contested the 2025–26 election</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-t-4 border-t-orange-500">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-1">ABVP – SLVD Alliance</h3>
                <p className="text-xs text-muted-foreground mb-3">Right / Nationalist + OBC-Tribal Rights</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">🏆 Won all 6 positions</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>President: Siva Palepu</li>
                  <li>Vice President: Debendra</li>
                  <li>Gen. Secretary: Shruti Priya</li>
                  <li>Joint Secretary: Saurabh Shukla</li>
                  <li>Sports Secretary: Jwala</li>
                  <li>Cultural Secretary: Venus</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-red-500">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-1">BSF – DSU – SFI – TSF Alliance</h3>
                <p className="text-xs text-muted-foreground mb-3">Left + Bahujan + Telangana Regional</p>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">Runner-up in most positions</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>President: Ananya Dash</li>
                  <li>Vice President: Diwakar</li>
                  <li>+ candidates in all other posts</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-blue-500">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-1">ASA – AISA – Fraternity – MSF</h3>
                <p className="text-xs text-muted-foreground mb-3">Ambedkarite + Left + Minority Rights</p>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Third-largest vote share</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>Gen. Secretary: Mohammed Shadil</li>
                  <li>+ candidates in all other posts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Platform Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for the University of Hyderabad's complex multi-party election environment.
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
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make your vote count at UoH</h2>
          <p className="text-muted-foreground mb-8">
            Register with your UoH student ID and email to participate in the 2025–26 Students' Union Election.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Register Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Already registered? Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <GraduationCap className="h-4 w-4 text-primary" />
            University of Hyderabad — Students' Union Election Portal
          </div>
          <p className="text-xs text-muted-foreground">
            Prof. C.R. Rao Road, Gachibowli, Hyderabad — 500046, Telangana, India
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 UoH Election Commission. For official results visit{' '}
            <a href="https://uohyd.ac.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">uohyd.ac.in</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
