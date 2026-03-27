import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { 
  TrendingUp, 
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
  Medal,
  FileSearch
} from 'lucide-react-taro'

interface EnhancementSuggestion {
  id: string
  category: 'identity' | 'education' | 'work' | 'cert' | 'report'
  title: string
  description: string
  scoreImpact: number
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
  const { isLoggedIn } = useUserStore()
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null)
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchCreditProfile()
  }, [isLoggedIn])

  const fetchCreditProfile = async () => {
    setLoading(true)
    try {
      // 尝试获取用户信用档案
      const res = await Network.request({
        url: '/api/user/credit-profile',
        method: 'GET'
      })

      if (res.data.code === 200 && res.data.data) {
        setCreditProfile(res.data.data)
        generateSuggestions(res.data.data)
      } else {
        // 使用模拟数据
        const mockProfile: CreditProfile = {
          totalScore: 65,
          maxScore: 100,
          verifiedItems: 3,
          totalItems: 8,
          lastReportDate: undefined,
          identityVerified: true,
          educationVerified: false,
          workRecordsCount: 2,
          certsCount: 0,
          reportGenerated: false
        }
        setCreditProfile(mockProfile)
        generateSuggestions(mockProfile)
      }
    } catch (error) {
      console.error('获取信用档案失败:', error)
      // 使用模拟数据
      const mockProfile: CreditProfile = {
        totalScore: 65,
        maxScore: 100,
        verifiedItems: 3,
        totalItems: 8,
        lastReportDate: undefined,
        identityVerified: true,
        educationVerified: false,
        workRecordsCount: 2,
        certsCount: 0,
        reportGenerated: false
      }
      setCreditProfile(mockProfile)
      generateSuggestions(mockProfile)
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = (profile: CreditProfile) => {
    const suggestionList: EnhancementSuggestion[] = []

    // 学历认证建议
    if (!profile.educationVerified) {
      suggestionList.push({
        id: 'education',
        category: 'education',
        title: '学历信息未认证',
        description: '认证您的学历学位信息，提升报告可信度',
        scoreImpact: 15,
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=education',
        actionText: '去认证',
        icon: GraduationCap
      })
    }

    // 证书资质建议
    if (profile.certsCount === 0) {
      suggestionList.push({
        id: 'certs',
        category: 'cert',
        title: '缺少职业资格证书',
        description: '添加职业资格、技能证书，展示专业能力',
        scoreImpact: 10,
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=certs',
        actionText: '去添加',
        icon: Medal
      })
    }

    // 工作履历建议
    if (profile.workRecordsCount < 3) {
      suggestionList.push({
        id: 'work',
        category: 'work',
        title: '工作履历不完整',
        description: `当前仅有 ${profile.workRecordsCount} 条工作记录，建议补充完整`,
        scoreImpact: 12,
        priority: 'medium',
        status: 'incomplete',
        action: '/pages/work-history/index?tab=work',
        actionText: '去补充',
        icon: Building
      })
    }

    // 信用报告建议
    if (!profile.reportGenerated) {
      suggestionList.push({
        id: 'report',
        category: 'report',
        title: '尚未生成信用报告',
        description: '生成职业信用报告，获得完整的信用评估',
        scoreImpact: 10,
        priority: 'high',
        status: 'missing',
        action: '/pages/report/index',
        actionText: '去生成',
        icon: FileText
      })
    } else if (!profile.lastReportDate || isReportOutdated(profile.lastReportDate)) {
      suggestionList.push({
        id: 'report-update',
        category: 'report',
        title: '信用报告需要更新',
        description: '您的信用报告已超过3个月，建议更新以保持时效性',
        scoreImpact: 5,
        priority: 'medium',
        status: 'incomplete',
        action: '/pages/report/index',
        actionText: '去更新',
        icon: FileText
      })
    }

    // 身份认证建议
    if (!profile.identityVerified) {
      suggestionList.push({
        id: 'identity',
        category: 'identity',
        title: '身份信息未认证',
        description: '完成实名认证，这是信用档案的基础',
        scoreImpact: 20,
        priority: 'high',
        status: 'missing',
        action: '/pages/profile/index',
        actionText: '去认证',
        icon: UserCheck
      })
    }

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
      icon: Shield,
      title: '完善身份信息',
      desc: '实名认证、学历验证、职业资格认证',
      score: '+20分'
    },
    {
      icon: Briefcase,
      title: '自证工作履历',
      desc: '完整的工作经历、项目经验证明',
      score: '+15分'
    },
    {
      icon: GraduationCap,
      title: '教育背景认证',
      desc: '学历学位认证、专业证书',
      score: '+10分'
    },
    {
      icon: FileText,
      title: '生成信用报告',
      desc: '定期生成职业信用报告',
      score: '+10分'
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
        <View className="flex items-center gap-3 mb-3">
          <View className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <TrendingUp size={24} color="#ffffff" />
          </View>
          <View>
            <Text className="block text-white text-xl font-bold">信用增信</Text>
            <Text className="block text-white text-sm opacity-90">提升您的职业信用分</Text>
          </View>
        </View>
        <Text className="block text-white text-sm opacity-80 leading-relaxed">
          通过完善个人信息、自证工作履历、生成信用报告等方式，全面提升您的职业信用评分，增强报告可信度。
        </Text>
      </View>

      {/* 暂无信用报告提示 */}
      {creditProfile && !creditProfile.reportGenerated && (
        <View className="px-4 -mt-3">
          <Card className="shadow-md border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <View className="flex items-start gap-3">
                <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileSearch size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-semibold text-gray-900 mb-1">暂无信用报告</Text>
                  <Text className="block text-sm text-gray-600 mb-3">
                    您尚未生成职业信用报告，生成后可获得完整的信用评估，并解锁更多增信建议。
                  </Text>
                  <Button 
                    className="bg-blue-600 w-full" 
                    onClick={() => handleNavigate('/pages/report/index')}
                  >
                    <FileText size={18} color="#ffffff" />
                    <Text className="text-white ml-2">立即生成信用报告</Text>
                  </Button>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      )}

      {/* 个性化增信建议 */}
      <View className={`px-4 ${creditProfile && !creditProfile.reportGenerated ? 'mt-4' : '-mt-3'}`}>
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <Target size={20} color="#3b82f6" />
                <CardTitle>个性化增信建议</CardTitle>
              </View>
              {creditProfile && (
                <Badge className="bg-blue-100">
                  <Text className="text-xs text-blue-600">可提升 {suggestions.reduce((sum, s) => sum + s.scoreImpact, 0)} 分</Text>
                </Badge>
              )}
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <View className="py-8 text-center">
                <Text className="text-gray-400">分析您的信用档案中...</Text>
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
                        <Text className="text-sm text-gray-500">{item.description}</Text>
                        <View className="flex items-center justify-between mt-2">
                          <Text className="text-xs text-green-600 font-medium">预计 +{item.scoreImpact} 分</Text>
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
                      <View className="bg-green-100 px-2 py-0.5 rounded">
                        <Text className="text-sm font-medium text-green-600">{item.score}</Text>
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
                <CardTitle>自证工具 - 工作履历</CardTitle>
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
              <Text className="text-white">前往资料管理</Text>
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
          <Text className="text-white ml-2">前往资料管理</Text>
        </Button>
      </View>
    </View>
  )
}

export default EnhancementPage
