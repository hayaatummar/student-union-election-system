import api from './api'

export const electionService = {
  getAll: (params) => api.get('/elections', { params }),
  getById: (id) => api.get(`/elections/${id}`),
  create: (data) => api.post('/elections', data),
  update: (id, data) => api.put(`/elections/${id}`, data),
  delete: (id) => api.delete(`/elections/${id}`),
  updateStatus: (id, status) => api.put(`/elections/${id}/status`, { status }),
  getResults: (id) => api.get(`/elections/${id}/results`),
}
