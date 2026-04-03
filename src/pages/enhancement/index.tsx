import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileSearch } from 'lucide-react-taro'
import {
  Shield,
  Award, 
  Briefcase, 
  GraduationCap, 
  FileText,
  CircleCheck,
  ChevronRight,
  ArrowRight,
  Star,
  Target,
  Zap,
  UserCheck,
  Building,
  Medal
} from 'lucide-react-taro'

interface EnhancementSuggestion {
  id: string
  category: 'authenticity' | 'stability' | 'compliance' | 'safety' | 'expertise' | 'reliability'
  dimension: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'missing' | 'incomplete' | 'pending'
  action: string
  actionText: string
  icon: any
}

interface CreditProfile {
  totalScore: number
  maxScore: number
  verifiedItems: number
  totalItems: number
  lastReportDate?: string
  identityVerified: boolean
  educationVerified: boolean
  workRecordsCount: number
  certsCount: number
  reportGenerated: boolean
}

const EnhancementPage: FC = () => {
  const { isLoggedIn, userInfo } = useUserStore()
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null)
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCreditProfile = useCallback(async () => {
    if (!userInfo?.id) return
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/credit/score',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      if (res.data.code === 200 && res.data.data) {
        // 有信用评分，说明已生成报告
        const score = res.data.data.score as number
        const profile: CreditProfile = {
          totalScore: Math.round((score - 350) / (940 - 350) * 100),
          maxScore: 100,
          verifiedItems: 5,
          totalItems: 8,
          lastReportDate: new Date().toISOString(),
          identityVerified: true,
          educationVerified: true,
          workRecordsCount: 2,
          certsCount: 1,
          reportGenerated: true
        }
        setCreditProfile(profile)
        generateSuggestions(profile)
      } else {
        // 没有信用评分，尚未生成报告
        setCreditProfile(null)
        setSuggestions([])
      }
    } catch (error) {
      console.error('获取信用评分失败:', error)
      setCreditProfile(null)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [userInfo?.id])

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchCreditProfile()
  }, [isLoggedIn, fetchCreditProfile])

  useDidShow(() => {
    if (isLoggedIn) {
      fetchCreditProfile()
    }
  })

  const generateSuggestions = (profile: CreditProfile) => {
    const suggestionList: EnhancementSuggestion[] = []

    // 真实性维度：身份认证、学历认证
    if (!profile.identityVerified) {
      suggestionList.push({
        id: 'identity',
        category: 'authenticity',
        dimension: '真实性',
        title: '身份信息未认证',
        description: '完成实名认证是建立信用档案的基础，直接影响真实性评分',
        priority: 'high',
        status: 'missing',
        action: '/pages/profile/index',
        actionText: '去认证',
        icon: UserCheck
      })
    }

    if (!profile.educationVerified) {
      suggestionList.push({
        id: 'education',
        category: 'authenticity',
        dimension: '真实性',
        title: '学历信息未认证',
        description: '通过学信网核验学历学位，提升个人信息真实性',
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=education',
        actionText: '去认证',
        icon: GraduationCap
      })
    }

    // 稳定性维度：工作履历完整性
    if (profile.workRecordsCount < 2) {
      suggestionList.push({
        id: 'work-stability',
        category: 'stability',
        dimension: '稳定性',
        title: '工作履历记录不足',
        description: '完整记录工作经历，连续稳定的职业轨迹有助于提升稳定性评分',
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=work',
        actionText: '去补充',
        icon: Building
      })
    } else if (profile.workRecordsCount < 3) {
      suggestionList.push({
        id: 'work-complete',
        category: 'stability',
        dimension: '稳定性',
        title: '工作履历待完善',
        description: '补充更完整的工作记录，展示稳定的职业发展路径',
        priority: 'medium',
        status: 'incomplete',
        action: '/pages/work-history/index?tab=work',
        actionText: '去补充',
        icon: Building
      })
    }

    // 专业性维度：职业资格证书
    if (profile.certsCount === 0) {
      suggestionList.push({
        id: 'certs',
        category: 'expertise',
        dimension: '专业性',
        title: '缺少职业资格证书',
        description: '添加行业认可的职业资格证书，有效提升专业性评分',
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=certs',
        actionText: '去添加',
        icon: Medal
      })
    }

    // 安全性维度：授权核查
    suggestionList.push({
      id: 'safety-check',
      category: 'safety',
      dimension: '安全性',
      title: '授权诉讼与黑名单核查',
      description: '主动授权系统核查诉讼记录和失信被执行人名单，无记录可显著提升安全性评分',
      priority: profile.reportGenerated ? 'medium' : 'high',
      status: 'pending',
      action: '/pages/authorize/index',
      actionText: '去授权',
      icon: Shield
    })

    // 可靠性维度：信用报告
    if (!profile.reportGenerated) {
      suggestionList.push({
        id: 'report',
        category: 'reliability',
        dimension: '可靠性',
        title: '尚未生成信用报告',
        description: '生成职业信用报告，完整呈现个人信用画像，提升整体可靠性',
        priority: 'high',
        status: 'missing',
        action: '/pages/report/index',
        actionText: '去生成',
        icon: FileText
      })
    } else if (!profile.lastReportDate || isReportOutdated(profile.lastReportDate)) {
      suggestionList.push({
        id: 'report-update',
        category: 'reliability',
        dimension: '可靠性',
        title: '信用报告需要更新',
        description: '报告已超过3个月，定期更新可保持信用信息时效性',
        priority: 'medium',
        status: 'incomplete',
        action: '/pages/report/index',
        actionText: '去更新',
        icon: FileText
      })
    }

    // 合规性维度：提示
    suggestionList.push({
      id: 'compliance',
      category: 'compliance',
      dimension: '合规性',
      title: '完善离职与竞业信息',
      description: '如实填写离职原因及竞业协议情况，合规的职业行为记录有助于提升合规性评分',
      priority: 'medium',
      status: 'pending',
      action: '/pages/work-history/index?tab=work',
      actionText: '去填写',
      icon: Award
    })

    // 按优先级排序
    suggestionList.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    setSuggestions(suggestionList)
  }

  const isReportOutdated = (lastDate: string): boolean => {
    const last = new Date(lastDate)
    const now = new Date()
    const diffMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth())
    return diffMonths >= 3
  }

  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600'
      case 'medium':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '重要'
      case 'medium':
        return '建议'
      default:
        return '可选'
    }
  }

  const creditTips = [
    {
      icon: UserCheck,
      title: '真实性',
      desc: '完成身份认证和学历核验，确保个人信息真实可信',
      tag: '基础'
    },
    {
      icon: Building,
      title: '稳定性',
      desc: '完整记录工作履历，体现连续稳定的职业发展轨迹',
      tag: '重要'
    },
    {
      icon: Award,
      title: '合规性',
      desc: '如实填写离职及竞业协议情况，保持职业行为合规',
      tag: '重要'
    },
    {
      icon: Shield,
      title: '安全性',
      desc: '授权核查诉讼记录和失信黑名单，无记录得满分',
      tag: '重要'
    },
    {
      icon: Medal,
      title: '专业性',
      desc: '添加职业资格证书、学历证明，展示专业能力',
      tag: '加分'
    },
    {
      icon: FileText,
      title: '可靠性',
      desc: '定期生成并更新信用报告，保持信用信息时效性',
      tag: '加分'
    }
  ]

  const selfProofSteps = [
    {
      step: 1,
      title: '填写工作履历',
      desc: '录入完整的工作经历，包括公司、职位、时间等'
    },
    {
      step: 2,
      title: '上传证明材料',
      desc: '提供劳动合同、社保记录、离职证明等材料'
    },
    {
      step: 3,
      title: 'AI智能核验',
      desc: '系统自动核验材料真实性和一致性'
    },
    {
      step: 4,
      title: '生成自证报告',
      desc: '生成可信的工作履历自证报告'
    }
  ]

  const maintenanceItems = [
    {
      title: '更新个人信息',
      desc: '保持联系方式、工作状态等信息最新',
      action: '/pages/profile/index'
    },
    {
      title: '添加新工作经历',
      desc: '及时记录新的工作经历和成就',
      action: '/pages/work-history/index'
    },
    {
      title: '上传新证书',
      desc: '持续添加学历、职业资格等证书',
      action: '/pages/work-history/index?type=cert'
    },
    {
      title: '定期生成报告',
      desc: '建议每季度更新一次信用报告',
      action: '/pages/report/index'
    }
  ]

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 头部卡片 */}
      <View className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-12 pb-6">
      </View>

      {/* 个性化增信建议 */}
      <View className="px-4 -mt-3">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <Target size={20} color="#3b82f6" />
                <CardTitle>个性化增信建议</CardTitle>
              </View>
              {creditProfile && suggestions.length > 0 && (
                <Badge className="bg-blue-100">
                  <Text className="text-xs text-blue-600">{suggestions.filter(s => s.priority === 'high').length} 项重要待完成</Text>
                </Badge>
              )}
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <View className="py-8 text-center">
                <Text className="text-gray-400">分析您的信用档案中...</Text>
              </View>
            ) : !creditProfile ? (
              <View className="py-6">
                <View className="flex items-start gap-4 mb-4">
                  <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileSearch size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="block text-base font-medium text-gray-900 mb-1">暂无个性化建议</Text>
                    <Text className="block text-sm text-gray-500 leading-relaxed">
                      生成职业信用报告后，系统将根据您的信用档案为您提供专属的增信建议。
                    </Text>
                  </View>
                </View>
                <View
                  className="w-full bg-blue-600 rounded-xl py-3 flex items-center justify-center active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileSearch size={18} color="#ffffff" />
                  <Text className="text-white text-sm font-medium ml-2">前往生成职业信用报告</Text>
                </View>
              </View>
            ) : suggestions.length > 0 ? (
              <View>
                {/* 当前状态概览 */}
                {creditProfile && (
                  <View className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <View className="flex items-center justify-between mb-2">
                      <Text className="text-sm text-gray-600">当前信用分</Text>
                      <Text className="text-lg font-bold text-blue-600">{creditProfile.totalScore}/{creditProfile.maxScore}</Text>
                    </View>
                    <Progress value={(creditProfile.totalScore / creditProfile.maxScore) * 100} />
                    <View className="flex items-center justify-between mt-2">
                      <Text className="text-xs text-gray-500">已认证 {creditProfile.verifiedItems}/{creditProfile.totalItems} 项</Text>
                      <Text className="text-xs text-gray-500">
                        {creditProfile.totalScore >= 80 ? '信用良好' : creditProfile.totalScore >= 60 ? '信用中等' : '待提升'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 建议列表 */}
                <View className="space-y-3">
                  {suggestions.map((item) => (
                    <View 
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl active:bg-gray-50"
                      onClick={() => handleNavigate(item.action)}
                    >
                      <View className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <item.icon size={20} color="#3b82f6" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <View className="flex items-center gap-2 mb-1">
                          <Text className="text-base font-medium text-gray-900">{item.title}</Text>
                          <View className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(item.priority)}`}>
                            <Text className="text-xs">{getPriorityText(item.priority)}</Text>
                          </View>
                        </View>
                        <View className="flex items-center gap-1 mb-1">
                          <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                            <Text className="text-xs text-blue-500">{item.dimension}</Text>
                          </View>
                        </View>
                        <Text className="text-sm text-gray-500">{item.description}</Text>
                        <View className="flex items-center justify-end mt-2">
                          <View className="flex items-center gap-1">
                            <Text className="text-xs text-blue-600">{item.actionText}</Text>
                            <ChevronRight size={14} color="#3b82f6" />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* 快速提升提示 */}
                <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <View className="flex items-start gap-2">
                    <Zap size={16} color="#f59e0b" className="mt-0.5" />
                    <View>
                      <Text className="text-sm font-medium text-yellow-800">快速提升建议</Text>
                      <Text className="text-xs text-yellow-700 mt-1">
                        优先完成标记为「重要」的项目，可快速提升信用分
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View className="py-8 text-center">
                <CircleCheck size={48} color="#10b981" className="mx-auto mb-3" />
                <Text className="text-base font-medium text-gray-900 mb-1">信用档案完善</Text>
                <Text className="text-sm text-gray-500">您的职业信用档案已基本完善，继续保持！</Text>
              </View>
            )}
          </CardContent>
        </Card>
      </View>

      {/* 如何提升信用分 */}
      <View className="px-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <View className="flex items-center gap-2">
              <Award size={20} color="#3b82f6" />
              <CardTitle>如何提升信用分</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="space-y-3">
              {creditTips.map((item, index) => (
                <View 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100"
                  onClick={() => handleNavigate('/pages/work-history/index')}
                >
                  <View className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <View className="flex items-center justify-between">
                      <Text className="text-base font-medium text-gray-900">{item.title}</Text>
                      <View className="bg-blue-50 px-2 py-0.5 rounded">
                        <Text className="text-xs font-medium text-blue-600">{item.tag}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-500 mt-0.5">{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 自证工具操作指引 */}
      <View className="px-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <Briefcase size={20} color="#3b82f6" />
                <CardTitle>自证工具</CardTitle>
              </View>
              <View className="bg-blue-100 px-2 py-0.5 rounded">
                <Text className="text-xs font-medium text-blue-600">推荐</Text>
              </View>
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Text className="block text-sm text-gray-600 mb-4">
              通过自证工具，完整展示您的工作履历，提升报告可信度和信用评分。
            </Text>
            
            {/* 步骤指引 */}
            <View className="space-y-3">
              {selfProofSteps.map((item, index) => (
                <View key={index} className="flex gap-3">
                  <View className="flex flex-col items-center">
                    <View className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                      <Text className="text-white text-sm font-medium">{item.step}</Text>
                    </View>
                    {index < selfProofSteps.length - 1 && (
                      <View className="w-0.5 h-8 bg-blue-200" />
                    )}
                  </View>
                  <View className="flex-1 pb-3">
                    <Text className="block text-base font-medium text-gray-900">{item.title}</Text>
                    <Text className="block text-sm text-gray-500 mt-0.5">{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Button 
              className="w-full mt-4 bg-blue-600" 
              onClick={() => handleNavigate('/pages/work-history/index')}
            >
              <Text className="text-white">前往自证</Text>
              <ArrowRight size={18} color="#ffffff" className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* 维护信息 */}
      <View className="px-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <View className="flex items-center gap-2">
              <Star size={20} color="#3b82f6" />
              <CardTitle>维护信息</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Text className="block text-sm text-gray-600 mb-3">
              定期维护您的个人信息，保持信用档案的时效性和准确性。
            </Text>
            
            <View className="space-y-2">
              {maintenanceItems.map((item, index) => (
                <View
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                  onClick={() => handleNavigate(item.action)}
                >
                  <View className="flex-1">
                    <Text className="block text-sm font-medium text-gray-900">{item.title}</Text>
                    <Text className="block text-xs text-gray-500 mt-0.5">{item.desc}</Text>
                  </View>
                  <ChevronRight size={18} color="#9ca3af" />
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 提升报告可信度 */}
      <View className="px-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <View className="flex items-center gap-2">
              <CircleCheck size={20} color="#3b82f6" />
              <CardTitle>提升报告可信度</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="space-y-3">
              <View className="flex items-start gap-2">
                <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                <Text className="text-sm text-gray-700 flex-1">
                  完整填写个人基本信息，确保信息真实准确
                </Text>
              </View>
              <View className="flex items-start gap-2">
                <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                <Text className="text-sm text-gray-700 flex-1">
                  提供学历、职业资格证书等证明材料
                </Text>
              </View>
              <View className="flex items-start gap-2">
                <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                <Text className="text-sm text-gray-700 flex-1">
                  自证完整工作履历，上传相关证明文件
                </Text>
              </View>
              <View className="flex items-start gap-2">
                <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                <Text className="text-sm text-gray-700 flex-1">
                  定期更新信用报告，保持信息时效性
                </Text>
              </View>
              <View className="flex items-start gap-2">
                <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                <Text className="text-sm text-gray-700 flex-1">
                  授权查询更多维度数据，丰富报告内容
                </Text>
              </View>
            </View>

            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-700">
                💡 提示：报告可信度越高，在求职、背调等场景中的认可度越高。
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 底部操作 */}
      <View className="px-4 mt-4">
        <Button 
          className="w-full bg-blue-600" 
          onClick={() => handleNavigate('/pages/work-history/index')}
        >
          <Briefcase size={18} color="#ffffff" />
          <Text className="text-white ml-2">前往自证</Text>
        </Button>
      </View>
    </View>
  )
}

export default EnhancementPage
