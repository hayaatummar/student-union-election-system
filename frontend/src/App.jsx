import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'

// Route guard
import ProtectedRoute from './routes/ProtectedRoute'

// Public pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Protected pages
import DashboardPage from './pages/DashboardPage'
import ElectionsPage from './pages/ElectionsPage'
import VotePage from './pages/VotePage'
import CandidatesPage from './pages/CandidatesPage'
import ResultsPage from './pages/ResultsPage'
import MyVotesPage from './pages/MyVotesPage'
import ProfilePage from './pages/ProfilePage'
import AnalyticsPage from './pages/AnalyticsPage'

// Admin pages
import UsersPage from './pages/admin/UsersPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'

// Candidate pages
import CandidateProfilePage from './pages/candidate/CandidateProfilePage'

// Stores
import useAuthStore from './context/authStore'
import useThemeStore from './context/themeStore'

function App() {
  const { isAuthenticated, refreshUser } = useAuthStore()
  const { theme } = useThemeStore()

  // Apply theme on app load
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  // Refresh user data on app load
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/elections" element={<ElectionsPage />} />
          <Route path="/elections/:id/vote" element={<VotePage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/my-votes" element={<MyVotesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin only */}
          <Route path="/analytics" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          } />

          {/* Candidate only */}
          <Route path="/candidate/profile" element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateProfilePage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
