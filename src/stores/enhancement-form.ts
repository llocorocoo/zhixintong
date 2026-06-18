import { create } from 'zustand'

export interface SavedEducationItem {
  id: string
  isAbroad: boolean
  diplomaCertNo?: string
  degreeCertNo?: string
  abroadCertNo?: string
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
  department: string
  employmentType: string
  employmentStatus: string
  startDate: string
  endDate: string
  canBackcheck: string
  refRelation: string
  refName: string
  refDepartment: string
  refPosition: string
  refContact: string
  refLanguage: string
  refWorkDuration: string
}

interface EnhancementFormStore {
  educationItems: SavedEducationItem[] | null
  certItems: SavedCertItem[] | null
  workItems: SavedWorkItem[] | null
  saveEducation: (items: SavedEducationItem[]) => void
  saveCert: (items: SavedCertItem[]) => void
  saveWork: (items: SavedWorkItem[]) => void
  clearAll: () => void
}

export const useEnhancementFormStore = create<EnhancementFormStore>((set) => ({
  educationItems: null,
  certItems: null,
  workItems: null,
  saveEducation: (items) => set({ educationItems: items }),
  saveCert: (items) => set({ certItems: items }),
  saveWork: (items) => set({ workItems: items }),
  clearAll: () => set({ educationItems: null, certItems: null, workItems: null }),
}))
