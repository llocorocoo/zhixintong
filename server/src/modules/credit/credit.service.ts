import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class CreditService {
  async getCreditScore(userId: string) {
    const client = getSupabaseClient()
    
    // 获取最新的信用评分
    const { data: score, error } = await client
      .from('credit_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !score) {
      // 如果没有评分记录，生成一个初始评分
      return this.generateInitialScore(userId)
    }

    return {
      score: score.score,
      level: score.level,
      factors: score.factors
    }
  }

  private async generateInitialScore(userId: string) {
    const client = getSupabaseClient()
    
    // 生成初始评分（实际项目中应该根据实际情况计算）
    const initialScore = 650
    const level = 'good'
    const factors = {
      identity: 80,
      education: 75,
      qualification: 70,
      litigation: 100,
      investment: 60,
      financial: 65
    }

    // 保存初始评分
    const { error } = await client
      .from('credit_scores')
      .insert({
        user_id: userId,
        score: initialScore,
        level: level,
        factors: factors
      })

    if (error) {
      console.error('保存初始评分失败:', error)
    }

    return {
      score: initialScore,
      level: level,
      factors: factors
    }
  }

  async updateCreditScore(userId: string, score: number, level: string, factors?: any) {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('credit_scores')
      .insert({
        user_id: userId,
        score,
        level,
        factors
      })
      .select()
      .single()

    if (error) {
      throw new Error('更新信用评分失败')
    }

    return data
  }
}
