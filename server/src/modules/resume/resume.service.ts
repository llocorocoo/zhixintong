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

    if (error && error.code !== 'PGRST116') {
      console.error('获取简历失败:', error)
      throw new Error('获取简历失败')
    }

    // 如果没有简历，创建一个空的
    if (!data) {
      const { data: newResume, error: createError } = await client
        .from('resumes')
        .insert({
          user_id: userId,
          name: '',
          gender: '',
          age: '',
          phone: '',
          email: '',
          workRecords: [],
          education: [],
          skills: [],
          certifications: [],
          languages: [],
          projects: [],
          other: []
        })
        .select()
        .single()

      if (createError) {
        console.error('创建简历失败:', createError)
        throw new Error('创建简历失败')
      }

      return this.transformResume(newResume)
    }

    return this.transformResume(data)
  }

  private transformResume(data: any) {
    return {
      id: data.id,
      avatar: data.avatar,
      name: data.name || '',
      gender: data.gender || '',
      age: data.age || '',
      phone: data.phone || '',
      email: data.email || '',
      workRecords: data.work_records || [],
      education: data.education || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      projects: data.projects || [],
      other: data.other || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  async syncFromReport(userId: string) {
    const client = getSupabaseClient()
    
    // 获取用户基本信息
    const { data: userInfo } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // 获取已核验的工作履历
    const { data: workHistories } = await client
      .from('work_histories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_verified', true)

    // 获取已核验的证书
    const { data: certificates } = await client
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_verified', true)

    // 获取报告中的身份和学历信息
    const { data: report } = await client
      .from('credit_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 构建简历数据
    const resumeData: any = {}

    if (userInfo) {
      resumeData.name = userInfo.name
      resumeData.phone = userInfo.phone
      resumeData.email = userInfo.email
    }

    if (workHistories && workHistories.length > 0) {
      resumeData.workRecords = workHistories.map(w => ({
        id: w.id,
        company: w.company,
        position: w.position,
        startDate: w.start_date,
        endDate: w.end_date,
        description: w.description,
        isVerified: true
      }))
    }

    if (certificates && certificates.length > 0) {
      resumeData.certifications = certificates.map(c => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        date: c.issue_date,
        isVerified: true
      }))
    }

    if (report) {
      if (report.identity_info) {
        resumeData.name = report.identity_info.realName || resumeData.name
      }
      if (report.education_info) {
        resumeData.education = [{
          id: 'edu_report',
          school: report.education_info.school,
          degree: report.education_info.education,
          major: report.education_info.major,
          isVerified: true
        }]
      }
    }

    // 更新或创建简历
    const { data: existingResume } = await client
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingResume) {
      const { data, error } = await client
        .from('resumes')
        .update({
          ...resumeData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('同步简历失败:', error)
        throw new Error('同步简历失败')
      }

      return this.transformResume(data)
    } else {
      const { data, error } = await client
        .from('resumes')
        .insert({
          user_id: userId,
          ...resumeData,
          workRecords: resumeData.workRecords || [],
          education: resumeData.education || [],
          skills: [],
          certifications: resumeData.certifications || [],
          languages: [],
          projects: [],
          other: []
        })
        .select()
        .single()

      if (error) {
        console.error('创建简历失败:', error)
        throw new Error('创建简历失败')
      }

      return this.transformResume(data)
    }
  }

  async updateBasicInfo(userId: string, basicInfo: any) {
    const client = getSupabaseClient()
    
    const { data: existingResume } = await client
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingResume) {
      const { data, error } = await client
        .from('resumes')
        .update({
          name: basicInfo.name,
          gender: basicInfo.gender,
          age: basicInfo.age,
          phone: basicInfo.phone,
          email: basicInfo.email,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error('更新基本信息失败')
      }

      return this.transformResume(data)
    } else {
      const { data, error } = await client
        .from('resumes')
        .insert({
          user_id: userId,
          name: basicInfo.name,
          gender: basicInfo.gender,
          age: basicInfo.age,
          phone: basicInfo.phone,
          email: basicInfo.email,
          workRecords: [],
          education: [],
          skills: [],
          certifications: [],
          languages: [],
          projects: [],
          other: []
        })
        .select()
        .single()

      if (error) {
        throw new Error('创建简历失败')
      }

      return this.transformResume(data)
    }
  }

  async addItem(userId: string, section: string, item: any) {
    const client = getSupabaseClient()
    
    // 获取当前简历
    const resume = await this.getResume(userId)
    
    // 获取当前列表
    let items = resume[section] || []
    
    // 添加新项
    const newItem = {
      ...item,
      id: `${section}_${Date.now()}`
    }
    items.push(newItem)

    // 转换字段名（驼峰转下划线）
    const dbField = this.sectionToDbField(section)
    
    // 更新简历
    const { data, error } = await client
      .from('resumes')
      .update({ 
        [dbField]: items,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('添加失败:', error)
      throw new Error('添加失败')
    }

    return newItem
  }

  private sectionToDbField(section: string): string {
    const mapping: Record<string, string> = {
      workRecords: 'work_records',
      education: 'education',
      skills: 'skills',
      certifications: 'certifications',
      languages: 'languages',
      projects: 'projects',
      other: 'other'
    }
    return mapping[section] || section
  }
}
