import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { 
  Plus, 
  CircleAlert
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
        // 初始化示例简历数据
        setResumeData({
          name: '小王',
          gender: '男',
          age: '26岁',
          phone: '133****3333',
          email: '1234@123.com',
          workRecords: [
            {
              id: '1',
              company: '某某科技有限公司',
              position: '高级前端工程师',
              startDate: '2022.03',
              endDate: '至今',
              description: '负责公司核心产品的前端架构设计与开发',
              isVerified: true
            },
            {
              id: '2',
              company: '互联网科技股份有限公司',
              position: '前端开发工程师',
              startDate: '2020.07',
              endDate: '2022.02',
              description: '参与电商平台前端开发，优化用户体验',
              isVerified: true
            }
          ],
          skills: [
            { id: '1', name: 'JavaScript/TypeScript', level: '精通', isVerified: true },
            { id: '2', name: 'React/Vue', level: '精通', isVerified: true },
            { id: '3', name: 'Node.js', level: '熟练', isVerified: false },
            { id: '4', name: 'Python', level: '熟练', isVerified: false }
          ],
          certifications: [
            { id: '1', name: '教师资格证', issuer: '教育部', date: '2021.06', isVerified: true },
            { id: '2', name: '法律职业资格证', issuer: '司法部', date: '2022.09', isVerified: true }
          ],
          education: [
            { 
              id: '1', 
              school: '中国xx大学', 
              degree: '硕士', 
              major: '计算机科学与技术',
              startDate: '2017.09',
              endDate: '2020.06',
              isVerified: true 
            },
            { 
              id: '2', 
              school: '中国xx大学', 
              degree: '本科', 
              major: '计算机科学与技术',
              startDate: '2013.09',
              endDate: '2017.06',
              isVerified: true 
            }
          ],
          languages: [
            { id: '1', name: '英语', level: 'CET-6', isVerified: true },
            { id: '2', name: '日语', level: 'N2', isVerified: false }
          ],
          projects: [
            { 
              id: '1', 
              name: '企业级管理系统', 
              role: '前端负责人',
              description: '负责整体架构设计和核心模块开发',
              isVerified: true 
            },
            { 
              id: '2', 
              name: '电商平台小程序', 
              role: '核心开发',
              description: '独立完成小程序端全部功能开发',
              isVerified: false 
            }
          ],
          other: [
            { id: '1', title: 'GitHub开源项目', content: '参与多个开源项目，累计Star 500+', isVerified: false }
          ]
        })
      }
    } catch (error) {
      console.error('获取简历失败:', error)
      // 初始化示例简历数据
      setResumeData({
        name: '小王',
        gender: '男',
        age: '26岁',
        phone: '133****3333',
        email: '1234@123.com',
        workRecords: [
          {
            id: '1',
            company: '某某科技有限公司',
            position: '高级前端工程师',
            startDate: '2022.03',
            endDate: '至今',
            description: '负责公司核心产品的前端架构设计与开发',
            isVerified: true
          },
          {
            id: '2',
            company: '互联网科技股份有限公司',
            position: '前端开发工程师',
            startDate: '2020.07',
            endDate: '2022.02',
            description: '参与电商平台前端开发，优化用户体验',
            isVerified: true
          }
        ],
        skills: [
          { id: '1', name: 'JavaScript/TypeScript', level: '精通', isVerified: true },
          { id: '2', name: 'React/Vue', level: '精通', isVerified: true },
          { id: '3', name: 'Node.js', level: '熟练', isVerified: false },
          { id: '4', name: 'Python', level: '熟练', isVerified: false }
        ],
        certifications: [
          { id: '1', name: '教师资格证', issuer: '教育部', date: '2021.06', isVerified: true },
          { id: '2', name: '法律职业资格证', issuer: '司法部', date: '2022.09', isVerified: true }
        ],
        education: [
          { 
            id: '1', 
            school: '中国xx大学', 
            degree: '硕士', 
            major: '计算机科学与技术',
            startDate: '2017.09',
            endDate: '2020.06',
            isVerified: true 
          },
          { 
            id: '2', 
            school: '中国xx大学', 
            degree: '本科', 
            major: '计算机科学与技术',
            startDate: '2013.09',
            endDate: '2017.06',
            isVerified: true 
          }
        ],
        languages: [
          { id: '1', name: '英语', level: 'CET-6', isVerified: true },
          { id: '2', name: '日语', level: 'N2', isVerified: false }
        ],
        projects: [
          { 
            id: '1', 
            name: '企业级管理系统', 
            role: '前端负责人',
            description: '负责整体架构设计和核心模块开发',
            isVerified: true 
          },
          { 
            id: '2', 
            name: '电商平台小程序', 
            role: '核心开发',
            description: '独立完成小程序端全部功能开发',
            isVerified: false 
          }
        ],
        other: [
          { id: '1', title: 'GitHub开源项目', content: '参与多个开源项目，累计Star 500+', isVerified: false }
        ]
      })
    }
  }

  const handleEditSection = (section: string) => {
    Taro.navigateTo({ 
      url: `/pages/resume-edit/index?section=${section}`
    })
  }

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
        {/* 工作记录 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">工作记录</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('workRecords')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.workRecords && resumeData.workRecords.length > 0 ? (
              <View className="space-y-3">
                {resumeData.workRecords.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-gray-900">{item.company}</Text>
                      {item.isVerified ? (
                        <View className="bg-blue-500 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-white">已认证</Text>
                        </View>
                      ) : (
                        <View className="flex items-center gap-1">
                          <CircleAlert size={12} color="#3b82f6" />
                          <Text className="text-xs text-blue-500">待认证</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex items-center gap-2 mb-1">
                      <Text className="text-xs text-gray-600">{item.position}</Text>
                      <Text className="text-xs text-gray-400">|</Text>
                      <Text className="text-xs text-gray-500">{item.startDate} - {item.endDate || '至今'}</Text>
                    </View>
                    {item.description && (
                      <Text className="text-xs text-gray-500">{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('workRecords')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">完善工作记录，树立良好职业形象</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 技能证书 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <View className="flex items-center gap-2">
                <Text className="text-base font-semibold text-gray-900">技能证书</Text>
                {resumeData?.certifications && resumeData.certifications.length > 0 && (
                  <Text className="text-sm text-gray-500">| {resumeData.certifications.length}个</Text>
                )}
              </View>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('certifications')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.certifications && resumeData.certifications.length > 0 ? (
              <View className="flex flex-row flex-wrap gap-3">
                {resumeData.certifications.map((item, index) => (
                  <View key={item.id || index} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col items-center">
                    <View className="bg-blue-500 rounded-full px-2 py-0.5 mb-2">
                      <Text className="text-xs text-white">已认证</Text>
                    </View>
                    <Text className="text-sm text-gray-700">{item.name}</Text>
                    {item.issuer && (
                      <Text className="text-xs text-gray-400 mt-1">{item.issuer}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('certifications')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">添加技能证书，展示专业能力</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 职业技能 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">职业技能</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('skills')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.skills && resumeData.skills.length > 0 ? (
              <View className="space-y-2">
                {resumeData.skills.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <View className="flex items-center gap-2">
                      <Text className="text-sm text-gray-900">{item.name}</Text>
                      {item.level && (
                        <>
                          <Text className="text-xs text-gray-400">|</Text>
                          <Text className="text-xs text-gray-600">{item.level}</Text>
                        </>
                      )}
                    </View>
                    {item.isVerified ? (
                      <View className="bg-blue-500 rounded-full px-2 py-0.5">
                        <Text className="text-xs text-white">已认证</Text>
                      </View>
                    ) : (
                      <View className="flex items-center gap-1">
                        <CircleAlert size={12} color="#3b82f6" />
                        <Text className="text-xs text-blue-500">待认证</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('skills')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">列举相关技能，提升竞争力</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 学历学籍 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">学历学籍</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('education')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.education && resumeData.education.length > 0 ? (
              <View className="space-y-3">
                {resumeData.education.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="text-sm font-medium text-gray-900">{item.school}</Text>
                        <Text className="text-xs text-gray-400">|</Text>
                        <Text className="text-xs text-gray-600">{item.degree}</Text>
                      </View>
                      {item.isVerified ? (
                        <View className="bg-blue-500 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-white">已认证</Text>
                        </View>
                      ) : (
                        <View className="bg-gray-300 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-white">待认证</Text>
                        </View>
                      )}
                    </View>
                    {item.major && (
                      <Text className="text-xs text-gray-500">{item.major}</Text>
                    )}
                    {(item.startDate || item.endDate) && (
                      <Text className="text-xs text-gray-400 mt-1">{item.startDate} - {item.endDate}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('education')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">添加学历信息，增强可信度</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 项目经历 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">项目经历</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('projects')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.projects && resumeData.projects.length > 0 ? (
              <View className="space-y-3">
                {resumeData.projects.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-gray-900">{item.name}</Text>
                      {item.isVerified ? (
                        <View className="bg-blue-500 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-white">已认证</Text>
                        </View>
                      ) : (
                        <View className="flex items-center gap-1">
                          <CircleAlert size={12} color="#3b82f6" />
                          <Text className="text-xs text-blue-500">待认证</Text>
                        </View>
                      )}
                    </View>
                    {item.role && (
                      <Text className="text-xs text-gray-600 mb-1">{item.role}</Text>
                    )}
                    {item.description && (
                      <Text className="text-xs text-gray-500">{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('projects')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">展示项目经验，体现实战能力</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 语言能力 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">语言能力</Text>
              <Button 
                size="sm" 
                className="bg-blue-500 rounded-full px-3 py-1 h-7"
                onClick={() => handleEditSection('languages')}
              >
                <Text className="text-white text-xs">编辑</Text>
              </Button>
            </View>
            {resumeData?.languages && resumeData.languages.length > 0 ? (
              <View className="space-y-2">
                {resumeData.languages.map((item, index) => (
                  <View key={item.id || index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <View className="flex items-center gap-2">
                      <Text className="text-sm text-gray-900">{item.name}</Text>
                      <Text className="text-xs text-gray-400">|</Text>
                      <Text className="text-xs text-gray-600">{item.level}</Text>
                    </View>
                    {item.isVerified ? (
                      <View className="bg-blue-500 rounded-full px-2 py-0.5">
                        <Text className="text-xs text-white">已认证</Text>
                      </View>
                    ) : (
                      <View className="flex items-center gap-1">
                        <CircleAlert size={12} color="#3b82f6" />
                        <Text className="text-xs text-blue-500">待认证</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View 
                className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center"
                onClick={() => handleEditSection('languages')}
              >
                <Plus size={24} color="#9ca3af" />
                <Text className="text-sm text-gray-400 mt-2">添加语言能力，拓宽职业发展</Text>
              </View>
            )}
          </CardContent>
        </Card>

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
