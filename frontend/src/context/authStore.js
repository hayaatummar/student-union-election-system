import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const res = await authService.login(credentials)
          const { user, token } = res.data.data
          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const res = await authService.register(data)
          const { user, token } = res.data.data
          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const res = await authService.getMe()
          set({ user: res.data.data })
        } catch (error) {
          get().logout()
        }
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
