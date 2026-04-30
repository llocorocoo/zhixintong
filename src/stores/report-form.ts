import { create } from 'zustand'

interface EducationItem {
  id: string; education: string; school: string; major: string
  degreeCertNo: string; diplomaCertNo: string; files: string[]
}
interface QualificationItem {
  id: string; certNumber: string; files: string[]
}
export interface WorkHistoryItem {
  id: string; company: string; position: string; startDate: string; endDate: string; isCurrent: boolean
}

export interface PendingReportData {
  userId: string
  realName: string
  gender: string
  idCard: string
  workHistoryList: WorkHistoryItem[]
  educationList: EducationItem[]
  qualificationList: QualificationItem[]
}

interface ReportFormStore {
  pendingData: PendingReportData | null
  setPendingData: (data: PendingReportData) => void
  clearPendingData: () => void
}

export const useReportFormStore = create<ReportFormStore>((set) => ({
  pendingData: null,
  setPendingData: (data) => set({ pendingData: data }),
  clearPendingData: () => set({ pendingData: null }),
}))
