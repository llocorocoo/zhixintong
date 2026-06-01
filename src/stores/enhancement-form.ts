import { create } from 'zustand'

export interface SavedEducation {
  degree: string
  diplomaCertNo: string
  degreeCertNo: string
}

export interface SavedCertItem {
  id: string
  certNumber: string
  files: string[]
}

export interface SavedWorkItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface EnhancementFormStore {
  education: SavedEducation | null
  certItems: SavedCertItem[] | null
  workItems: SavedWorkItem[] | null
  saveEducation: (data: SavedEducation) => void
  saveCert: (items: SavedCertItem[]) => void
  saveWork: (items: SavedWorkItem[]) => void
  clearAll: () => void
}

export const useEnhancementFormStore = create<EnhancementFormStore>((set) => ({
  education: null,
  certItems: null,
  workItems: null,
  saveEducation: (data) => set({ education: data }),
  saveCert: (items) => set({ certItems: items }),
  saveWork: (items) => set({ workItems: items }),
  clearAll: () => set({ education: null, certItems: null, workItems: null }),
}))
