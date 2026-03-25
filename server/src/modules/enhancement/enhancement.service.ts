import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class EnhancementService {
  async getEnhancements(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_enhancements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('获取增信记录失败')
    }

    return data
  }

  async createEnhancement(userId: string, type: string, title: string, description?: string, evidence?: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_enhancements')
      .insert({
        user_id: userId,
        type,
        title,
        description,
        evidence,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw new Error('创建增信记录失败')
    }

    return data
  }

  async getWorkHistories(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('work_histories')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('获取工作履历失败:', error)
      return []
    }

    // 转换字段名以匹配前端
    return (data || []).map(item => ({
      id: item.id,
      company: item.company,
      position: item.position,
      startDate: item.start_date,
      endDate: item.end_date,
      description: item.description,
      proofFiles: item.proof_files || [],
      status: item.is_verified ? 'verified' : 'pending',
      createdAt: item.created_at
    }))
  }

  async addWorkHistory(userId: string, workData: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('work_histories')
      .insert({
        user_id: userId,
        company: workData.company,
        position: workData.position,
        start_date: workData.start_date,
        end_date: workData.end_date,
        description: workData.description,
        proof_files: workData.proof_files || [],
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      console.error('添加工作履历失败:', error)
      throw new Error('添加工作履历失败')
    }

    return {
      id: data.id,
      company: data.company,
      position: data.position,
      startDate: data.start_date,
      endDate: data.end_date,
      description: data.description,
      proofFiles: data.proof_files || [],
      status: 'pending'
    }
  }

  async updateWorkHistory(userId: string, workId: string, updateData: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('work_histories')
      .update(updateData)
      .eq('id', workId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error('更新工作履历失败')
    }

    return data
  }

  async deleteWorkHistory(userId: string, workId: string) {
    const client = getSupabaseClient()
    
    const { error } = await client
      .from('work_histories')
      .delete()
      .eq('id', workId)
      .eq('user_id', userId)

    if (error) {
      throw new Error('删除工作履历失败')
    }

    return { success: true }
  }

  async getCertificates(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })

    if (error) {
      console.error('获取证书失败:', error)
      return []
    }

    // 转换字段名以匹配前端
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      issueDate: item.issue_date,
      certNo: item.cert_no,
      proofFiles: item.proof_files || [],
      status: item.is_verified ? 'verified' : 'pending',
      createdAt: item.created_at
    }))
  }

  async addCertificate(userId: string, certData: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('certificates')
      .insert({
        user_id: userId,
        name: certData.name,
        issuer: certData.issuer,
        issue_date: certData.issue_date,
        cert_no: certData.cert_no,
        proof_files: certData.proof_files || [],
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      console.error('添加证书失败:', error)
      throw new Error('添加证书失败')
    }

    return {
      id: data.id,
      name: data.name,
      issuer: data.issuer,
      issueDate: data.issue_date,
      certNo: data.cert_no,
      proofFiles: data.proof_files || [],
      status: 'pending'
    }
  }

  async deleteCertificate(userId: string, certId: string) {
    const client = getSupabaseClient()
    
    const { error } = await client
      .from('certificates')
      .delete()
      .eq('id', certId)
      .eq('user_id', userId)

    if (error) {
      throw new Error('删除证书失败')
    }

    return { success: true }
  }
}
