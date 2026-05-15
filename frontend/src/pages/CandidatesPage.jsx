import { useEffect, useState } from 'react'
import { UserCheck, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PageHeader from '@/components/common/PageHeader'
import SearchBar from '@/components/common/SearchBar'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { candidateService } from '@/services/candidateService'
import { electionService } from '@/services/electionService'
import { getInitials, getStatusColor, truncate } from '@/utils/helpers'
import useAuthStore from '@/context/authStore'
import toast from 'react-hot-toast'

export default function CandidatesPage() {
  const { user } = useAuthStore()
  const [candidates, setCandidates] = useState([])
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(user?.role === 'ADMIN' ? 'all' : 'APPROVED')
  const [electionFilter, setElectionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    electionService.getAll({ limit: 50 })
      .then((r) => setElections(r.data.data || []))
      .catch(() => {})
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, search }
      if (statusFilter !== 'all') params.status = statusFilter
      if (electionFilter !== 'all') params.electionId = electionFilter
      const res = await candidateService.getAll(params)
      setCandidates(res.data.data || [])
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCandidates() }, [page, search, statusFilter, electionFilter])

  const handleStatusChange = async (id, status) => {
    try {
      await candidateService.updateStatus(id, status)
      toast.success(`Candidate ${status.toLowerCase()}`)
      fetchCandidates()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Candidates" description="Browse and manage election candidates" />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search candidates..." className="flex-1" />
        <Select value={electionFilter} onValueChange={setElectionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Elections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Elections</SelectItem>
            {elections.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {user?.role === 'ADMIN' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : candidates.length === 0 ? (
        <EmptyState icon={UserCheck} title="No candidates found" description="No candidates match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              isAdmin={user?.role === 'ADMIN'}
              onView={() => setSelected(c)}
              onApprove={() => handleStatusChange(c.id, 'APPROVED')}
              onReject={() => handleStatusChange(c.id, 'REJECTED')}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selected && (
        <CandidateDetailModal candidate={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function CandidateCard({ candidate, isAdmin, onView, onApprove, onReject }) {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {candidate.campaignPoster && (
        <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          <img src={candidate.campaignPoster} alt="poster" className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={candidate.user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(candidate.user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{candidate.user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{candidate.position?.title}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(candidate.status)}`}>
            {candidate.status}
          </span>
          <span className="text-xs text-muted-foreground">{candidate.voteCount} votes</span>
        </div>

        {candidate.manifesto && (
          <p className="text-xs text-muted-foreground line-clamp-2">{truncate(candidate.manifesto, 80)}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Button>
          {isAdmin && candidate.status === 'PENDING' && (
            <>
              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 border-green-200" onClick={onApprove} title="Approve">
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive border-red-200" onClick={onReject} title="Reject">
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CandidateDetailModal({ candidate, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {candidate.campaignPoster && (
            <img src={candidate.campaignPoster} alt="Campaign poster" className="w-full h-40 object-cover rounded-lg" />
          )}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={candidate.user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(candidate.user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{candidate.user?.fullName}</h3>
              <p className="text-muted-foreground text-sm">{candidate.user?.department}</p>
              <p className="text-sm font-medium text-primary">{candidate.position?.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Election: </span><span className="font-medium">{candidate.election?.title}</span></div>
            <div><span className="text-muted-foreground">Year: </span><span className="font-medium">{candidate.year || 'N/A'}</span></div>
            <div><span className="text-muted-foreground">Semester: </span><span className="font-medium">{candidate.semester || 'N/A'}</span></div>
            <div><span className="text-muted-foreground">Votes: </span><span className="font-bold text-primary">{candidate.voteCount}</span></div>
          </div>

          {candidate.manifesto && (
            <div>
              <p className="text-sm font-medium mb-1">Manifesto</p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{candidate.manifesto}</p>
            </div>
          )}

          {candidate.socialLinks && Object.keys(candidate.socialLinks).filter(k => candidate.socialLinks[k]).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Social Links</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(candidate.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded border hover:bg-accent capitalize text-primary">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
