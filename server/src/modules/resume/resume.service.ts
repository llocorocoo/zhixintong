import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class ResumeService {
  async getResume(userId: string) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 表示未找到记录
      throw new Error('获取简历失败')
    }

    // 如果没有简历，创建一个空的
    if (!data) {
      const { data: newResume, error: createError } = await client
        .from('resumes')
        .insert({
          user_id: userId,
          summary: '',
          work_experience: [],
          education: [],
          skills: [],
          certifications: [],
          is_verified: false
        })
        .select()
        .single()

      if (createError) {
        throw new Error('创建简历失败')
      }

      return newResume
    }

    return data
  }

  async updateResume(userId: string, updateData: any) {
    const client = getSupabaseClient()
    
    // 先检查简历是否存在
    const { data: existing } = await client
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .single()

    let result
    if (existing) {
      // 更新
      const { data, error } = await client
        .from('resumes')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error('更新简历失败')
      }
      result = data
    } else {
      // 创建
      const { data, error } = await client
        .from('resumes')
        .insert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single()

      if (error) {
        throw new Error('创建简历失败')
      }
      result = data
    }

    return result
  }

  async addWorkExperience(userId: string, workData: any) {
    const client = getSupabaseClient()
    
    // 获取当前简历
    const resume = await this.getResume(userId)
    const workExperience = resume.work_experience || []
    
    // 添加新的工作经历
    const newWork = {
      ...workData,
      id: `work_${Date.now()}`,
      isVerified: false
    }
    workExperience.push(newWork)

    // 更新简历
    const { data, error } = await client
      .from('resumes')
      .update({ work_experience: workExperience })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error('添加工作经历失败')
    }

    return newWork
  }
}
