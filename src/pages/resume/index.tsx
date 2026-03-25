import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { User, Mail, Phone, Briefcase, GraduationCap, Award, Plus, CircleCheck } from 'lucide-react-taro'

interface ResumeData {
  summary?: string
  workExperience?: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description?: string
    isVerified: boolean
  }>
  education?: Array<{
    school: string
    degree: string
    major: string
    startDate: string
    endDate: string
  }>
  skills?: string[]
  certifications?: Array<{
    name: string
    issuer: string
    date: string
  }>
  isVerified: boolean
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
      }
    } catch (error) {
      console.error('获取简历失败:', error)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-20">
      <Card className="mb-4">
        <CardContent className="p-6">
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center">
              <User size={32} color="#ffffff" />
            </View>
            <View className="flex-1">
              <View className="flex items-center gap-2 mb-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {userInfo?.name || '未设置姓名'}
                </Text>
                {resumeData?.isVerified && (
                  <Badge>
                    <CircleCheck size={12} color="#ffffff" className="mr-1" />
                    已认证
                  </Badge>
                )}
              </View>
              <View className="space-y-1">
                <View className="flex items-center gap-2">
                  <Phone size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500">{userInfo?.phone || '未设置'}</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Mail size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500">{userInfo?.email || '未设置'}</Text>
                </View>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      {resumeData?.summary && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>个人简介</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-sm text-gray-700 leading-relaxed">{resumeData.summary}</Text>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <View className="flex items-center justify-between">
            <CardTitle>工作经历</CardTitle>
            <Button size="sm" variant="outline">
              <Plus size={16} color="#1e40af" />
              <Text className="text-blue-800 ml-1">添加</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          {resumeData?.workExperience && resumeData.workExperience.length > 0 ? (
            <View className="space-y-4">
              {resumeData.workExperience.map((work, index) => (
                <View key={index} className="border-l-2 border-blue-800 pl-4 py-2">
                  <View className="flex items-center gap-2 mb-1">
                    <Text className="font-medium text-gray-900">{work.position}</Text>
                    {work.isVerified && <Badge variant="secondary">已认证</Badge>}
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">{work.company}</Text>
                  <Text className="text-xs text-gray-400">
                    {work.startDate} - {work.endDate || '至今'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="text-center py-6">
              <Briefcase size={40} color="#d1d5db" className="mx-auto mb-2" />
              <Text className="text-sm text-gray-500">暂无工作经历</Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <View className="flex items-center justify-between">
            <CardTitle>教育背景</CardTitle>
            <Button size="sm" variant="outline">
              <Plus size={16} color="#1e40af" />
              <Text className="text-blue-800 ml-1">添加</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          {resumeData?.education && resumeData.education.length > 0 ? (
            <View className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <View key={index} className="border-l-2 border-blue-800 pl-4 py-2">
                  <Text className="font-medium text-gray-900 mb-1">{edu.school}</Text>
                  <Text className="text-sm text-gray-600">{edu.degree} · {edu.major}</Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="text-center py-6">
              <GraduationCap size={40} color="#d1d5db" className="mx-auto mb-2" />
              <Text className="text-sm text-gray-500">暂无教育背景</Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <View className="flex items-center justify-between">
            <CardTitle>技能证书</CardTitle>
            <Button size="sm" variant="outline">
              <Plus size={16} color="#1e40af" />
              <Text className="text-blue-800 ml-1">添加</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          {resumeData?.certifications && resumeData.certifications.length > 0 ? (
            <View className="space-y-3">
              {resumeData.certifications.map((cert, index) => (
                <View key={index} className="flex items-start gap-3">
                  <Award size={18} color="#d97706" className="mt-0.5" />
                  <View>
                    <Text className="font-medium text-gray-900">{cert.name}</Text>
                    <Text className="text-sm text-gray-500">{cert.issuer} · {cert.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="text-center py-6">
              <Award size={40} color="#d1d5db" className="mx-auto mb-2" />
              <Text className="text-sm text-gray-500">暂无技能证书</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  )
}

export default ResumePage
