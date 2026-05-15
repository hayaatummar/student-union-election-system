import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Vote, Users, BarChart3, Settings, LogOut,
  GraduationCap, ClipboardList, UserCheck, FileText, Shield, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import useAuthStore from '@/context/authStore'
import { getInitials } from '@/utils/helpers'
import { cn } from '@/utils/cn'

const navItems = {
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Elections', icon: Vote, to: '/elections' },
    { label: 'Candidates', icon: UserCheck, to: '/candidates' },
    { label: 'Users', icon: Users, to: '/admin/users' },
    { label: 'Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Audit Logs', icon: FileText, to: '/admin/audit-logs' },
  ],
  CANDIDATE: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My Campaign', icon: UserCheck, to: '/candidate/profile' },
    { label: 'Elections', icon: Vote, to: '/elections' },
    { label: 'Results', icon: BarChart3, to: '/results' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Elections', icon: Vote, to: '/elections' },
    { label: 'Candidates', icon: UserCheck, to: '/candidates' },
    { label: 'My Votes', icon: ClipboardList, to: '/my-votes' },
    { label: 'Results', icon: BarChart3, to: '/results' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const items = navItems[user?.role] || navItems.STUDENT

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">UoH Elections</p>
              <p className="text-xs text-muted-foreground">Students' Union Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
            Profile Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
