import { useEffect, useState } from 'react'
import { CheckCircle, Vote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { voteService } from '@/services/voteService'
import { formatDateTime, getInitials } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function MyVotesPage() {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    voteService.getMyVotes()
      .then((r) => setVotes(r.data.data))
      .catch(() => toast.error('Failed to load votes'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="My Votes" description="Your complete voting history" />

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : votes.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No votes yet"
          description="You haven't voted in any elections yet. Participate in active elections to see your history here."
        />
      ) : (
        <div className="space-y-3">
          {votes.map((vote) => (
            <Card key={vote.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={vote.candidate?.user?.avatar} />
                      <AvatarFallback className="text-xs">{getInitials(vote.candidate?.user?.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{vote.candidate?.user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {vote.candidate?.position?.title} · {vote.election?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="success">Voted</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(vote.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
