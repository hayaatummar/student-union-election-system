import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const timeAgo = (date) => {
  if (!date) return 'N/A'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isElectionActive = (election) => {
  if (!election) return false
  const now = new Date()
  return (
    election.status === 'ACTIVE' &&
    isAfter(now, new Date(election.startDate)) &&
    isBefore(now, new Date(election.endDate))
  )
}

export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    RESULTS_PUBLISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getRoleColor = (role) => {
  const colors = {
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    CANDIDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const truncate = (str, length = 100) => {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}
