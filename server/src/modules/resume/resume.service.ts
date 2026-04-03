import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

interface Resume {
  id: string
  user_id: string
  avatar?: string
  name: string
  gender: string
  age: string
  phone: string
  email: string
  workRecords: any[]
  education: any[]
  skills: any[]
  certifications: any[]
  languages: any[]
  projects: any[]
  other: any[]
  created_at: string
  updated_at: string
}

@Injectable()
export class ResumeService {
  private resumes = new Map<string, Resume>()

  async getResume(userId: string) {
    const resume = this.resumes.get(userId)
    if (!resume) return null
    return this.transformResume(resume)
  }

  private transformResume(data: Resume) {
    return {
      id: data.id,
      avatar: data.avatar,
      name: data.name || '',
      gender: data.gender || '',
      age: data.age || '',
      phone: data.phone || '',
      email: data.email || '',
      workRecords: data.workRecords || [],
      education: data.education || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      projects: data.projects || [],
      other: data.other || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async syncFromReport(userId: string) {
    const now = new Date().toISOString()
    const resume: Resume = {
      id: randomUUID(),
      user_id: userId,
      name: '小王',
      gender: '男',
      age: '26岁',
      phone: '133****3333',
      email: '1234@123.com',
      workRecords: [
        {
          id: '1',
          company: '某某科技有限公司',
          position: '高级前端工程师',
          startDate: '2022.03',
          endDate: '至今',
          description: '负责公司核心产品的前端架构设计与开发',
          isVerified: true,
        },
        {
          id: '2',
          company: '互联网科技股份有限公司',
          position: '前端开发工程师',
          startDate: '2020.07',
          endDate: '2022.02',
          description: '参与电商平台前端开发，优化用户体验',
          isVerified: true,
        },
      ],
      skills: [
        { id: '1', name: 'JavaScript/TypeScript', level: '精通', isVerified: true },
        { id: '2', name: 'React/Vue', level: '精通', isVerified: true },
        { id: '3', name: 'Node.js', level: '熟练', isVerified: false },
        { id: '4', name: 'Python', level: '熟练', isVerified: false },
      ],
      certifications: [
        { id: '1', name: '教师资格证', issuer: '教育部', date: '2021.06', isVerified: true },
        { id: '2', name: '法律职业资格证', issuer: '司法部', date: '2022.09', isVerified: true },
      ],
      education: [
        {
          id: '1',
          school: '中国xx大学',
          degree: '硕士',
          major: '计算机科学与技术',
          startDate: '2017.09',
          endDate: '2020.06',
          isVerified: true,
        },
        {
          id: '2',
          school: '中国xx大学',
          degree: '本科',
          major: '计算机科学与技术',
          startDate: '2013.09',
          endDate: '2017.06',
          isVerified: true,
        },
      ],
      languages: [
        { id: '1', name: '英语', level: 'CET-6', isVerified: true },
        { id: '2', name: '日语', level: 'N2', isVerified: false },
      ],
      projects: [
        {
          id: '1',
          name: '企业级管理系统',
          role: '前端负责人',
          description: '负责整体架构设计和核心模块开发',
          isVerified: true,
        },
        {
          id: '2',
          name: '电商平台小程序',
          role: '核心开发',
          description: '独立完成小程序端全部功能开发',
          isVerified: false,
        },
      ],
      other: [
        { id: '1', title: 'GitHub开源项目', content: '参与多个开源项目，累计Star 500+', isVerified: false },
      ],
      created_at: now,
      updated_at: now,
    }
    this.resumes.set(userId, resume)
    return this.transformResume(resume)
  }

  async updateBasicInfo(userId: string, basicInfo: any) {
    let resume = this.resumes.get(userId)
    if (!resume) return null

    resume.name = basicInfo.name ?? resume.name
    resume.gender = basicInfo.gender ?? resume.gender
    resume.age = basicInfo.age ?? resume.age
    resume.phone = basicInfo.phone ?? resume.phone
    resume.email = basicInfo.email ?? resume.email
    resume.updated_at = new Date().toISOString()

    return this.transformResume(resume)
  }

  async addItem(userId: string, section: string, item: any) {
    let resume = this.resumes.get(userId)
    if (!resume) return null

    const newItem = { ...item, id: `${section}_${Date.now()}` }
    const items = resume[section] || []
    items.push(newItem)
    resume[section] = items
    resume.updated_at = new Date().toISOString()

    return newItem
  }

  clearUserData(userId: string) {
    this.resumes.delete(userId)
  }
}
