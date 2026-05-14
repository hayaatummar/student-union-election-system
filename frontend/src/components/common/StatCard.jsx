import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

export default function StatCard({ title, value, icon: Icon, description, trend, color = 'blue', loading }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-16" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="skeleton h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value?.toLocaleString() ?? '—'}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend !== undefined && (
              <p className={cn('text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-lg p-3', colors[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
