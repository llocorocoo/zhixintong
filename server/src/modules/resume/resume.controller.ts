import { Controller, Post, Body } from '@nestjs/common'
import { ResumeService } from './resume.service'

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  async getResume(@Body() body: { userId: string }) {
    const result = await this.resumeService.getResume(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('sync')
  async syncFromReport(@Body() body: { userId: string }) {
    const result = await this.resumeService.syncFromReport(body.userId)
    return {
      code: 200,
      message: '同步成功',
      data: result
    }
  }

  @Post('basic')
  async updateBasic(@Body() body: { userId: string; name?: string; gender?: string; age?: string; phone?: string; email?: string }) {
    const result = await this.resumeService.updateBasicInfo(body.userId, {
      name: body.name,
      gender: body.gender,
      age: body.age,
      phone: body.phone,
      email: body.email
    })
    return {
      code: 200,
      message: '更新成功',
      data: result
    }
  }

  @Post('workRecords')
  async addWorkRecord(@Body() body: { userId: string; company: string; position: string; startDate?: string; endDate?: string; description?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'workRecords', {
      company: body.company,
      position: body.position,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description,
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('education')
  async addEducation(@Body() body: { userId: string; school: string; degree: string; major?: string; startDate?: string; endDate?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'education', {
      school: body.school,
      degree: body.degree,
      major: body.major,
      startDate: body.startDate,
      endDate: body.endDate,
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('skills')
  async addSkill(@Body() body: { userId: string; name: string; level?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'skills', {
      name: body.name,
      level: body.level || '熟练',
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('certifications')
  async addCertification(@Body() body: { userId: string; name: string; issuer?: string; date?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'certifications', {
      name: body.name,
      issuer: body.issuer,
      date: body.date,
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('languages')
  async addLanguage(@Body() body: { userId: string; name: string; level?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'languages', {
      name: body.name,
      level: body.level || '中级',
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('projects')
  async addProject(@Body() body: { userId: string; name: string; role: string; startDate?: string; endDate?: string; description?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'projects', {
      name: body.name,
      role: body.role,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description,
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('other')
  async addOther(@Body() body: { userId: string; title: string; content?: string }) {
    const result = await this.resumeService.addItem(body.userId, 'other', {
      title: body.title,
      content: body.content,
      isVerified: false
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }
}
