import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

export interface Enhancement {
  id: string
  user_id: string
  type: string
  title: string
  description?: string
  evidence?: any
  status: string
  created_at: string
}

export interface WorkHistory {
  id: string
  user_id: string
  company: string
  position: string
  start_date: string
  end_date?: string
  description?: string
  proof_files: any[]
  is_verified: boolean
  created_at: string
}

export interface Certificate {
  id: string
  user_id: string
  name: string
  issuer: string
  issue_date: string
  cert_no?: string
  proof_files: any[]
  is_verified: boolean
  created_at: string
}

@Injectable()
export class EnhancementService {
  private enhancements = new Map<string, Enhancement[]>()
  private workHistories = new Map<string, WorkHistory[]>()
  private certificates = new Map<string, Certificate[]>()

  async getEnhancements(userId: string) {
    return this.enhancements.get(userId) || []
  }

  async createEnhancement(userId: string, type: string, title: string, description?: string, evidence?: any) {
    const item: Enhancement = {
      id: randomUUID(),
      user_id: userId,
      type,
      title,
      description,
      evidence,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    const list = this.enhancements.get(userId) || []
    list.push(item)
    this.enhancements.set(userId, list)
    return item
  }

  async getWorkHistories(userId: string) {
    const list = this.workHistories.get(userId) || []
    return list.map(item => ({
      id: item.id,
      company: item.company,
      position: item.position,
      startDate: item.start_date,
      endDate: item.end_date,
      description: item.description,
      proofFiles: item.proof_files || [],
      status: item.is_verified ? 'verified' : 'pending',
      createdAt: item.created_at,
    }))
  }

  async addWorkHistory(userId: string, workData: any) {
    const item: WorkHistory = {
      id: randomUUID(),
      user_id: userId,
      company: workData.company,
      position: workData.position,
      start_date: workData.start_date,
      end_date: workData.end_date,
      description: workData.description,
      proof_files: workData.proof_files || [],
      is_verified: false,
      created_at: new Date().toISOString(),
    }
    const list = this.workHistories.get(userId) || []
    list.push(item)
    this.workHistories.set(userId, list)

    return {
      id: item.id,
      company: item.company,
      position: item.position,
      startDate: item.start_date,
      endDate: item.end_date,
      description: item.description,
      proofFiles: item.proof_files,
      status: 'pending',
    }
  }

  async updateWorkHistory(userId: string, workId: string, updateData: any) {
    const list = this.workHistories.get(userId) || []
    const item = list.find(w => w.id === workId)
    if (!item) throw new Error('更新工作履历失败')
    Object.assign(item, updateData)
    return item
  }

  async deleteWorkHistory(userId: string, workId: string) {
    const list = this.workHistories.get(userId) || []
    const idx = list.findIndex(w => w.id === workId)
    if (idx >= 0) list.splice(idx, 1)
    return { success: true }
  }

  async getCertificates(userId: string) {
    const list = this.certificates.get(userId) || []
    return list.map(item => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      issueDate: item.issue_date,
      certNo: item.cert_no,
      proofFiles: item.proof_files || [],
      status: item.is_verified ? 'verified' : 'pending',
      createdAt: item.created_at,
    }))
  }

  async addCertificate(userId: string, certData: any) {
    const item: Certificate = {
      id: randomUUID(),
      user_id: userId,
      name: certData.name,
      issuer: certData.issuer,
      issue_date: certData.issue_date,
      cert_no: certData.cert_no,
      proof_files: certData.proof_files || [],
      is_verified: false,
      created_at: new Date().toISOString(),
    }
    const list = this.certificates.get(userId) || []
    list.push(item)
    this.certificates.set(userId, list)

    return {
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      issueDate: item.issue_date,
      certNo: item.cert_no,
      proofFiles: item.proof_files,
      status: 'pending',
    }
  }

  async deleteCertificate(userId: string, certId: string) {
    const list = this.certificates.get(userId) || []
    const idx = list.findIndex(c => c.id === certId)
    if (idx >= 0) list.splice(idx, 1)
    return { success: true }
  }
}
