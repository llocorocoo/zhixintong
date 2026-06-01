import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

interface UserState {
  userInfo: UserInfo | null
  token: string
  isLoggedIn: boolean
  enhancementPending: boolean
  setUserInfo: (info: UserInfo) => void
  setToken: (token: string) => void
  setEnhancementPending: (v: boolean) => void
  logout: () => void
}

interface UserInfo {
  id: string
  phone: string
  name: string
  avatar?: string
  email?: string
}

const taroStorage = {
  getItem: (name: string) => {
    return Taro.getStorageSync(name) || null
  },
  setItem: (name: string, value: string) => {
    Taro.setStorageSync(name, value)
  },
  removeItem: (name: string) => {
    Taro.removeStorageSync(name)
  },
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: '',
      isLoggedIn: false,
      enhancementPending: false,
      setUserInfo: (info) => set({ userInfo: info, isLoggedIn: true }),
      setToken: (token) => set({ token }),
      setEnhancementPending: (v) => set({ enhancementPending: v }),
      logout: () => set({ userInfo: null, token: '', isLoggedIn: false, enhancementPending: false }),
    }),
    {
      name: 'zhixintong-user',
      storage: createJSONStorage(() => taroStorage),
    }
  )
)
