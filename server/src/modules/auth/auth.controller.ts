import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ReportService } from '../report/report.service'
import { CreditService } from '../credit/credit.service'
import { ResumeService } from '../resume/resume.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly reportService: ReportService,
    private readonly creditService: CreditService,
    private readonly resumeService: ResumeService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: { phone: string; password: string }) {
    const result = await this.authService.register(body.phone, body.password)
    return {
      code: 200,
      message: '注册成功',
      data: result
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { phone: string; password: string }) {
    const result = await this.authService.login(body.phone, body.password)
    // 每次登录重置数据，方便演示流程
    this.reportService.clearUserData(result.user.id)
    this.creditService.clearUserData(result.user.id)
    this.resumeService.clearUserData(result.user.id)
    return {
      code: 200,
      message: '登录成功',
      data: result
    }
  }

  @Get('user')
  async getUser(@Body() body: { userId: string }) {
    const result = await this.authService.getUserById(body.userId)
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { userId: string }) {
    if (body.userId) {
      this.reportService.clearUserData(body.userId)
      this.creditService.clearUserData(body.userId)
      this.resumeService.clearUserData(body.userId)
    }
    return {
      code: 200,
      message: '退出成功'
    }
  }
}
