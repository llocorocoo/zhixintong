import { create } from 'zustand'

interface CurrentOrderStore {
  orderId: string | null
  setOrderId: (id: string | null) => void
}

export const useCurrentOrderStore = create<CurrentOrderStore>((set) => ({
  orderId: null,
  setOrderId: (id) => set({ orderId: id }),
}))
