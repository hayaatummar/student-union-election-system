import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Vote, AlertCircle, ChevronRight, ChevronLeft, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { electionService } from '@/services/electionService'
import { voteService } from '@/services/voteService'
import { getInitials, truncate } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function VotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [voteStatus, setVoteStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPositionIdx, setCurrentPositionIdx] = useState(0)
  const [selections, setSelections] = useState({}) // positionId -> candidateId
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionRes, statusRes] = await Promise.all([
          electionService.getById(id),
          voteService.checkVoteStatus(id),
        ])
        setElection(electionRes.data.data)
        setVoteStatus(statusRes.data.data)
      } catch {
        toast.error('Failed to load election')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner className="py-20" />

  if (!election) return (
    <div className="text-center py-20">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-lg font-medium">Election not found</p>
    </div>
  )

  if (election.status !== 'ACTIVE') return (
    <div className="max-w-lg mx-auto text-center py-20">
      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Voting Not Available</h2>
      <p className="text-muted-foreground">This election is currently {election.status.toLowerCase()}.</p>
      <Button className="mt-4" onClick={() => navigate('/elections')}>Back to Elections</Button>
    </div>
  )

  if (done) return (
    <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Vote Submitted!</h2>
      <p className="text-muted-foreground mb-6">Your votes have been recorded securely. Thank you for participating!</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate('/my-votes')}>View My Votes</Button>
        <Button variant="outline" onClick={() => navigate('/results')}>View Results</Button>
      </div>
    </div>
  )

  const positions = election.positions || []
  const currentPosition = positions[currentPositionIdx]
  const alreadyVotedPositionIds = voteStatus?.votedPositionIds || voteStatus?.votes?.map(v => v.positionId) || []
  const isPositionVoted = alreadyVotedPositionIds.includes(currentPosition?.id)

  const handleSelect = (positionId, candidateId) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Only submit votes for positions not already voted
      const votes = Object.entries(selections)
        .filter(([positionId]) => !alreadyVotedPositionIds.includes(positionId))
        .map(([positionId, candidateId]) => ({ electionId: id, positionId, candidateId }))

      if (votes.length === 0) {
        toast.error('No new votes to submit')
        setSubmitting(false)
        setConfirmOpen(false)
        return
      }

      for (const vote of votes) {
        await voteService.castVote(vote)
      }

      setDone(true)
      toast.success('Votes submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit votes')
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  const totalPositions = positions.length
  const progress = ((currentPositionIdx + 1) / totalPositions) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{election.title}</h1>
        <p className="text-muted-foreground">Select your preferred candidate for each position</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Position {currentPositionIdx + 1} of {totalPositions}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {positions.map((pos, i) => (
            <button
              key={pos.id}
              onClick={() => setCurrentPositionIdx(i)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                i === currentPositionIdx ? 'bg-primary text-primary-foreground border-primary' :
                selections[pos.id] ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400' :
                'border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {pos.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current Position */}
      {currentPosition && (
        <Card>
          <CardHeader>
            <CardTitle>{currentPosition.title}</CardTitle>
            <CardDescription>
              {isPositionVoted ? 'You have already voted for this position.' : 'Select one candidate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPositionVoted ? (
              <div className="flex items-center gap-2 text-green-600 py-4">
                <CheckCircle className="h-5 w-5" />
                <span>Already voted for this position</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentPosition.candidates?.filter((c) => c.status === 'APPROVED').map((candidate) => {
                  const isSelected = selections[currentPosition.id] === candidate.id
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => handleSelect(currentPosition.id, candidate.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={candidate.user?.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(candidate.user?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{candidate.user?.fullName}</p>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{candidate.user?.department}</p>
                          {candidate.manifesto && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truncate(candidate.manifesto, 80)}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {(!currentPosition.candidates || currentPosition.candidates.filter(c => c.status === 'APPROVED').length === 0) && (
                  <p className="text-muted-foreground text-sm col-span-2 py-4 text-center">No approved candidates for this position.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPositionIdx((i) => i - 1)}
          disabled={currentPositionIdx === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {currentPositionIdx < totalPositions - 1 ? (
          <Button
            onClick={() => setCurrentPositionIdx((i) => i + 1)}
            className="gap-2"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={Object.keys(selections).length === 0}
            className="gap-2"
          >
            <Vote className="h-4 w-4" /> Submit Votes
          </Button>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Votes</DialogTitle>
            <DialogDescription>Please review your selections before submitting. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(selections).map(([positionId, candidateId]) => {
              const position = positions.find((p) => p.id === positionId)
              const candidate = position?.candidates?.find((c) => c.id === candidateId)
              return (
                <div key={positionId} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm font-medium">{position?.title}</span>
                  <span className="text-sm text-muted-foreground">{candidate?.user?.fullName}</span>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Review Again</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
