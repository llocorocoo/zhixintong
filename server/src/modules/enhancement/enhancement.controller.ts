import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common'
import { EnhancementService } from './enhancement.service'

@Controller('enhancement')
export class EnhancementController {
  constructor(private readonly enhancementService: EnhancementService) {}

  @Get()
  async getEnhancements(@Body() body: { userId: string }) {
    const result = await this.enhancementService.getEnhancements(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post()
  async createEnhancement(@Body() body: { userId: string; type: string; title: string; description?: string; evidence?: any }) {
    const result = await this.enhancementService.createEnhancement(
      body.userId,
      body.type,
      body.title,
      body.description,
      body.evidence
    )
    return {
      code: 200,
      message: '创建成功',
      data: result
    }
  }

  @Get('work-history')
  async getWorkHistories(@Body() body: { userId: string }) {
    const result = await this.enhancementService.getWorkHistories(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('work-history')
  async addWorkHistory(@Body() body: { userId: string; data: any }) {
    const result = await this.enhancementService.addWorkHistory(body.userId, body.data)
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Put('work-history/:workId')
  async updateWorkHistory(
    @Param('workId') workId: string,
    @Body() body: { userId: string; data: any }
  ) {
    const result = await this.enhancementService.updateWorkHistory(body.userId, workId, body.data)
    return {
      code: 200,
      message: '更新成功',
      data: result
    }
  }
}
