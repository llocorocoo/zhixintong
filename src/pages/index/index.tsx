import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileText, User, Shield, TrendingUp, ChevronRight, Award } from 'lucide-react-taro'

interface CreditScoreData {
  score: number
  level: string
  factors?: {
    identity?: number
    education?: number
    qualification?: number
    litigation?: number
    investment?: number
    financial?: number
  }
}

const IndexPage: FC = () => {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const { userInfo, isLoggedIn } = useUserStore()

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchCreditScore()
  }, [isLoggedIn])

  const fetchCreditScore = async () => {
    if (!userInfo?.id) return
    
    try {
      const res = await Network.request({
        url: '/api/credit/score',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      console.log('信用评分响应:', res.data)

      if (res.data.code === 200 && res.data.data) {
        setCreditScore(res.data.data)
      }
    } catch (error) {
      console.error('获取信用评分失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return '#10b981'
    if (score >= 650) return '#3b82f6'
    if (score >= 550) return '#f59e0b'
    return '#ef4444'
  }

  const getLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      medium: '中等',
      poor: '较差'
    }
    return levelMap[level] || level
  }

  const menuItems = [
    { icon: FileText, title: '生成信用报告', desc: '查询并生成职业信用报告', path: '/pages/report/index' },
    { icon: User, title: '可信简历', desc: '创建并维护个人可信简历', path: '/pages/resume/index' },
    { icon: TrendingUp, title: '信用增信', desc: '提升信用评分和报告可信度', path: '/pages/report/index?action=enhance' },
    { icon: Shield, title: '个人信息', desc: '维护个人基本信息', path: '/pages/profile/index' }
  ]

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-20">
      <View className="mb-6">
        <Text className="block text-xl font-semibold text-gray-900 mb-1">
          您好，{userInfo?.name || '用户'}
        </Text>
        <Text className="block text-sm text-gray-500">管理您的职业信用档案</Text>
      </View>

      <Card className="mb-4">
        <CardContent className="p-6">
          <View className="flex items-center justify-between">
            <View className="flex-1">
              <Text className="block text-sm text-gray-500 mb-2">职业信用评分</Text>
              {loading ? (
                <Text className="block text-4xl font-bold text-gray-400">--</Text>
              ) : (
                <>
                  <Text
                    className="block text-4xl font-bold mb-2"
                    style={{ color: getScoreColor(creditScore?.score || 0) }}
                  >
                    {creditScore?.score || '--'}
                  </Text>
                  <Badge variant={creditScore?.level === 'excellent' ? 'default' : 'secondary'}>
                    {getLevelText(creditScore?.level || '')}
                  </Badge>
                </>
              )}
            </View>
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center">
              <Award size={48} color="#ffffff" />
            </View>
          </View>
        </CardContent>
      </Card>

      <View className="space-y-3">
        {menuItems.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <View
                className="flex items-center p-4 active:bg-gray-50"
                onClick={() => {
                  if (item.path.includes('?')) {
                    Taro.navigateTo({ url: item.path })
                  } else {
                    Taro.switchTab({ url: item.path })
                  }
                }}
              >
                <View className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3">
                  <item.icon size={20} color="#1e40af" />
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-medium text-gray-900">{item.title}</Text>
                  <Text className="block text-sm text-gray-500">{item.desc}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardContent>
          </Card>
        ))}
      </View>
    </View>
  )
}

export default IndexPage
