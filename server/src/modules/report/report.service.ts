import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class ReportService {
  async createReport(userId: string) {
    const client = getSupabaseClient()
    
    // 生成报告编号
    const reportNo = `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // 创建报告记录
    const { data, error } = await client
      .from('credit_reports')
      .insert({
        user_id: userId,
        report_no: reportNo,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw new Error('创建报告失败')
    }

    return {
      reportId: data.id,
      reportNo: data.report_no
    }
  }

  async submitReport(userId: string, formData: any) {
    const client = getSupabaseClient()
    
    // 获取或创建报告
    let reportId: string
    
    const { data: existingReport } = await client
      .from('credit_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      reportId = existingReport.id
    } else {
      const reportNo = `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      const { data: newReport, error } = await client
        .from('credit_reports')
        .insert({
          user_id: userId,
          report_no: reportNo,
          status: 'processing'
        })
        .select()
        .single()

      if (error) {
        throw new Error('创建报告失败')
      }
      reportId = newReport.id
    }

    // 更新报告信息
    const { error: updateError } = await client
      .from('credit_reports')
      .update({
        status: 'processing',
        identity_info: {
          realName: formData.realName,
          idCard: formData.idCard
        },
        education_info: {
          education: formData.education,
          school: formData.school,
          major: formData.major,
          degreeCertNo: formData.degreeCertNo,
          diplomaCertNo: formData.diplomaCertNo,
          files: formData.educationFiles
        },
        qualification_info: formData.qualification ? {
          qualification: formData.qualification,
          certNumber: formData.certNumber,
          issueDate: formData.issueDate,
          files: formData.qualificationFiles
        } : null
      })
      .eq('id', reportId)

    if (updateError) {
      throw new Error('提交报告失败')
    }

    // 模拟异步处理（实际项目中应该使用消息队列）
    setTimeout(() => {
      this.processReport(reportId)
    }, 5000)

    return { reportId, status: 'processing' }
  }

  async processReport(reportId: string) {
    const client = getSupabaseClient()
    
    // 模拟核查完成
    await client
      .from('credit_reports')
      .update({
        status: 'completed',
        report_url: `https://example.com/reports/${reportId}.pdf`,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 一年后过期
      })
      .eq('id', reportId)
  }

  async getLatestReport(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error('获取报告失败')
    }

    return data
  }

  async updateReportStep(reportId: string, stepId: string, skip: boolean, data?: any) {
    const client = getSupabaseClient()
    
    const updateData: any = {}
    const stepFieldMap: Record<string, string> = {
      identity: 'identity_info',
      education: 'education_info',
      qualification: 'qualification_info',
      litigation: 'litigation_info',
      investment: 'investment_info',
      financial: 'financial_credit_info',
      blacklist: 'blacklist_info'
    }

    const field = stepFieldMap[stepId]
    if (field) {
      updateData[field] = skip ? { skipped: true } : (data || { completed: true })
    }

    const { error: updateError } = await client
      .from('credit_reports')
      .update(updateData)
      .eq('id', reportId)

    if (updateError) {
      throw new Error('更新报告失败')
    }

    return {
      stepId,
      status: skip ? 'skipped' : 'completed',
      data: updateData[field]
    }
  }

  async getReport(reportId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) {
      throw new Error('获取报告失败')
    }

    return data
  }

  async getUserReports(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('获取报告列表失败')
    }

    return data
  }
}
