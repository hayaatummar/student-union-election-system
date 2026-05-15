import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, Vote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { analyticsService } from '@/services/analyticsService'
import { electionService } from '@/services/electionService'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null)
  const [elections, setElections] = useState([])
  const [selectedElection, setSelectedElection] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getDashboard(),
      electionService.getAll({ limit: 50 }),
    ]).then(([dashRes, elecRes]) => {
      setDashboard(dashRes.data.data)
      setElections(elecRes.data.data)
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedElection) return
    analyticsService.getElectionAnalytics(selectedElection)
      .then((r) => setElectionAnalytics(r.data.data))
      .catch(() => {})
  }, [selectedElection])

  if (loading) return <LoadingSpinner className="py-20" />

  const overview = dashboard?.overview || {}
  const recentVotes = (dashboard?.recentVotes || []).map((v) => ({
    date: v.date?.slice(5, 10),
    votes: Number(v.count),
  }))
  const deptStats = (dashboard?.departmentStats || []).map((d) => ({
    name: d.department?.slice(0, 12),
    votes: Number(d.vote_count),
  }))
  const electionStats = dashboard?.electionStats || []

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Comprehensive election statistics and insights" />

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={overview.totalStudents} icon={Users} color="blue" />
        <StatCard title="Approved Candidates" value={overview.totalCandidates} icon={TrendingUp} color="green" />
        <StatCard title="Total Votes" value={overview.totalVotes} icon={Vote} color="purple" />
        <StatCard title="Active Elections" value={overview.activeElections} icon={BarChart3} color="orange" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voting Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={recentVotes}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="votes" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Votes by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Election Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Election Participation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {electionStats.map((e) => {
              const maxVotes = Math.max(...electionStats.map((x) => x._count?.votes || 0), 1)
              const pct = Math.round(((e._count?.votes || 0) / maxVotes) * 100)
              return (
                <div key={e.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-xs">{e.title}</span>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <span>{e._count?.candidates} candidates</span>
                      <span className="font-medium text-foreground">{e._count?.votes} votes</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Per-Election Analytics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Election Deep Dive</CardTitle>
          <Select value={selectedElection} onValueChange={setSelectedElection}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select election" />
            </SelectTrigger>
            <SelectContent>
              {elections.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        {electionAnalytics && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-3">Votes Over Time</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={(electionAnalytics.votesOverTime || []).map((v) => ({ date: v.date?.slice(5, 10), votes: Number(v.count) }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="votes" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Voter Turnout by Department</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(electionAnalytics.turnoutByDept || []).map((d) => ({ name: d.department?.slice(0, 10), voters: Number(d.voters) }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="voters" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
