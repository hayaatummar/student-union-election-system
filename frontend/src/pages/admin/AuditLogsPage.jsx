import { useEffect, useState } from 'react'
import { FileText, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/common/PageHeader'
import SearchBar from '@/components/common/SearchBar'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { analyticsService } from '@/services/analyticsService'
import { formatDateTime, getRoleColor } from '@/utils/helpers'
import toast from 'react-hot-toast'

const actionColors = {
  USER_REGISTERED: 'bg-blue-100 text-blue-800',
  USER_LOGIN: 'bg-green-100 text-green-800',
  ELECTION_CREATED: 'bg-purple-100 text-purple-800',
  ELECTION_UPDATED: 'bg-yellow-100 text-yellow-800',
  ELECTION_DELETED: 'bg-red-100 text-red-800',
  ELECTION_ACTIVATED: 'bg-green-100 text-green-800',
  CANDIDATE_APPLIED: 'bg-blue-100 text-blue-800',
  CANDIDATE_APPROVED: 'bg-green-100 text-green-800',
  CANDIDATE_REJECTED: 'bg-red-100 text-red-800',
  VOTE_CAST: 'bg-indigo-100 text-indigo-800',
  PASSWORD_CHANGED: 'bg-orange-100 text-orange-800',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await analyticsService.getAuditLogs({ page, limit: 20, action: search })
      setLogs(res.data.data.logs)
      setTotalPages(res.data.data.pagination?.totalPages || 1)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [page, search])

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system activities and events" />

      <SearchBar value={search} onChange={setSearch} placeholder="Filter by action..." className="max-w-sm" />

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : logs.length === 0 ? (
        <EmptyState icon={FileText} title="No audit logs found" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Action</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">User</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Details</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">IP Address</th>
                    <th className="text-left p-4 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {log.user ? (
                          <div>
                            <p className="font-medium">{log.user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{log.user.email}</p>
                          </div>
                        ) : <span className="text-muted-foreground">System</span>}
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
