import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Mock authentication - replace with real API call
    if (email && password.length >= 6) {
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'admin',
      }
      set({ user: mockUser, isAuthenticated: true })
    } else {
      throw new Error('Invalid credentials')
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },
}))
