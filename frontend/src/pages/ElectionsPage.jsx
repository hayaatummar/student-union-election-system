import { useEffect, useState } from 'react'
import { Plus, Calendar, Users, Vote, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PageHeader from '@/components/common/PageHeader'
import SearchBar from '@/components/common/SearchBar'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { electionService } from '@/services/electionService'
import { formatDate, getStatusColor } from '@/utils/helpers'
import useAuthStore from '@/context/authStore'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function ElectionsPage() {
  const { user } = useAuthStore()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editElection, setEditElection] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchElections = async () => {
    setLoading(true)
    try {
      const res = await electionService.getAll({ page, limit: 9, search, status: statusFilter })
      setElections(res.data.data)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch (err) {
      toast.error('Failed to load elections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchElections() }, [page, search, statusFilter])

  const handleDelete = async () => {
    try {
      await electionService.delete(deleteId)
      toast.success('Election deleted')
      setDeleteId(null)
      fetchElections()
    } catch {
      toast.error('Failed to delete election')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await electionService.updateStatus(id, status)
      toast.success(`Election ${status.toLowerCase()}`)
      fetchElections()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Elections"
        description="Manage and participate in student union elections"
        action={user?.role === 'ADMIN' && (
          <Button onClick={() => { setEditElection(null); setShowModal(true) }} className="gap-2">
            <Plus className="h-4 w-4" /> New Election
          </Button>
        )}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search elections..." className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="RESULTS_PUBLISHED">Results Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : elections.length === 0 ? (
        <EmptyState icon={Vote} title="No elections found" description="No elections match your search criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              isAdmin={user?.role === 'ADMIN'}
              onEdit={() => { setEditElection(election); setShowModal(true) }}
              onDelete={() => setDeleteId(election.id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      {showModal && (
        <ElectionModal
          election={editElection}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchElections() }}
        />
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Election</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure? This will permanently delete the election and all associated data.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ElectionCard({ election, isAdmin, onEdit, onDelete, onStatusChange }) {
  const isActive = election.status === 'ACTIVE'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{election.title}</CardTitle>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getStatusColor(election.status)}`}>
            {election.status.replace('_', ' ')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {election.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{election.description}</p>
        )}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(election.startDate)} — {formatDate(election.endDate)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {election._count?.candidates} candidates</span>
            <span className="flex items-center gap-1"><Vote className="h-3.5 w-3.5" /> {election._count?.votes} votes</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {isAdmin ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(election.id, isActive ? 'PAUSED' : 'ACTIVE')}
              >
                {isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              {election.status === 'ACTIVE' && (
                <Link to={`/elections/${election.id}/vote`} className="flex-1">
                  <Button size="sm" className="w-full">Vote Now</Button>
                </Link>
              )}
              <Link to={`/elections/${election.id}`} className={election.status !== 'ACTIVE' ? 'flex-1' : ''}>
                <Button variant="outline" size="sm" className={election.status !== 'ACTIVE' ? 'w-full' : ''}>View</Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ElectionModal({ election, onClose, onSave }) {
  const [form, setForm] = useState({
    title: election?.title || '',
    description: election?.description || '',
    startDate: election?.startDate?.slice(0, 16) || '',
    endDate: election?.endDate?.slice(0, 16) || '',
    positions: election?.positions || [{ title: 'President', description: '' }],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (election) {
        await electionService.update(election.id, form)
        toast.success('Election updated')
      } else {
        await electionService.create(form)
        toast.success('Election created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save election')
    } finally {
      setLoading(false)
    }
  }

  const addPosition = () => setForm((f) => ({ ...f, positions: [...f.positions, { title: '', description: '' }] }))
  const removePosition = (i) => setForm((f) => ({ ...f, positions: f.positions.filter((_, idx) => idx !== i) }))
  const updatePosition = (i, field, val) => setForm((f) => ({
    ...f,
    positions: f.positions.map((p, idx) => idx === i ? { ...p, [field]: val } : p),
  }))

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{election ? 'Edit Election' : 'Create New Election'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>

          {!election && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Positions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPosition}>+ Add Position</Button>
              </div>
              {form.positions.map((pos, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    placeholder="Position title"
                    value={pos.title}
                    onChange={(e) => updatePosition(i, 'title', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={pos.description}
                    onChange={(e) => updatePosition(i, 'description', e.target.value)}
                    className="flex-1"
                  />
                  {form.positions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePosition(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : election ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
