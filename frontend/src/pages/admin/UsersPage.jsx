import { useEffect, useState } from 'react'
import { Users, Pencil, Trash2, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/common/PageHeader'
import SearchBar from '@/components/common/SearchBar'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { userService } from '@/services/userService'
import { getInitials, getRoleColor, formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'
import useAuthStore from '@/context/authStore'

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editUser, setEditUser] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await userService.getAll({ page, limit: 10, search, role: roleFilter })
      setUsers(res.data.data)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, search, roleFilter])

  const handleDelete = async () => {
    try {
      await userService.delete(deleteId)
      toast.success('User deleted')
      setDeleteId(null)
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await userService.update(id, data)
      toast.success('User updated')
      setEditUser(null)
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage all registered users" />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="flex-1" />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="CANDIDATE">Candidate</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Student ID</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Department</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="text-xs">{getInitials(u.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.fullName}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-muted-foreground">{u.studentId || '—'}</td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{u.department || '—'}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(u.role)}`}>{u.role}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">{formatDate(u.createdAt)}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditUser(u)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {u.id !== currentUser?.id && (
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(u.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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

      {/* Edit Modal */}
      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleUpdate} />
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    department: user.department || '',
    role: user.role,
    isActive: user.isActive,
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CANDIDATE">Candidate</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(user.id, form)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
