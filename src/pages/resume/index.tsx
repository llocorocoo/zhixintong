import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileSearch, ArrowRight } from 'lucide-react-taro'

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

const Badge: FC<{ verified: boolean }> = ({ verified }) => (
  <View
    className={`flex items-center justify-center px-2 py-0.5 rounded-full flex-shrink-0 ${
      verified ? 'bg-blue-500' : 'bg-gray-300'
    }`}
  >
    <Text className="text-white text-xs">{verified ? '已认证' : '待认证'}</Text>
  </View>
)

const SectionCard: FC<{ title: string; sub?: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <View className="mx-4 mb-3 bg-white rounded-xl p-4">
    <View className="flex items-center gap-2 mb-3">
      <Text className="text-base font-medium text-gray-900">{title}</Text>
      {sub && <Text className="text-sm text-gray-400">{sub}</Text>}
    </View>
    {children}
  </View>
)

const ResumePage: FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const { isLoggedIn, userInfo } = useUserStore()

  const fetchResume = useCallback(async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({
        url: '/api/resume',
        method: 'POST',
        data: { userId: userInfo.id }
      })
      if (res.data.code === 200) {
        setResumeData(res.data.data)
      }
    } catch (error) {
      console.error('获取简历失败:', error)
    }
  }, [userInfo?.id])

  useDidShow(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchResume()
  })

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <View className="bg-blue-500 px-4 py-3 flex items-center justify-center">
        <Text className="text-white text-lg font-medium">可信简历</Text>
      </View>

      {/* 空状态 */}
      {!resumeData && (
        <View className="p-4 pt-6">
          <View className="bg-white rounded-xl p-5 border-2 border-blue-100">
            <View className="flex items-start gap-4">
              <View className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileSearch size={28} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="block text-base font-medium text-gray-900 mb-2">暂无可信简历</Text>
                <Text className="block text-sm text-gray-500 mb-4 leading-relaxed">
                  您尚未生成职业信用报告。生成报告并选择「更新可信简历」后，您的可信简历将在此展示。
                </Text>
                <View
                  className="bg-blue-600 rounded-xl px-4 py-3 flex items-center justify-center active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileSearch size={16} color="#ffffff" />
                  <Text className="text-white text-sm font-medium ml-2">前往生成职业信用报告</Text>
                  <ArrowRight size={14} color="#ffffff" className="ml-1" />
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 有数据时展示简历 */}
      {resumeData && (
        <ScrollView scrollY className="flex-1" style={{ paddingBottom: '80px' }}>

          {/* 个人基础信息 */}
          <View className="mx-4 mt-3 mb-3 bg-white rounded-xl p-4">
            <View className="flex items-start gap-4">
              {/* 头像框 */}
              <View className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 bg-white">
                <Text className="text-gray-400 text-xs">头像</Text>
              </View>
              {/* 信息区 */}
              <View className="flex-1 flex flex-col gap-2">
                <Text className="text-lg font-medium text-gray-900">{resumeData.name || '用户'}</Text>
                <View className="border border-dashed border-gray-300 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-400">
                    {[resumeData.gender, resumeData.age, resumeData.phone, resumeData.email].filter(Boolean).join('  ') || '性别、年龄、手机号、邮箱等'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 工作记录 */}
          {resumeData.workRecords?.length > 0 && (
            <SectionCard title="工作记录">
              <View className="space-y-3">
                {resumeData.workRecords.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-900 flex-1 mr-2">{item.company}</Text>
                      <Badge verified={item.isVerified} />
                    </View>
                    <Text className="block text-xs text-gray-500 mb-1">
                      {item.position}  |  {item.startDate} - {item.endDate || '至今'}
                    </Text>
                    {item.description && (
                      <Text className="block text-xs text-gray-400">{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 技能证书 */}
          {resumeData.certifications?.length > 0 && (
            <SectionCard title="技能证书" sub={`| ${resumeData.certifications.length}个`}>
              <View className="flex flex-row flex-wrap gap-3">
                {resumeData.certifications.map((item, i) => (
                  <View key={item.id || i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col items-center">
                    <Badge verified={item.isVerified} />
                    <Text className="text-sm text-gray-700 mt-2">{item.name}</Text>
                    {item.issuer && (
                      <Text className="text-xs text-gray-400 mt-1">{item.issuer}</Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 职业技能 */}
          {resumeData.skills?.length > 0 && (
            <SectionCard title="职业技能">
              <View className="space-y-2">
                {resumeData.skills.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <View className="flex items-center gap-2 flex-1">
                      <Text className="text-sm text-gray-900">{item.name}</Text>
                      {item.level && (
                        <>
                          <Text className="text-xs text-gray-400">|</Text>
                          <Text className="text-xs text-gray-500">{item.level}</Text>
                        </>
                      )}
                    </View>
                    <Badge verified={item.isVerified} />
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 学历学籍 */}
          {resumeData.education?.length > 0 && (
            <SectionCard title="学历学籍">
              <View className="space-y-3">
                {resumeData.education.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-900 flex-1 mr-2">
                        {item.school}  |  {item.degree}
                      </Text>
                      <Badge verified={item.isVerified} />
                    </View>
                    {item.major && (
                      <Text className="block text-xs text-gray-500 mb-0.5">{item.major}</Text>
                    )}
                    {(item.startDate || item.endDate) && (
                      <Text className="block text-xs text-gray-400">{item.startDate} - {item.endDate}</Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 项目经历 */}
          {resumeData.projects?.length > 0 && (
            <SectionCard title="项目经历">
              <View className="space-y-3">
                {resumeData.projects.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-900 flex-1 mr-2">{item.name}</Text>
                      <Badge verified={item.isVerified} />
                    </View>
                    {item.role && (
                      <Text className="block text-xs text-gray-500 mb-0.5">{item.role}</Text>
                    )}
                    {item.description && (
                      <Text className="block text-xs text-gray-400">{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 语言能力 */}
          {resumeData.languages?.length > 0 && (
            <SectionCard title="语言能力">
              <View className="space-y-2">
                {resumeData.languages.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <View className="flex items-center gap-2 flex-1">
                      <Text className="text-sm text-gray-900">{item.name}</Text>
                      <Text className="text-xs text-gray-400">|</Text>
                      <Text className="text-xs text-gray-500">{item.level}</Text>
                    </View>
                    <Badge verified={item.isVerified} />
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* 其他 */}
          {resumeData.other?.length > 0 && (
            <SectionCard title="其他">
              <View className="space-y-2">
                {resumeData.other.map((item, i) => (
                  <View key={item.id || i} className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <Text className="text-sm text-gray-900">{item.title}</Text>
                    {item.content && (
                      <Text className="block text-xs text-gray-400 mt-0.5">{item.content}</Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  )
}

export default ResumePage
