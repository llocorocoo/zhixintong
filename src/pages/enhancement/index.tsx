import { View, Text } from '@tarojs/components'
import { FC } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Star
} from 'lucide-react-taro'

const EnhancementPage: FC = () => {
  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path })
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

      {/* 如何提升信用分 */}
      <View className="px-4 -mt-3">
        <Card className="shadow-md">
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
          <Text className="text-white ml-2">前往资料管理</Text>
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
