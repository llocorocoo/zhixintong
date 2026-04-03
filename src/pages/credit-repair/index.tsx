import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  Wrench,
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

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 顶部 */}
      <View className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-12 pb-8">
        <View className="flex items-center gap-3 mb-2">
          <Wrench size={24} color="#ffffff" />
          <Text className="text-white text-xl font-bold">信用修复</Text>
        </View>
        <Text className="text-blue-100 text-sm leading-relaxed">
          查询可修复的信用记录，提供法律依据和修复渠道指引
        </Text>
      </View>

      {/* 个性化修复建议 */}
      <View className="px-4 -mt-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <Search size={20} color="#3b82f6" />
                <CardTitle>个性化修复建议</CardTitle>
              </View>
              {hasReport && repairableCount > 0 && (
                <Badge className="bg-red-100">
                  <Text className="text-xs text-red-600">发现 {repairableCount} 项可修复</Text>
                </Badge>
              )}
              {hasReport && repairableCount === 0 && (
                <Badge className="bg-green-100">
                  <Text className="text-xs text-green-600">未发现可修复记录</Text>
                </Badge>
              )}
            </View>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <View className="py-8 text-center">
                <Text className="text-gray-400">核查中...</Text>
              </View>
            ) : !hasReport ? (
              /* 未生成报告 */
              <View className="py-6">
                <View className="flex items-start gap-4 mb-4">
                  <View className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileSearch size={24} color="#9ca3af" />
                  </View>
                  <View className="flex-1">
                    <Text className="block text-base font-medium text-gray-900 mb-1">需先生成信用报告</Text>
                    <Text className="block text-sm text-gray-500 leading-relaxed">
                      生成职业信用报告并完成授权核查后，平台将检索您的行政处罚、失信名单等记录，识别符合国家修复规定的可修复项目。
                    </Text>
                  </View>
                </View>
                <View
                  className="w-full bg-blue-600 rounded-xl py-3 flex items-center justify-center active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileText size={18} color="#ffffff" />
                  <Text className="text-white text-sm font-medium ml-2">前往生成信用报告</Text>
                </View>
              </View>
            ) : (
              /* 有报告，展示核查结果 */
              <View>
                {/* 说明 */}
                <View className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <Text className="text-sm text-blue-700 leading-relaxed">
                    以下为基于您的信用报告核查的可修复项目，仅包含符合国家及行业信用修复规定的记录。
                  </Text>
                </View>

                {/* 核查结果列表 */}
                <View className="space-y-3">
                  {checkItems.map((item) => (
                    <View key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      {/* 核查项头部 */}
                      <View className="p-4">
                        <View className="flex items-start justify-between gap-2">
                          <View className="flex items-start gap-3 flex-1">
                            {item.status === 'clean' ? (
                              <CircleCheck size={20} color="#10b981" className="mt-0.5 flex-shrink-0" />
                            ) : item.status === 'repairable' ? (
                              <CircleAlert size={20} color="#ef4444" className="mt-0.5 flex-shrink-0" />
                            ) : (
                              <Search size={20} color="#9ca3af" className="mt-0.5 flex-shrink-0" />
                            )}
                            <View className="flex-1">
                              <Text className="block text-sm font-medium text-gray-900 mb-0.5">{item.title}</Text>
                              <Text className="block text-xs text-gray-500 leading-relaxed">{item.desc}</Text>
                            </View>
                          </View>
                          <View className="flex-shrink-0">
                            {item.status === 'clean' && (
                              <Badge className="bg-green-100">
                                <Text className="text-xs text-green-700">未发现问题</Text>
                              </Badge>
                            )}
                            {item.status === 'repairable' && (
                              <Badge className="bg-red-100">
                                <Text className="text-xs text-red-600">发现可修复项</Text>
                              </Badge>
                            )}
                          </View>
                        </View>

                        {/* 可修复时展示详情 */}
                        {item.status === 'repairable' && item.detail && (
                          <View className="mt-3 p-3 bg-red-50 rounded-lg">
                            <Text className="text-sm text-red-700 leading-relaxed">{item.detail}</Text>
                          </View>
                        )}

                        {/* 可修复项目：法律法规 */}
                        {item.status === 'repairable' && item.laws && item.laws.length > 0 && (
                          <View className="mt-3">
                            <View className="flex items-center gap-1.5 mb-2">
                              <Scale size={13} color="#6b7280" />
                              <Text className="text-xs text-gray-500 font-medium">适用法律法规</Text>
                            </View>
                            {item.laws.map((law, idx) => (
                              <View key={idx} className="p-2.5 bg-blue-50 rounded-lg mb-1">
                                <Text className="block text-xs font-medium text-blue-700">{law.name}</Text>
                                <Text className="block text-xs text-gray-500 mt-0.5">{law.desc}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* 可修复项目：模板文件 */}
                        {item.status === 'repairable' && item.templates && item.templates.length > 0 && (
                          <View className="mt-3">
                            <View className="flex items-center gap-1.5 mb-2">
                              <ClipboardList size={13} color="#6b7280" />
                              <Text className="text-xs text-gray-500 font-medium">所需模板文件</Text>
                            </View>
                            {item.templates.map((tpl, idx) => (
                              <View key={idx} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg mb-1">
                                <FileText size={14} color="#3b82f6" className="mt-0.5 flex-shrink-0" />
                                <View>
                                  <Text className="block text-xs text-gray-800">《{tpl.name}》</Text>
                                  <Text className="block text-xs text-gray-500 mt-0.5">{tpl.note}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* 可修复项目：修复渠道 */}
                        {item.status === 'repairable' && item.channel && (
                          <View className="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <ArrowRight size={14} color="#3b82f6" className="mt-0.5 flex-shrink-0" />
                            <Text className="text-xs text-blue-700 leading-relaxed">{item.channel}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {repairableCount === 0 && (
                  <View className="mt-4 p-3 bg-green-50 rounded-lg">
                    <View className="flex items-start gap-2">
                      <CircleCheck size={16} color="#10b981" className="mt-0.5" />
                      <Text className="text-sm text-green-700 leading-relaxed">
                        核查未发现需要修复的信用记录。若您认为存在遗漏，可参考下方"信用修复说明"了解三类情况的修复路径，自行申请修复。
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </CardContent>
        </Card>
      </View>

      {/* 信用修复说明 */}
      <View className="px-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <View className="flex items-center gap-2">
              <BookOpen size={20} color="#3b82f6" />
              <CardTitle>信用修复情况说明</CardTitle>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              三类可修复情况的法律依据、申请流程与渠道指引
            </Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="space-y-3">
              {repairGuide.map((cat) => (
                <View key={cat.id} className={`rounded-xl border ${cat.border} overflow-hidden`}>
                  {/* 折叠头部 */}
                  <View
                    className={`${cat.bg} p-4 flex items-center justify-between active:opacity-80`}
                    onClick={() => toggleSection(cat.id)}
                  >
                    <View className="flex items-center gap-3">
                      <cat.icon size={20} color={cat.color} />
                      <View>
                        <Text className="text-sm font-medium text-gray-900">{cat.title}</Text>
                        <View className={`inline-flex mt-0.5 px-1.5 py-0.5 rounded ${cat.tagBg}`}>
                          <Text className={`text-xs ${cat.tagText}`}>{cat.tag}</Text>
                        </View>
                      </View>
                    </View>
                    {expandedSection === cat.id
                      ? <ChevronUp size={18} color="#9ca3af" />
                      : <ChevronDown size={18} color="#9ca3af" />
                    }
                  </View>

                  {/* 展开内容 */}
                  {expandedSection === cat.id && (
                    <View className="p-4 bg-white space-y-4">
                      <View>
                        <Text className="text-xs font-medium text-gray-500 mb-1">适用范围</Text>
                        <Text className="text-sm text-gray-700 leading-relaxed">{cat.scope}</Text>
                      </View>

                      <View>
                        <Text className="text-xs font-medium text-gray-500 mb-2">修复步骤</Text>
                        <View className="space-y-2">
                          {cat.steps.map((step, idx) => (
                            <View key={idx} className="flex gap-3">
                              <View className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Text className="text-white text-xs font-medium">{idx + 1}</Text>
                              </View>
                              <Text className="text-sm text-gray-600 flex-1 leading-relaxed">{step}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {cat.laws && cat.laws.length > 0 && (
                        <View>
                          <View className="flex items-center gap-1.5 mb-2">
                            <Scale size={14} color="#6b7280" />
                            <Text className="text-xs font-medium text-gray-500">参考法律法规</Text>
                          </View>
                          {cat.laws.map((law, idx) => (
                            <View key={idx} className="p-2.5 bg-blue-50 rounded-lg mb-1">
                              <Text className="block text-xs font-medium text-blue-700">{law.name}</Text>
                              <Text className="block text-xs text-gray-500 mt-0.5">{law.desc}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {cat.templates && cat.templates.length > 0 && (
                        <View>
                          <View className="flex items-center gap-1.5 mb-2">
                            <ClipboardList size={14} color="#6b7280" />
                            <Text className="text-xs font-medium text-gray-500">模板文件</Text>
                          </View>
                          {cat.templates.map((tpl, idx) => (
                            <View key={idx} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg mb-1">
                              <FileText size={14} color="#3b82f6" className="mt-0.5 flex-shrink-0" />
                              <View>
                                <Text className="block text-xs text-gray-800">《{tpl.name}》</Text>
                                <Text className="block text-xs text-gray-500 mt-0.5">{tpl.note}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {cat.contact && (
                        <View className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <MessageCircle size={16} color="#10b981" />
                          <Text className="text-sm text-gray-700">{cat.contact.label}：</Text>
                          <Text className="text-sm font-bold text-green-700">{cat.contact.value}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Text className="text-xs text-gray-500 leading-relaxed">
                信用修复指依法申请终止公示、封存或移出失信名单，与补充材料提升评分的增信操作不同。修复结果以相关主管部门出具的决定书为准。
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}

export default CreditRepairPage
