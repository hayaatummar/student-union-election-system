import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
    }),
    { name: 'theme-storage' }
  )
)

export default useThemeStore
