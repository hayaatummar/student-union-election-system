import { cn } from '@/utils/cn'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizes[size])} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  )
}
