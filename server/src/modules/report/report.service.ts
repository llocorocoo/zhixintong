import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CreditService } from '../credit/credit.service'

export interface Report {
  id: string
  user_id: string
  report_no: string
  status: string
  report_url?: string
  identity_info?: any
  education_info?: any
  qualification_info?: any
  litigation_info?: any
  investment_info?: any
  financial_credit_info?: any
  blacklist_info?: any
  expires_at?: string
  created_at: string
  updated_at: string
}

@Injectable()
export class ReportService {
  private reports = new Map<string, Report>()

  constructor(private readonly creditService: CreditService) {}

  async createReport(userId: string) {
    const reportNo = `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const id = randomUUID()
    const now = new Date().toISOString()
    const report: Report = {
      id,
      user_id: userId,
      report_no: reportNo,
      status: 'pending',
      created_at: now,
      updated_at: now,
    }
    this.reports.set(id, report)
    return { reportId: id, reportNo }
  }

  async submitReport(userId: string, formData: any) {
    // Find existing pending report
    let report: Report | undefined
    for (const r of this.reports.values()) {
      if (r.user_id === userId && r.status === 'pending') {
        report = r
        break
      }
    }

    if (!report) {
      const reportNo = `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      const id = randomUUID()
      const now = new Date().toISOString()
      report = {
        id,
        user_id: userId,
        report_no: reportNo,
        status: 'processing',
        created_at: now,
        updated_at: now,
      }
      this.reports.set(id, report)
    }

    report.status = 'processing'
    report.identity_info = { realName: formData.realName, idCard: formData.idCard }
    report.education_info = formData.education ? {
      education: formData.education,
      school: formData.school,
      major: formData.major,
      degreeCertNo: formData.degreeCertNo,
      diplomaCertNo: formData.diplomaCertNo,
      files: formData.educationFiles,
    } : undefined
    report.qualification_info = formData.qualification ? {
      qualification: formData.qualification,
      certNumber: formData.certNumber,
      issueDate: formData.issueDate,
      files: formData.qualificationFiles,
    } : undefined
    report.updated_at = new Date().toISOString()

    setTimeout(() => { this.processReport(report!.id) }, 1000)

    return { reportId: report.id, status: 'processing' }
  }

  async processReport(reportId: string) {
    const report = this.reports.get(reportId)
    if (report) {
      report.status = 'completed'
      report.report_url = `https://example.com/reports/${reportId}.pdf`
      report.expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      report.updated_at = new Date().toISOString()

      // 报告完成后生成信用评分
      const score = 650
      const level = 'good'
      const factors = {
        authenticity: 80,
        stability: 75,
        compliance: 70,
        safety: 100,
        professionalism: 60,
        reliability: 65,
      }
      await this.creditService.updateCreditScore(report.user_id, score, level, factors)
    }
  }

  async getLatestReport(userId: string) {
    let latest: Report | null = null
    for (const r of this.reports.values()) {
      if (r.user_id === userId) {
        if (!latest || r.created_at > latest.created_at) {
          latest = r
        }
      }
    }
    return latest
  }

  async updateReportStep(reportId: string, stepId: string, skip: boolean, data?: any) {
    const report = this.reports.get(reportId)
    if (!report) throw new Error('获取报告失败')

    const stepFieldMap: Record<string, string> = {
      identity: 'identity_info',
      education: 'education_info',
      qualification: 'qualification_info',
      litigation: 'litigation_info',
      investment: 'investment_info',
      financial: 'financial_credit_info',
      blacklist: 'blacklist_info',
    }

    const field = stepFieldMap[stepId]
    if (field) {
      report[field] = skip ? { skipped: true } : (data || { completed: true })
      report.updated_at = new Date().toISOString()
    }

    return { stepId, status: skip ? 'skipped' : 'completed', data: report[field] }
  }

  async getReport(reportId: string) {
    const report = this.reports.get(reportId)
    if (!report) throw new Error('获取报告失败')
    return report
  }

  clearUserData(userId: string) {
    for (const [id, r] of this.reports.entries()) {
      if (r.user_id === userId) this.reports.delete(id)
    }
  }

  async getUserReports(userId: string) {
    const results: Report[] = []
    for (const r of this.reports.values()) {
      if (r.user_id === userId) results.push(r)
    }
    return results.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
}
