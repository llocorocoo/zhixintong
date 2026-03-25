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

  async updateReportStep(reportId: string, stepId: string, skip: boolean, data?: any) {
    const client = getSupabaseClient()
    
    // 获取报告
    const { data: report, error: fetchError } = await client
      .from('credit_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (fetchError || !report) {
      throw new Error('报告不存在')
    }

    // 更新对应步骤的数据
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

    // 更新报告
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
