import { useEffect, useState } from 'react'
import { Users, Vote, BarChart3, Activity, TrendingUp, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import StatCard from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useAuthStore from '@/context/authStore'
import { analyticsService } from '@/services/analyticsService'
import { electionService } from '@/services/electionService'
import { voteService } from '@/services/voteService'
import { formatDate, getStatusColor } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [elections, setElections] = useState([])
  const [myVotes, setMyVotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN') {
          const [statsRes, electionsRes] = await Promise.all([
            analyticsService.getDashboard(),
            electionService.getAll({ limit: 5 }),
          ])
          setStats(statsRes.data.data)
          setElections(electionsRes.data.data || [])
        } else {
          const [electionsRes, votesRes] = await Promise.all([
            electionService.getAll({ status: 'ACTIVE', limit: 5 }),
            voteService.getMyVotes(),
          ])
          setElections(electionsRes.data.data || [])
          setMyVotes(votesRes.data.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (user?.role === 'ADMIN') {
    return <AdminDashboard stats={stats} elections={elections} loading={loading} />
  }

  return <StudentDashboard elections={elections} myVotes={myVotes} loading={loading} user={user} />
}

function AdminDashboard({ stats, elections, loading }) {
  const overview = stats?.overview || {}
  const recentVotes = (stats?.recentVotes || []).map((v) => ({
    date: v.date?.slice(5, 10),
    votes: Number(v.count),
  }))
  const deptStats = (stats?.departmentStats || []).map((d) => ({
    name: d.department?.slice(0, 10),
    votes: Number(d.vote_count),
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the election system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={overview.totalStudents} icon={Users} color="blue" loading={loading} />
        <StatCard title="Approved Candidates" value={overview.totalCandidates} icon={Activity} color="green" loading={loading} />
        <StatCard title="Total Votes Cast" value={overview.totalVotes} icon={Vote} color="purple" loading={loading} />
        <StatCard title="Active Elections" value={overview.activeElections} icon={BarChart3} color="orange" loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Votes Over Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={recentVotes}>
                <defs>
                  <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="votes" stroke="#3b82f6" fill="url(#voteGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Votes by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Elections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Elections</CardTitle>
          <Link to="/elections"><Button variant="outline" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elections.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.startDate)} — {formatDate(e.endDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{e._count?.votes} votes</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(e.status)}`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentDashboard({ elections, myVotes, loading, user }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Your election dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Elections" value={elections.length} icon={Vote} color="blue" loading={loading} />
        <StatCard title="Votes Cast" value={myVotes.length} icon={Activity} color="green" loading={loading} />
        <StatCard title="Positions Voted" value={myVotes.length} icon={TrendingUp} color="purple" loading={loading} />
      </div>

      {/* Active Elections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Active Elections</CardTitle>
            <CardDescription>Elections you can participate in</CardDescription>
          </div>
          <Link to="/elections"><Button variant="outline" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent>
          {elections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active elections at the moment.</p>
          ) : (
            <div className="space-y-3">
              {elections.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Ends {formatDate(e.endDate)}
                    </p>
                  </div>
                  <Link to={`/elections/${e.id}/vote`}>
                    <Button size="sm">Vote Now</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Votes */}
      {myVotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Recent Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myVotes.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{v.candidate?.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{v.candidate?.position?.title} · {v.election?.title}</p>
                  </div>
                  <Badge variant="success">Voted</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
