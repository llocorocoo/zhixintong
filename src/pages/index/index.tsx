import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Briefcase, FileText, Wrench, ChevronRight, FileSearch, UserCheck, TrendingUp, Shield } from 'lucide-react-taro'

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
    }
  }

  const getLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      excellent: '信用优秀',
      good: '信用良好',
      medium: '信用中等',
      poor: '信用较差'
    }
    return levelMap[level] || level
  }

  const quickActions = [
    { icon: Briefcase, title: 'AI自证', action: () => {} },
    { icon: FileText, title: '样例报告', action: () => {} },
    { icon: Wrench, title: '信用修复', action: () => {} }
  ]

  const menuItems = [
    { 
      icon: FileSearch, 
      title: '信用报告', 
      desc: '授权查询并生成信用报告',
      path: '/pages/report/index'
    },
    { 
      icon: UserCheck, 
      title: '可信简历', 
      desc: '生成和维护可信简历',
      path: '/pages/resume/index'
    },
    { 
      icon: TrendingUp, 
      title: '信用增信', 
      desc: '提升信用分和报告可信度',
      path: '/pages/report/index?action=enhance'
    },
    { 
      icon: Shield, 
      title: '个人信息', 
      desc: '完善维护个人基础信息',
      path: '/pages/profile/index'
    }
  ]

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部蓝色信息栏 */}
      <View className="bg-blue-500 px-4 pt-12 pb-20">
        <Text className="block text-white text-xl font-semibold mb-1">
          Hi {userInfo?.name || '用户'}
        </Text>
        <Text className="block text-white text-sm opacity-90">
          管理您的职业信用档案
        </Text>
      </View>

      {/* 核心信用展示区 */}
      <View className="px-4 -mt-12">
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <View className="flex items-center justify-between">
              {/* 左侧信用评分 */}
              <View className="flex-1">
                <Text className="block text-gray-500 text-sm mb-2">
                  {creditScore ? getLevelText(creditScore.level) : '信用良好'}
                </Text>
                <Text className="block text-5xl font-bold text-blue-600">
                  {creditScore?.score || '650'}
                </Text>
              </View>
              
              {/* 中间占位 */}
              <View className="flex-1 flex items-center justify-center">
                <View 
                  className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-3"
                  style={{ minWidth: '80px' }}
                >
                  <Text className="text-gray-400 text-xs text-center">slogan图文</Text>
                </View>
              </View>
              
              {/* 右侧按钮 */}
              <View className="flex-1 flex justify-end">
                <View
                  className="bg-blue-600 rounded-full px-5 py-3 shadow-md active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <Text className="text-white text-sm font-medium">立即提信用</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 快捷功能图标区 */}
      <View className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <View className="flex justify-around">
              {quickActions.map((item, index) => (
                <View
                  key={index}
                  className="flex flex-col items-center active:opacity-70"
                  onClick={item.action}
                >
                  <View className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <item.icon size={24} color="#3b82f6" />
                  </View>
                  <Text className="text-sm text-blue-600">{item.title}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 核心功能列表区 */}
      <View className="px-4 mt-4">
        {menuItems.map((item, index) => (
          <Card key={index} className="mb-3">
            <CardContent className="p-0">
              <View
                className="flex items-center p-4 active:bg-gray-50"
                onClick={() => {
                  if (item.path.includes('action=')) {
                    Taro.navigateTo({ url: item.path })
                  } else {
                    Taro.switchTab({ url: item.path })
                  }
                }}
              >
                <View className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3">
                  <item.icon size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-semibold text-gray-900">{item.title}</Text>
                  <Text className="block text-sm text-gray-500 mt-0.5">{item.desc}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

      {/* 底部图文模块占位 */}
      <View className="px-4 mt-4 mb-6">
        <View className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center">
          <Text className="text-gray-400 text-sm">图文模块</Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage
