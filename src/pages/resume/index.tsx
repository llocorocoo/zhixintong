import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { 
  Plus, 
  Briefcase, 
  Award, 
  Wrench, 
  GraduationCap,
  Languages,
  FolderOpen,
  CircleAlert,
  ChevronRight
} from 'lucide-react-taro'

interface ResumeData {
  avatar?: string
  name: string
  gender?: string
  age?: string
  phone?: string
  email?: string
  workRecords: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate?: string
    description?: string
    isVerified: boolean
  }>
  skills: Array<{
    id: string
    name: string
    level?: string
    isVerified: boolean
  }>
  certifications: Array<{
    id: string
    name: string
    issuer?: string
    date?: string
    isVerified: boolean
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    major?: string
    startDate?: string
    endDate?: string
    isVerified: boolean
  }>
  languages?: Array<{
    id: string
    name: string
    level: string
    isVerified: boolean
  }>
  projects?: Array<{
    id: string
    name: string
    role: string
    description?: string
    isVerified: boolean
  }>
  other?: Array<{
    id: string
    title: string
    content?: string
    isVerified: boolean
  }>
}

const ResumePage: FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const { userInfo, isLoggedIn } = useUserStore()

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchResume()
  }, [isLoggedIn])

  const fetchResume = async () => {
    if (!userInfo?.id) return
    
    try {
      const res = await Network.request({
        url: '/api/resume',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      console.log('简历数据响应:', res.data)

      if (res.data.code === 200 && res.data.data) {
        setResumeData(res.data.data)
      } else {
        // 初始化空简历数据
        setResumeData({
          name: userInfo?.name || '',
          phone: userInfo?.phone || '',
          email: userInfo?.email || '',
          workRecords: [],
          skills: [],
          certifications: [],
          education: [],
          languages: [],
          projects: [],
          other: []
        })
      }
    } catch (error) {
      console.error('获取简历失败:', error)
      // 初始化空简历数据
      setResumeData({
        name: userInfo?.name || '',
        phone: userInfo?.phone || '',
        email: userInfo?.email || '',
        workRecords: [],
        skills: [],
        certifications: [],
        education: [],
        languages: [],
        projects: [],
        other: []
      })
    }
  }

  const handleEditSection = (section: string) => {
    Taro.navigateTo({ 
      url: `/pages/resume-edit/index?section=${section}`
    })
  }

  const sections = [
    {
      id: 'workRecords',
      title: '工作记录',
      icon: Briefcase,
      items: resumeData?.workRecords || [],
      emptyText: '完善工作记录，树立良好职业形象',
      actionText: '编辑'
    },
    {
      id: 'skills',
      title: '职业技能',
      icon: Wrench,
      items: resumeData?.skills || [],
      emptyText: '列举相关技能，提升竞争力',
      actionText: '编辑'
    },
    {
      id: 'certifications',
      title: '技能证书',
      icon: Award,
      items: resumeData?.certifications || [],
      emptyText: '添加技能证书，展示专业能力',
      actionText: '编辑',
      showCount: true
    },
    {
      id: 'education',
      title: '学历学籍',
      icon: GraduationCap,
      items: resumeData?.education || [],
      emptyText: '添加学历信息，增强可信度',
      actionText: '编辑'
    },
    {
      id: 'projects',
      title: '项目经历',
      icon: FolderOpen,
      items: resumeData?.projects || [],
      emptyText: '展示项目经验，体现实战能力',
      actionText: '编辑'
    },
    {
      id: 'languages',
      title: '语言能力',
      icon: Languages,
      items: resumeData?.languages || [],
      emptyText: '添加语言能力，拓宽职业发展',
      actionText: '编辑'
    }
  ]

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-blue-500 px-4 py-3 flex items-center">
        <Text className="flex-1 text-center text-white text-lg font-semibold">可信简历</Text>
      </View>

      <ScrollView className="flex-1 p-4 pb-20">
        {/* 个人基础信息区 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-start gap-4">
              {/* 头像 */}
              <View className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                {resumeData?.avatar ? (
                  <View className="w-full h-full rounded-lg bg-gray-100" />
                ) : (
                  <Text className="text-gray-400 text-sm">头像</Text>
                )}
              </View>
              
              {/* 用户信息 */}
              <View className="flex-1">
                <View className="flex items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {resumeData?.name || '用户user'}
                  </Text>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 rounded-full px-3 py-1 h-7"
                    onClick={() => handleEditSection('basic')}
                  >
                    <Text className="text-white text-xs">编辑</Text>
                  </Button>
                </View>
                
                {/* 补充信息 */}
                <View className="rounded-lg border-2 border-dashed border-gray-300 p-3 bg-white">
                  <Text className="text-sm text-gray-400">
                    {resumeData?.gender || resumeData?.age || resumeData?.phone || resumeData?.email
                      ? `${resumeData?.gender || ''} ${resumeData?.age || ''} ${resumeData?.phone || ''} ${resumeData?.email || ''}`.trim()
                      : '性别、年龄、手机号、邮箱等'}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 各资料区块 */}
        {sections.map((section) => (
          <Card key={section.id} className="mb-4 bg-white">
            <CardContent className="p-4">
              {/* 区块标题 */}
              <View className="flex items-center justify-between mb-3">
                <View className="flex items-center gap-2">
                  <Text className="text-base font-semibold text-gray-900">{section.title}</Text>
                  {section.showCount && section.items.length > 0 && (
                    <Text className="text-sm text-gray-500">| {section.items.length}个</Text>
                  )}
                </View>
                <Button 
                  size="sm" 
                  className="bg-blue-500 rounded-full px-3 py-1 h-7"
                  onClick={() => handleEditSection(section.id)}
                >
                  <Text className="text-white text-xs">{section.actionText}</Text>
                </Button>
              </View>

              {/* 内容区 */}
              {section.items.length > 0 ? (
                <View className="space-y-2">
                  {section.items.map((item, index) => (
                    <View 
                      key={item.id || index}
                      className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <View className="flex items-center gap-2 flex-1">
                        {item.isVerified && (
                          <Badge className="bg-blue-500 px-2 py-0.5 rounded text-xs">
                            <Text className="text-white">已认证</Text>
                          </Badge>
                        )}
                        <Text className="text-sm text-gray-900">
                          {item.name || item.company || item.school || item.title}
                        </Text>
                      </View>
                      {!item.isVerified && (
                        <View className="flex items-center gap-1">
                          <CircleAlert size={14} color="#3b82f6" />
                          <Text className="text-xs text-blue-500">待认证</Text>
                          <ChevronRight size={14} color="#3b82f6" />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View 
                  className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => handleEditSection(section.id)}
                >
                  <Plus size={24} color="#9ca3af" />
                  <Text className="text-sm text-gray-400 mt-2">{section.emptyText}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        ))}

        {/* 其他信息区块 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">其他</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('other')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.other && resumeData.other.length > 0 ? (
              <View className="space-y-2">
                {resumeData.other.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-900">{item.title}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('other')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">添加其他信息</Text>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  )
}

export default ResumePage
