import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  Shield, Award, Briefcase, GraduationCap, FileText,
  CircleCheck, ChevronRight, ArrowRight, Target, Zap,
  UserCheck, Building, Medal, FileSearch, Star
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
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>提升信用</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>完善信用档案，提升职业竞争力</Text>
      </View>

      <View style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── 个性化增信建议 ── */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#2563eb" />
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>个性化增信建议</Text>
            </View>
            {creditProfile && suggestions.length > 0 && (
              <View style={{ background: 'rgba(37,99,235,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
                <Text style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', lineHeight: '1.5' }}>
                  {suggestions.filter(s => s.priority === 'high').length} 项重要
                </Text>
              </View>
            )}
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
                {/* 概览 */}
                <View style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.5' }}>已认证项目</Text>
                    <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.3' }}>{creditProfile.verifiedItems}<Text style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '400' }}>/{creditProfile.totalItems}</Text></Text>
                  </View>
                  <View style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />
                  <View>
                    <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.5' }}>待完成</Text>
                    <Text style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626', display: 'block', lineHeight: '1.3' }}>{suggestions.filter(s => s.priority === 'high').length}</Text>
                  </View>
                  <View style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />
                  <View>
                    <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.5' }}>信用状态</Text>
                    <Text style={{ fontSize: '13px', fontWeight: '600', color: creditProfile.totalScore >= 80 ? '#059669' : creditProfile.totalScore >= 60 ? '#d97706' : '#dc2626', display: 'block', lineHeight: '1.5' }}>
                      {creditProfile.totalScore >= 80 ? '良好' : creditProfile.totalScore >= 60 ? '中等' : '待提升'}
                    </Text>
                  </View>
                </View>

                {/* 建议列表 */}
                {suggestions.map(item => {
                  const ps = PRIORITY_STYLE[item.priority] || PRIORITY_STYLE.low
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
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4', flex: 1 }}>{item.title}</Text>
                          <View style={{ background: ps.bg, borderRadius: '20px', padding: '2px 8px', flexShrink: 0 }}>
                            <Text style={{ fontSize: '11px', fontWeight: '600', color: ps.color, lineHeight: '1.5' }}>{ps.label}</Text>
                          </View>
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

                {/* 提示条 */}
                <View style={{ background: '#fffbeb', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Zap size={15} color="#d97706" />
                  <Text style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.6', flex: 1 }}>优先完成标记为「重要」的项目，可快速提升信用分。</Text>
                </View>
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

        {/* ── 如何提升信用分（2列网格）── */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} color="#2563eb" />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>如何提升信用分</Text>
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

        {/* ── 自证工具 ── */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="#2563eb" />
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>自证工具</Text>
            </View>
            <View style={{ background: 'rgba(37,99,235,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
              <Text style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', lineHeight: '1.5' }}>推荐</Text>
            </View>
          </View>
          <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '16px', lineHeight: '1.6' }}>完整展示工作履历，提升报告可信度和信用评分。</Text>

          {selfProofSteps.map((item, i) => (
            <View key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < selfProofSteps.length - 1 ? '0' : '16px' }}>
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px', flexShrink: 0 }}>
                <View style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ color: '#fff', fontSize: '12px', fontWeight: '700', lineHeight: '1' }}>{item.step}</Text>
                </View>
                {i < selfProofSteps.length - 1 && <View style={{ width: '2px', flex: 1, minHeight: '16px', background: '#dbeafe', margin: '3px 0' }} />}
              </View>
              <View style={{ flex: 1, paddingBottom: i < selfProofSteps.length - 1 ? '12px' : '0' }}>
                <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4', marginBottom: '2px' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', lineHeight: '1.6' }}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <View
            style={{ borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
            onTouchStart={() => press('self-proof')} onTouchEnd={release} onTouchCancel={release}
            onClick={() => handleNavigate('/pages/work-history/index')}
          >
            <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>前往自证</Text>
            <ArrowRight size={16} color="rgba(255,255,255,0.85)" />
          </View>
        </View>

        {/* ── 维护信息 ── */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <Star size={18} color="#2563eb" />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>维护信息</Text>
          </View>
          {maintenanceItems.map((item, i) => (
            <View
              key={i}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: i < maintenanceItems.length - 1 ? '1px solid #f8fafc' : 'none', transform: pressedId === `maint-${i}` ? 'scale(0.99)' : 'scale(1)', transition: 'all 0.2s ease', background: pressedId === `maint-${i}` ? '#f8fafc' : 'transparent' }}
              onTouchStart={() => press(`maint-${i}`)} onTouchEnd={release} onTouchCancel={release}
              onClick={() => handleNavigate(item.action)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</Text>
              </View>
              <View style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#94a3b8" />
              </View>
            </View>
          ))}
        </View>

      </View>
    </View>
  )
}


export default EnhancementPage
