import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileSearch, ArrowRight, UserCheck } from 'lucide-react-taro'

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
  <View style={{ margin: '0 16px 12px', background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>{title}</Text>
      {sub && <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{sub}</Text>}
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

  const [btnPressed, setBtnPressed] = useState(false)

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部 ── */}
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '20px 20px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>可信简历</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>经过核实的权威职业档案</Text>
      </View>

      {/* ── 空状态 ── */}
      {!resumeData && (
        <View style={{ padding: '16px' }}>
          <View style={{
            background: '#fff', borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
          }}>
            {/* 插画区 */}
            <View style={{ padding: '40px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <View style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 28px rgba(37,99,235,0.35)',
              }}>
                <UserCheck size={44} color="#fff" />
              </View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.3', marginBottom: '10px' }}>
                暂无可信简历
              </Text>
              <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', lineHeight: '1.7', textAlign: 'center' }}>
                生成职业信用报告并完成核查后，点击「更新可信简历」即可在此查看您的权威职业档案。
              </Text>
            </View>

            {/* CTA */}
            <View style={{ padding: '0 20px 28px' }}>
              <View
                style={{
                  borderRadius: '16px', padding: '15px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                  transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                onTouchStart={() => setBtnPressed(true)}
                onTouchEnd={() => setBtnPressed(false)}
                onTouchCancel={() => setBtnPressed(false)}
                onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
              >
                <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>
                  前往生成职业信用报告
                </Text>
                <ArrowRight size={17} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 有数据时展示简历 */}
      {resumeData && (
        <ScrollView scrollY className="flex-1" style={{ paddingBottom: '80px' }}>

          {/* 个人基础信息 */}
          <View style={{ margin: '16px 16px 12px', background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
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
