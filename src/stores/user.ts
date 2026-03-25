import { create } from 'zustand'

interface UserState {
  userInfo: UserInfo | null
  token: string
  isLoggedIn: boolean
  setUserInfo: (info: UserInfo) => void
  setToken: (token: string) => void
  logout: () => void
}

interface UserInfo {
  id: string
  phone: string
  name: string
  avatar?: string
  email?: string
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: '',
  isLoggedIn: false,
  setUserInfo: (info) => set({ userInfo: info, isLoggedIn: true }),
  setToken: (token) => set({ token }),
  logout: () => set({ userInfo: null, token: '', isLoggedIn: false }),
}))
