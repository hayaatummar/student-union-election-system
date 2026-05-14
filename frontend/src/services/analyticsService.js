import api from './api'

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getElectionAnalytics: (id) => api.get(`/analytics/election/${id}`),
  getAuditLogs: (params) => api.get('/analytics/audit-logs', { params }),
}
