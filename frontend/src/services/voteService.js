import api from './api'

export const voteService = {
  castVote: (data) => api.post('/votes', data),
  getMyVotes: () => api.get('/votes/my-votes'),
  checkVoteStatus: (electionId) => api.get(`/votes/check/${electionId}`),
  getElectionVotes: (electionId) => api.get(`/votes/election/${electionId}`),
}
