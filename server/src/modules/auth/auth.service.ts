import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class AuthService {
  async register(phone: string, password: string) {
    const client = getSupabaseClient()
    
    // 检查手机号是否已注册
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      throw new BadRequestException('该手机号已注册')
    }

    // 创建用户
    const { data, error } = await client
      .from('users')
      .insert({
        phone,
        password, // 实际项目中应该加密
        name: `用户${phone.slice(-4)}`,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new BadRequestException('注册失败')
    }

    return { userId: data.id }
  }

  async login(phone: string, password: string) {
    const client = getSupabaseClient()
    
    // 查询用户
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('password', password) // 实际项目中应该验证加密密码
      .single()

    if (error || !user) {
      throw new UnauthorizedException('手机号或密码错误')
    }

    // 更新最后登录时间
    await client
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)

    // 生成 token（实际项目中应该使用 JWT）
    const token = `token_${user.id}_${Date.now()}`

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        email: user.email
      },
      token
    }
  }

  async getUserById(userId: string) {
    const client = getSupabaseClient()
    
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new UnauthorizedException('用户不存在')
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      email: user.email
    }
  }
}
