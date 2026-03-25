import { Controller, Get, Post, Body, Put } from '@nestjs/common'
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

  @Put()
  async updateResume(@Body() body: { userId: string; data: any }) {
    const result = await this.resumeService.updateResume(body.userId, body.data)
    return {
      code: 200,
      message: '更新成功',
      data: result
    }
  }

  @Post('work')
  async addWorkExperience(@Body() body: { userId: string; data: any }) {
    const result = await this.resumeService.addWorkExperience(body.userId, body.data)
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }
}
