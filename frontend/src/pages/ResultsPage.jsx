import { useEffect, useState } from 'react'
import { Trophy, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { electionService } from '@/services/electionService'
import { getInitials, calculatePercentage } from '@/utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ResultsPage() {
  const [elections, setElections] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [electionsLoading, setElectionsLoading] = useState(true)

  useEffect(() => {
    setElectionsLoading(true)
    electionService.getAll({ limit: 50 })
      .then((r) => {
        const list = r.data.data || []
        setElections(list)
        // Auto-select first election that has results or is active
        const preferred = list.find((e) => ['ACTIVE', 'CLOSED', 'RESULTS_PUBLISHED'].includes(e.status))
        if (preferred) setSelectedId(preferred.id)
        else if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => toast.error('Failed to load elections'))
      .finally(() => setElectionsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    setResults(null)
    electionService.getResults(selectedId)
      .then((r) => setResults(r.data.data))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }, [selectedId])

  return (
    <div className="space-y-6">
      <PageHeader title="Election Results" description="View vote counts and rankings by position" />

      <div className="flex items-center gap-3">
        <Select value={selectedId} onValueChange={setSelectedId} disabled={electionsLoading}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder={electionsLoading ? 'Loading elections...' : 'Select an election'} />
          </SelectTrigger>
          <SelectContent>
            {elections.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : !results ? (
        <EmptyState icon={BarChart3} title="Select an election" description="Choose an election above to view results." />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold">{results.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              results.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              results.status === 'RESULTS_PUBLISHED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {results.status === 'ACTIVE' ? '🔴 Live' : results.status?.replace(/_/g, ' ')}
            </span>
          </div>

          {!results.positions || results.positions.length === 0 ? (
            <EmptyState icon={BarChart3} title="No positions found" description="This election has no positions configured." />
          ) : (
            <Tabs defaultValue={results.positions[0]?.id}>
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                {results.positions.map((pos) => (
                  <TabsTrigger key={pos.id} value={pos.id} className="text-xs sm:text-sm">
                    {pos.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.positions.map((position) => {
                const totalVotes = position.candidates?.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0
                const sorted = [...(position.candidates || [])].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                const chartData = sorted.map((c) => ({
                  name: c.user?.fullName?.split(' ')[0] || 'Unknown',
                  votes: c.voteCount || 0,
                }))

                return (
                  <TabsContent key={position.id} value={position.id} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Rankings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" /> Rankings — {position.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {sorted.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4 text-sm">No approved candidates for this position.</p>
                          ) : (
                            sorted.map((candidate, idx) => {
                              const pct = calculatePercentage(candidate.voteCount || 0, totalVotes)
                              return (
                                <div key={candidate.id} className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                      idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                                      idx === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={candidate.user?.avatar} />
                                      <AvatarFallback className="text-xs">{getInitials(candidate.user?.fullName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{candidate.user?.fullName}</p>
                                      <p className="text-xs text-muted-foreground">{candidate.user?.department}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-bold">{candidate.voteCount || 0}</p>
                                      <p className="text-xs text-muted-foreground">{pct}%</p>
                                    </div>
                                  </div>
                                  <div className="ml-10">
                                    <Progress value={pct} className="h-1.5" />
                                  </div>
                                </div>
                              )
                            })
                          )}
                          <p className="text-xs text-muted-foreground text-right pt-2 border-t">
                            Total votes: <span className="font-semibold">{totalVotes}</span>
                          </p>
                        </CardContent>
                      </Card>

                      {/* Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Vote Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {chartData.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8 text-sm">No data to display.</p>
                          ) : (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                                  {chartData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}
