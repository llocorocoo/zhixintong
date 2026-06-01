import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  Shield, Award, GraduationCap,
  CircleCheck, ChevronRight, Target,
  UserCheck, Building, Medal, FileSearch
} from 'lucide-react-taro'

interface EnhancementSuggestion {
  id: string
  category: 'authenticity' | 'stability' | 'compliance' | 'safety' | 'expertise'
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

  const generateSuggestions = (_profile: CreditProfile) => {
    setSuggestions([
      {
        id: 'education',
        category: 'authenticity',
        dimension: '真实性',
        title: '完善学历认证',
        description: '通过学信网核验学历学位，提升个人信息真实性评分',
        priority: 'high',
        status: 'missing',
        action: '/pages/education-form/index',
        actionText: '去认证',
        icon: GraduationCap
      },
      {
        id: 'certs',
        category: 'expertise',
        dimension: '专业性',
        title: '添加职业资格证书',
        description: '添加行业认可的职业资格证书，有效提升专业性评分',
        priority: 'high',
        status: 'missing',
        action: '/pages/work-history/index?tab=certs',
        actionText: '去添加',
        icon: Medal
      },
      {
        id: 'work',
        category: 'stability',
        dimension: '稳定性',
        title: '添加工作履历',
        description: '完整记录工作经历，连续稳定的职业轨迹有助于提升稳定性评分',
        priority: 'medium',
        status: 'missing',
        action: '/pages/work-history/index?tab=work',
        actionText: '去补充',
        icon: Building
      },
    ])
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
      desc: '授权核查诉讼记录和法院执行限制名单，无记录得满分',
      tag: '重要'
    },
    {
      icon: Medal,
      title: '专业性',
      desc: '添加职业资格证书、学历证明，展示专业能力',
      tag: '加分'
    },
  ]

  const [pressedId, setPressedId] = useState<string | null>(null)
  const press = (id: string) => setPressedId(id)
  const release = () => setPressedId(null)

  const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    high:   { bg: 'rgba(220,38,38,0.1)',  color: '#dc2626', label: '重要' },
    medium: { bg: 'rgba(217,119,6,0.1)',  color: '#d97706', label: '建议' },
    low:    { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: '可选' },
  }

  const TIP_COLORS = ['#2563eb','#7c3aed','#d97706','#dc2626','#059669']

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部 ── */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>提升职业信用</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>完善信用档案，提升职业竞争力</Text>
      </View>

      <View style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── 个性化增信建议 ── */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
            <Target size={18} color="#2563eb" />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', marginLeft: '8px' }}>如何提升职业信用</Text>
          </View>

          <View style={{ padding: '16px 18px' }}>
            {loading ? (
              <View style={{ padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>分析您的信用档案中...</Text>
              </View>
            ) : !creditProfile ? (
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px' }}>
                <View style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                  <FileSearch size={32} color="#fff" />
                </View>
                <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px', lineHeight: '1.4' }}>暂无个性化建议</Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', lineHeight: '1.7', textAlign: 'center', marginBottom: '20px' }}>
                  生成职业信用报告后，系统将根据您的信用档案提供专属增信建议。
                </Text>
                <View
                  style={{ width: '100%', borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                  onTouchStart={() => press('empty-cta')} onTouchEnd={release} onTouchCancel={release}
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>前往生成职业信用报告</Text>
                </View>
              </View>
            ) : suggestions.length > 0 ? (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 建议列表 */}
                {suggestions.map(item => {
                  return (
                    <View
                      key={item.id}
                      style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px', transform: pressedId === item.id ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.2s ease' }}
                      onTouchStart={() => press(item.id)} onTouchEnd={release} onTouchCancel={release}
                      onClick={() => handleNavigate(item.action)}
                    >
                      <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={20} color="#2563eb" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ marginBottom: '4px' }}>
                          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</Text>
                        </View>
                        <View style={{ background: 'rgba(37,99,235,0.08)', borderRadius: '6px', padding: '1px 6px', display: 'inline-flex', marginBottom: '6px' }}>
                          <Text style={{ fontSize: '11px', color: '#2563eb', lineHeight: '1.5' }}>{item.dimension}</Text>
                        </View>
                        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.6' }}>{item.description}</Text>
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px', gap: '3px' }}>
                          <Text style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>{item.actionText}</Text>
                          <ChevronRight size={13} color="#2563eb" />
                        </View>
                      </View>
                    </View>
                  )
                })}

              </View>
            ) : (
              <View style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <CircleCheck size={44} color="#059669" />
                <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>信用档案完善</Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>您的职业信用档案已基本完善，继续保持！</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 如何提升职业信用分（2列网格）── */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} color="#2563eb" />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>如何提升职业信用分</Text>
          </View>
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {creditTips.map((item, i) => (
              <View
                key={i}
                style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px', transform: pressedId === `tip-${i}` ? 'scale(0.97)' : 'scale(1)', transition: 'all 0.2s ease' }}
                onTouchStart={() => press(`tip-${i}`)} onTouchEnd={release} onTouchCancel={release}
                onClick={() => handleNavigate('/pages/work-history/index')}
              >
                <View style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${TIP_COLORS[i]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <item.icon size={18} color={TIP_COLORS[i]} />
                </View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</Text>
                  <View style={{ background: TIP_COLORS[i] + '18', borderRadius: '6px', padding: '1px 6px' }}>
                    <Text style={{ fontSize: '10px', fontWeight: '600', color: TIP_COLORS[i], lineHeight: '1.5' }}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>


      </View>
    </View>
  )
}


export default EnhancementPage
