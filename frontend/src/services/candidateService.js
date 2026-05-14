import api from './api'

export const candidateService = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  getMyProfile: () => api.get('/candidates/me'),
  apply: (data) => api.post('/candidates/apply', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProfile: (data) => api.put('/candidates/profile/update', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, status) => api.put(`/candidates/${id}/status`, { status }),
}
