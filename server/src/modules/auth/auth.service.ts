import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'

interface StoredUser {
  id: string
  phone: string
  password: string
  name: string
  avatar?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

@Injectable()
export class AuthService {
  private users = new Map<string, StoredUser>()
  private tokens = new Map<string, string>() // token -> userId

  async register(phone: string, password: string) {
    // 检查手机号是否已注册
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        throw new BadRequestException('该手机号已注册')
      }
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    const user: StoredUser = {
      id,
      phone,
      password,
      name: `用户${phone.slice(-4)}`,
      is_active: true,
      created_at: now,
      updated_at: now,
    }
    this.users.set(id, user)

    return { userId: id }
  }

  async login(phone: string, password: string) {
    let found: StoredUser | undefined
    for (const user of this.users.values()) {
      if (user.phone === phone && user.password === password) {
        found = user
        break
      }
    }

    if (!found) {
      throw new UnauthorizedException('手机号或密码错误')
    }

    found.updated_at = new Date().toISOString()

    const token = `token_${found.id}_${Date.now()}`
    this.tokens.set(token, found.id)

    return {
      user: {
        id: found.id,
        phone: found.phone,
        name: found.name,
        avatar: found.avatar,
        email: found.email,
      },
      token,
    }
  }

  getUserIdByToken(token: string): string | undefined {
    return this.tokens.get(token)
  }

  async getUserById(userId: string) {
    const user = this.users.get(userId)

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
    }
  }
}
