import { Controller, Post, Body } from '@nestjs/common'
import { CreditService } from './credit.service'

@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('score')
  async getScore(@Body() body: { userId: string }) {
    const result = await this.creditService.getCreditScore(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }
}
