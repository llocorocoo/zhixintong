import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { ReportService } from './report.service'

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('create')
  async createReport(@Body() body: { userId: string }) {
    const result = await this.reportService.createReport(body.userId)
    return {
      code: 200,
      message: '创建成功',
      data: result
    }
  }

  @Post('step/:stepId')
  async updateStep(
    @Param('stepId') stepId: string,
    @Body() body: { reportId: string; skip: boolean; data?: any }
  ) {
    const result = await this.reportService.updateReportStep(
      body.reportId,
      stepId,
      body.skip,
      body.data
    )
    return {
      code: 200,
      message: '更新成功',
      data: result
    }
  }

  @Get(':reportId')
  async getReport(@Param('reportId') reportId: string) {
    const result = await this.reportService.getReport(reportId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Get('list/:userId')
  async getUserReports(@Param('userId') userId: string) {
    const result = await this.reportService.getUserReports(userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }
}
