import { Controller, Post, Body, Param, Delete } from '@nestjs/common'
import { EnhancementService } from './enhancement.service'

@Controller('enhancement')
export class EnhancementController {
  constructor(private readonly enhancementService: EnhancementService) {}

  @Post()
  async getEnhancements(@Body() body: { userId: string }) {
    const result = await this.enhancementService.getEnhancements(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('create')
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

  @Post('work-history')
  async getWorkHistories(@Body() body: { userId: string }) {
    const result = await this.enhancementService.getWorkHistories(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('work-history/add')
  async addWorkHistory(
    @Body() body: { 
      userId: string
      company: string
      position: string
      startDate?: string
      endDate?: string
      description?: string
      proofFiles?: string[]
    }
  ) {
    const result = await this.enhancementService.addWorkHistory(body.userId, {
      company: body.company,
      position: body.position,
      start_date: body.startDate,
      end_date: body.endDate,
      description: body.description,
      proof_files: body.proofFiles || []
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Post('work-history/:workId')
  async updateWorkHistory(
    @Param('workId') workId: string,
    @Body() body: { 
      userId: string
      company?: string
      position?: string
      startDate?: string
      endDate?: string
      description?: string
      proofFiles?: string[]
    }
  ) {
    const updateData: any = {}
    if (body.company) updateData.company = body.company
    if (body.position) updateData.position = body.position
    if (body.startDate) updateData.start_date = body.startDate
    if (body.endDate) updateData.end_date = body.endDate
    if (body.description) updateData.description = body.description
    if (body.proofFiles) updateData.proof_files = body.proofFiles

    const result = await this.enhancementService.updateWorkHistory(body.userId, workId, updateData)
    return {
      code: 200,
      message: '更新成功',
      data: result
    }
  }

  @Delete('work-history/:workId')
  async deleteWorkHistory(
    @Param('workId') workId: string,
    @Body() body: { userId: string }
  ) {
    const result = await this.enhancementService.deleteWorkHistory(body.userId, workId)
    return {
      code: 200,
      message: '删除成功',
      data: result
    }
  }

  @Post('certificates')
  async getCertificates(@Body() body: { userId: string }) {
    const result = await this.enhancementService.getCertificates(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('certificates/add')
  async addCertificate(
    @Body() body: {
      userId: string
      name: string
      issuer: string
      issueDate?: string
      certNo?: string
      proofFiles?: string[]
    }
  ) {
    const result = await this.enhancementService.addCertificate(body.userId, {
      name: body.name,
      issuer: body.issuer,
      issue_date: body.issueDate,
      cert_no: body.certNo,
      proof_files: body.proofFiles || []
    })
    return {
      code: 200,
      message: '添加成功',
      data: result
    }
  }

  @Delete('certificates/:certId')
  async deleteCertificate(
    @Param('certId') certId: string,
    @Body() body: { userId: string }
  ) {
    const result = await this.enhancementService.deleteCertificate(body.userId, certId)
    return {
      code: 200,
      message: '删除成功',
      data: result
    }
  }
}
