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
      throw new Error('获取工作履历失败')
    }

    return data
  }

  async addWorkHistory(userId: string, workData: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('work_histories')
      .insert({
        user_id: userId,
        ...workData,
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      throw new Error('添加工作履历失败')
    }

    return data
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
}
