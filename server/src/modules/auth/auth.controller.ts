import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
