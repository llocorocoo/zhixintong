import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

interface CreditScore {
  id: string
  user_id: string
  score: number
  level: string
  factors: any
  created_at: string
}

@Injectable()
export class CreditService {
  private scores = new Map<string, CreditScore[]>()

  async getCreditScore(userId: string) {
    const userScores = this.scores.get(userId)
    if (userScores && userScores.length > 0) {
      const latest = userScores[userScores.length - 1]
      return { score: latest.score, level: latest.level, factors: latest.factors }
    }
    return null
  }

  clearUserData(userId: string) {
    this.scores.delete(userId)
  }

  async enhanceCreditScore(userId: string) {
    const current = await this.getCreditScore(userId)
    if (!current) return null
    const bonus = 30 + Math.floor(Math.random() * 21) // 30~50 分
    const newScore = Math.min(940, current.score + bonus)
    const newLevel = newScore >= 800 ? '优秀' : newScore >= 700 ? '良好' : newScore >= 600 ? '中等' : '待提升'
    return this.updateCreditScore(userId, newScore, newLevel, current.factors)
  }

  async updateCreditScore(userId: string, score: number, level: string, factors?: any) {
    const record: CreditScore = {
      id: randomUUID(),
      user_id: userId,
      score,
      level,
      factors,
      created_at: new Date().toISOString(),
    }

    const existing = this.scores.get(userId) || []
    existing.push(record)
    this.scores.set(userId, existing)
    return record
  }
}
