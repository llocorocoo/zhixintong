import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Briefcase, FileText, Wrench, ChevronRight, FileSearch, UserCheck, TrendingUp, Shield, Award } from 'lucide-react-taro'

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
  const [showDetail, setShowDetail] = useState(false)
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

  const getFactorText = (key: string) => {
    const factorMap: Record<string, string> = {
      identity: '身份学历',
      education: '教育背景',
      qualification: '职业资格',
      litigation: '诉讼记录',
      investment: '投资任职',
      financial: '金融信用'
    }
    return factorMap[key] || key
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
      path: '/pages/enhancement/index'
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
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* 信用分主区域 */}
            <View className="p-5">
              {/* 信用分居中显示 */}
              <View className="flex items-center justify-center mb-4">
                <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                  <Award size={32} color="#ffffff" />
                </View>
                <View className="flex items-center" onClick={() => setShowDetail(!showDetail)}>
                  <Text className="text-5xl font-bold text-blue-600">
                    {creditScore?.score || '650'}
                  </Text>
                  <View className="ml-2 p-1">
                    <ChevronRight 
                      size={24} 
                      color="#3b82f6" 
                      style={{ 
                        transform: showDetail ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* 下方左右分布：slogan + 按钮 */}
              <View className="flex items-center justify-between">
                {/* 左侧slogan */}
                <View className="flex-1 pr-3">
                  <Text className="text-gray-500 text-sm">
                    职业信用，职场通行证
                  </Text>
                </View>
                
                {/* 右侧按钮 */}
                <View
                  className="bg-blue-600 rounded-full px-5 py-3 shadow-md active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <Text className="text-white text-sm font-medium">立即提信用</Text>
                </View>
              </View>
            </View>

            {/* 信用分详情卡片（展开/收起） */}
            {showDetail && (
              <View className="border-t border-gray-100 bg-gray-50 p-4">
                <Text className="block text-sm font-semibold text-gray-700 mb-3">信用评分明细</Text>
                <View className="space-y-2">
                  {creditScore?.factors && Object.entries(creditScore.factors).map(([key, value]) => (
                    <View key={key} className="flex items-center justify-between py-1.5">
                      <Text className="text-sm text-gray-600">{getFactorText(key)}</Text>
                      <View className="flex items-center">
                        <View className="w-24 h-1.5 bg-gray-200 rounded-full mr-2">
                          <View 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </View>
                        <Text className="text-sm font-medium text-gray-900 w-8 text-right">{value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-xs text-gray-400">
                    更新时间：{new Date().toLocaleDateString('zh-CN')}
                  </Text>
                </View>
              </View>
            )}
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
                  const tabBarPages = ['/pages/index/index', '/pages/report/index', '/pages/resume/index', '/pages/profile/index']
                  const isTabBar = tabBarPages.some(p => item.path.startsWith(p))
                  if (isTabBar) {
                    Taro.switchTab({ url: item.path })
                  } else {
                    Taro.navigateTo({ url: item.path })
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
