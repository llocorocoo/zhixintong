import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  FileSearch,
  TriangleAlert,
  Shield,
  FileText,
  CircleCheck,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scale,
  ClipboardList,
  MessageCircle,
  CircleAlert,
  Search
} from 'lucide-react-taro'

// 可查询的修复类别（基于国家条款）
interface RepairCheckItem {
  id: string
  title: string
  desc: string
  status: 'clean' | 'repairable' | 'unchecked'
  detail?: string       // 发现问题时的具体说明
  laws?: { name: string; desc: string }[]
  templates?: { name: string; note: string }[]
  channel?: string      // 修复渠道说明
  contact?: string      // 联系方式
}

const CreditRepairPage: FC = () => {
  const { isLoggedIn, userInfo } = useUserStore()
  const [hasReport, setHasReport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkItems, setCheckItems] = useState<RepairCheckItem[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const fetchCreditData = useCallback(async () => {
    if (!userInfo?.id) return
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/credit/score',
        method: 'POST',
        data: { userId: userInfo.id }
      })
      if (res.data.code === 200 && res.data.data) {
        setHasReport(true)
        buildCheckItems(res.data.data.factors)
      } else {
        setHasReport(false)
        setCheckItems([])
      }
    } catch {
      setHasReport(false)
      setCheckItems([])
    } finally {
      setLoading(false)
    }
  }, [userInfo?.id])

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchCreditData()
  }, [isLoggedIn, fetchCreditData])

  // 根据信用报告中的安全性因子判断是否存在可修复记录
  const buildCheckItems = (factors: any) => {
    const safety = factors?.safety ?? 100

    const items: RepairCheckItem[] = [
      {
        id: 'admin-penalty',
        title: '行政处罚记录',
        desc: '核查是否存在已达公示期限、符合申请修复条件的行政处罚记录',
        // 若safety低于满分，模拟存在可修复记录
        status: safety < 100 ? 'repairable' : 'clean',
        detail: safety < 100
          ? '发现1条行政处罚记录，公示期已满，符合申请终止公示条件。'
          : undefined,
        laws: [
          {
            name: '《失信行为纠正后的信用信息修复管理办法（试行）》',
            desc: '规定可修复范围（公示期满的一般行政处罚、已纠正的轻微失信行为）、修复条件及申请流程'
          }
        ],
        templates: [
          {
            name: '"信用中国"网站失信行为纠正后的信用信息修复申请表',
            note: '向主管部门申请修复时使用，可至"信用中国"官网下载'
          },
          {
            name: '准予信用修复决定书',
            note: '修复通过后由主管部门出具，可作为向各平台申诉的依据'
          }
        ],
        channel: '登录"信用中国"网站（www.creditchina.gov.cn）提交修复申请'
      },
      {
        id: 'blacklist',
        title: '失信被执行人名单',
        desc: '核查是否在最高人民法院失信被执行人名单中，以及是否已履行完毕但未移除',
        status: safety < 100 ? 'repairable' : 'clean',
        detail: safety < 100
          ? '发现失信记录，若已履行完毕，可申请移出名单。'
          : undefined,
        laws: [
          {
            name: '《最高人民法院关于公布失信被执行人名单信息的若干规定》',
            desc: '规定失信名单纳入条件及移除程序，履行完毕后可向执行法院申请移出'
          }
        ],
        channel: '向作出执行裁定的人民法院提交履行证明，申请移出失信名单'
      },
      {
        id: 'sealed-record',
        title: '应封存未封存记录',
        desc: '核查是否存在依法应自动封存但仍在各平台可查询的记录（如符合封存条件的处罚记录）',
        status: 'clean',
        laws: [
          {
            name: '《中华人民共和国治安管理处罚法》',
            desc: '规定特定情形下（已履行、无例外情形）应自动封存的处罚记录类型及条件'
          }
        ],
        channel: '拨打 12309 向检察机关求助，由检察院督促公安机关整改并与相关平台沟通',
        contact: '12309（检察机关举报热线）'
      },
      {
        id: 'platform-sync',
        title: '第三方平台数据未同步',
        desc: '核查已完成信用修复的记录是否仍出现在天眼查、企查查等第三方平台',
        status: 'clean',
        templates: [
          {
            name: '准予信用修复决定书',
            note: '持此文件向第三方平台提交申诉，证明已完成修复'
          }
        ],
        channel: '持《准予信用修复决定书》向天眼查、企查查等平台申诉；如拒不更新，可向市场监管部门投诉'
      }
    ]

    setCheckItems(items)
  }

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id)
  }

  const repairableCount = checkItems.filter(i => i.status === 'repairable').length

  // 信用修复说明（三类情况）
  const repairGuide = [
    {
      id: 'fixable',
      icon: CircleCheck,
      color: '#10b981',
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: '可修复的职业信用记录',
      tag: '申请修复',
      tagBg: 'bg-green-100',
      tagText: 'text-green-700',
      scope: '公示期满的一般行政处罚、已纠正的轻微失信行为，可向相关主管部门申请终止公示或移出失信名单。',
      steps: [
        '在"信用中国"网站或授权平台确认记录及公示期',
        '下载填写《失信行为纠正后的信用信息修复申请表》',
        '向相关主管部门提交申请材料',
        '获取《准予信用修复决定书》，凭此向各平台申请同步更新'
      ],
      laws: [
        { name: '《失信行为纠正后的信用信息修复管理办法（试行）》', desc: '规定可修复范围、修复条件及申请流程' }
      ],
      templates: [
        { name: '"信用中国"网站失信行为纠正后的信用信息修复申请表', note: '可至"信用中国"官网下载' },
        { name: '准予信用修复决定书', note: '修复通过后由主管部门出具' }
      ]
    },
    {
      id: 'sealed',
      icon: Shield,
      color: '#3b82f6',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: '应封存仍可查询的记录',
      tag: '依法维权',
      tagBg: 'bg-blue-100',
      tagText: 'text-blue-700',
      scope: '符合国家封存规定（已履行完毕、无例外情形），应自动封存但仍在政务平台或第三方平台展示的记录。',
      steps: [
        '确认记录属于法定应封存情形（如特定情形下的处罚记录）',
        '收集相关证明材料（履行完毕证明等）',
        '拨打 12309 向检察机关求助',
        '由检察院督促公安机关整改，并与相关平台沟通屏蔽记录'
      ],
      laws: [
        { name: '《中华人民共和国治安管理处罚法》', desc: '规定特定情形下应封存的处罚记录类型及条件' }
      ],
      contact: { label: '检察机关举报热线', value: '12309' }
    },
    {
      id: 'outdated',
      icon: TriangleAlert,
      color: '#f59e0b',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: '应停止公示但仍可查询的记录',
      tag: '申诉平台',
      tagBg: 'bg-yellow-100',
      tagText: 'text-yellow-700',
      scope: '已达公示期限、已移出失信名单或已完成信用修复，按规定应停止公示，但仍在第三方平台（如企查查、天眼查）可查询的记录。',
      steps: [
        '确认记录已完成修复（持《准予信用修复决定书》）或已超公示期限',
        '向第三方平台提交申诉及相关证明材料',
        '如平台拒不更新，可向市场监管部门投诉'
      ],
      templates: [
        { name: '准予信用修复决定书', note: '向第三方平台申诉时使用，证明已完成修复' }
      ]
    }
  ]

  const CARD = { background: '#fff', borderRadius: '20px', overflow: 'hidden' as const, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>信用修复</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>查询可修复的信用记录，提供法律依据和修复渠道指引</Text>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>

        {/* ── 个性化修复建议 ── */}
        <View style={CARD}>
          <View style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="#2563eb" />
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>个性化修复建议</Text>
            </View>
            {hasReport && repairableCount > 0 && (
              <View style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
                <Text style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', lineHeight: '1.5' }}>发现 {repairableCount} 项可修复</Text>
              </View>
            )}
            {hasReport && repairableCount === 0 && (
              <View style={{ background: 'rgba(5,150,105,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
                <Text style={{ fontSize: '11px', fontWeight: '600', color: '#059669', lineHeight: '1.5' }}>未发现可修复记录</Text>
              </View>
            )}
          </View>

          <View style={{ padding: '16px 18px' }}>
            {loading ? (
              <View style={{ padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>核查中...</Text>
              </View>
            ) : !hasReport ? (
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px' }}>
                <View style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                  <FileSearch size={32} color="#fff" />
                </View>
                <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px', lineHeight: '1.4' }}>需先生成信用报告</Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', lineHeight: '1.7', textAlign: 'center', marginBottom: '20px' }}>
                  生成职业信用报告并完成授权核查后，平台将检索您的行政处罚、失信名单等记录，识别符合国家修复规定的可修复项目。
                </Text>
                <View
                  style={{ width: '100%', borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileText size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>前往生成信用报告</Text>
                </View>
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '10px 14px', borderLeft: '3px solid #2563eb' }}>
                  <Text style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.7' }}>
                    以下为基于您的信用报告核查的可修复项目，仅包含符合国家及行业信用修复规定的记录。
                  </Text>
                </View>

                {checkItems.map((item) => (
                  <View key={item.id} style={{ border: `1px solid ${item.status === 'repairable' ? 'rgba(220,38,38,0.15)' : '#f1f5f9'}`, borderRadius: '16px', overflow: 'hidden' }}>
                    <View style={{ padding: '14px 16px' }}>
                      <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <View style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                          {item.status === 'clean'
                            ? <CircleCheck size={18} color="#059669" />
                            : item.status === 'repairable'
                              ? <CircleAlert size={18} color="#dc2626" />
                              : <Search size={18} color="#94a3b8" />}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4', marginBottom: '3px' }}>{item.title}</Text>
                            <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', lineHeight: '1.6' }}>{item.desc}</Text>
                          </View>
                        </View>
                        <View style={{ flexShrink: 0 }}>
                          {item.status === 'clean' && (
                            <View style={{ background: 'rgba(5,150,105,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
                              <Text style={{ fontSize: '11px', fontWeight: '600', color: '#059669', lineHeight: '1.5' }}>未发现问题</Text>
                            </View>
                          )}
                          {item.status === 'repairable' && (
                            <View style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
                              <Text style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', lineHeight: '1.5' }}>发现可修复项</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {item.status === 'repairable' && item.detail && (
                        <View style={{ marginTop: '10px', background: 'rgba(220,38,38,0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                          <Text style={{ fontSize: '12px', color: '#dc2626', lineHeight: '1.7' }}>{item.detail}</Text>
                        </View>
                      )}

                      {item.status === 'repairable' && item.laws && item.laws.length > 0 && (
                        <View style={{ marginTop: '10px' }}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                            <Scale size={13} color="#64748b" />
                            <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', lineHeight: '1.5' }}>适用法律法规</Text>
                          </View>
                          {item.laws.map((law, idx) => (
                            <View key={idx} style={{ background: '#eff6ff', borderRadius: '10px', padding: '8px 12px', marginBottom: '4px' }}>
                              <Text style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', display: 'block', lineHeight: '1.5' }}>{law.name}</Text>
                              <Text style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{law.desc}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {item.status === 'repairable' && item.templates && item.templates.length > 0 && (
                        <View style={{ marginTop: '10px' }}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                            <ClipboardList size={13} color="#64748b" />
                            <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', lineHeight: '1.5' }}>所需模板文件</Text>
                          </View>
                          {item.templates.map((tpl, idx) => (
                            <View key={idx} style={{ background: '#f8fafc', borderRadius: '10px', padding: '8px 12px', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <FileText size={13} color="#2563eb" />
                              <View>
                                <Text style={{ fontSize: '11px', color: '#0f172a', display: 'block', lineHeight: '1.5' }}>《{tpl.name}》</Text>
                                <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{tpl.note}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {item.status === 'repairable' && item.channel && (
                        <View style={{ marginTop: '10px', background: '#eff6ff', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <ArrowRight size={13} color="#2563eb" />
                          <Text style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.7', flex: 1 }}>{item.channel}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                {repairableCount === 0 && (
                  <View style={{ background: 'rgba(5,150,105,0.07)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CircleCheck size={15} color="#059669" />
                    <Text style={{ fontSize: '12px', color: '#059669', lineHeight: '1.7', flex: 1 }}>
                      核查未发现需要修复的信用记录。若您认为存在遗漏，可参考下方"信用修复说明"了解三类情况的修复路径，自行申请修复。
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ── 信用修复情况说明 ── */}
        <View style={CARD}>
          <View style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f8fafc' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={18} color="#2563eb" />
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>信用修复情况说明</Text>
            </View>
            <Text style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>三类可修复情况的法律依据、申请流程与渠道指引</Text>
          </View>

          <View style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {repairGuide.map((cat) => (
              <View key={cat.id} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <View
                  style={{ background: cat.id === 'fixable' ? '#f0fdf4' : cat.id === 'sealed' ? '#eff6ff' : '#fffbeb', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => toggleSection(cat.id)}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <cat.icon size={20} color={cat.color} />
                    <View>
                      <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{cat.title}</Text>
                      <View style={{ display: 'inline-flex', marginTop: '3px', padding: '2px 8px', borderRadius: '20px', background: cat.id === 'fixable' ? 'rgba(5,150,105,0.15)' : cat.id === 'sealed' ? 'rgba(37,99,235,0.12)' : 'rgba(217,119,6,0.12)' }}>
                        <Text style={{ fontSize: '11px', color: cat.color, lineHeight: '1.5' }}>{cat.tag}</Text>
                      </View>
                    </View>
                  </View>
                  {expandedSection === cat.id ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </View>

                {expandedSection === cat.id && (
                  <View style={{ padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <View>
                      <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px', lineHeight: '1.5' }}>适用范围</Text>
                      <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>{cat.scope}</Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px', lineHeight: '1.5' }}>修复步骤</Text>
                      {cat.steps.map((step, idx) => (
                        <View key={idx} style={{ display: 'flex', gap: '10px', marginBottom: idx < cat.steps.length - 1 ? '8px' : '0' }}>
                          <View style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                            <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
                          </View>
                          <Text style={{ fontSize: '13px', color: '#475569', flex: 1, lineHeight: '1.7' }}>{step}</Text>
                        </View>
                      ))}
                    </View>

                    {cat.laws && cat.laws.length > 0 && (
                      <View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                          <Scale size={13} color="#64748b" />
                          <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', lineHeight: '1.5' }}>参考法律法规</Text>
                        </View>
                        {cat.laws.map((law, idx) => (
                          <View key={idx} style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 12px', marginBottom: '4px' }}>
                            <Text style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', display: 'block', lineHeight: '1.5' }}>{law.name}</Text>
                            <Text style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px', lineHeight: '1.6' }}>{law.desc}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {cat.templates && cat.templates.length > 0 && (
                      <View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                          <ClipboardList size={13} color="#64748b" />
                          <Text style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', lineHeight: '1.5' }}>模板文件</Text>
                        </View>
                        {cat.templates.map((tpl, idx) => (
                          <View key={idx} style={{ background: '#f8fafc', borderRadius: '10px', padding: '8px 12px', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <FileText size={13} color="#2563eb" />
                            <View>
                              <Text style={{ fontSize: '12px', color: '#0f172a', display: 'block', lineHeight: '1.5' }}>《{tpl.name}》</Text>
                              <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{tpl.note}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {cat.contact && (
                      <View style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={15} color="#059669" />
                        <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{cat.contact.label}：</Text>
                        <Text style={{ fontSize: '13px', fontWeight: '700', color: '#059669', lineHeight: '1.5' }}>{cat.contact.value}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default CreditRepairPage
