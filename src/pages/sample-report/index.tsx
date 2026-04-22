import { View, Text, ScrollView } from '@tarojs/components'
import { FC } from 'react'
import {
  CircleCheck,
  CircleAlert,
  UserCheck,
  Building,
  Award,
  Shield,
  Medal,
  Scale
} from 'lucide-react-taro'

const PERSON = {
  name: '小王',
  age: 26,
  phone: '133****3333',
  email: '1234@123.com',
  reportNo: 'CR20260403001',
  reportDate: '2026-04-03',
}

const DIMENSIONS = [
  {
    id: 'authenticity',
    name: '真实性',
    icon: UserCheck,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    features: [
      {
        name: '身份核实',
        source: '公安接口',
        status: 'verified',
        content: [
          { label: '姓名', value: '小王' },
          { label: '性别', value: '男' },
          { label: '年龄', value: '26岁' },
          { label: '证件号码', value: '110101xxxxxxxxxxxxxx' },
          { label: '初始发证地', value: '北京市东城区' },
        ]
      },
      {
        name: '学历核实',
        source: '学信网',
        status: 'verified',
        items: [
          { school: '中国xx大学', major: '计算机科学与技术', degree: '本科', status: 'verified' },
          { school: '中国xx大学', major: '计算机科学与技术', degree: '硕士', status: 'pending' },
        ]
      },
      {
        name: '工作经历核实',
        source: '前雇主核实',
        status: 'verified',
        result: '最近2段工作经历核实一致',
      },
    ]
  },
  {
    id: 'stability',
    name: '稳定性',
    icon: Building,
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    features: [
      {
        name: '工作稳定性',
        source: '社保记录、简历',
        status: 'verified',
        content: [
          { label: '平均在职时长', value: '约2年（正常）' },
          { label: '过去5年跳槽次数', value: '2次' },
          { label: '最长一段工作年限', value: '3年2个月' },
        ]
      },
    ]
  },
  {
    id: 'compliance',
    name: '合规性',
    icon: Scale,
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    features: [
      {
        name: '竞业限制',
        source: '前雇主',
        status: 'verified',
      },
      {
        name: '前雇主违纪记录',
        source: '前雇主评价',
        status: 'verified',
      },
      {
        name: '税务不良记录',
        source: '税务公开信息',
        status: 'verified',
      },
    ]
  },
  {
    id: 'safety',
    name: '安全性',
    icon: Shield,
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
    features: [
      {
        name: '司法诉讼',
        source: '司法数据、执行信息公开网',
        status: 'warn',
        result: '发现1条民事诉讼记录',
        detail: {
          label: '（2023）京0105民初12856号',
          rows: [
            { label: '案由', value: '合同纠纷' },
            { label: '当事人身份', value: '原告' },
            { label: '审理法院', value: '北京市朝阳区人民法院' },
            { label: '结案方式', value: '调解结案' },
          ]
        }
      },
      {
        name: '关联企业',
        source: '工商数据、社保记录',
        status: 'verified',
      },
      {
        name: '人行征信',
        source: '人民银行征信中心（授权查询）',
        status: 'verified',
      },
      {
        name: '劳动争议',
        source: '司法数据',
        status: 'verified',
      },
      {
        name: '黑名单核查',
        source: '阳光诚信、反舞弃联盟等',
        status: 'verified',
      },
      {
        name: '犯罪记录',
        source: '公安数据',
        status: 'verified',
      },
    ]
  },
  {
    id: 'professionalism',
    name: '专业性',
    icon: Medal,
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    features: [
      {
        name: '职业资格证书',
        source: '行业协会、人社部门',
        status: 'verified',
        items: [
          { name: '教师资格证', issuer: '教育部', status: 'verified' },
          { name: '法律职业资格证', issuer: '司法部', status: 'verified' },
        ]
      },
      {
        name: '学历层次',
        source: '学信网',
        status: 'verified',
        result: '本科（已认证）',
      },
    ]
  },
]

// ── 状态标签 ──
const StatusBadge: FC<{ status: string }> = ({ status }) => {
  if (status === 'verified') return (
    <View className="bg-blue-500 rounded-full px-3 py-0.5">
      <Text className="text-xs text-white">已认证</Text>
    </View>
  )
  if (status === 'checked') return (
    <View className="flex items-center gap-1">
      <CircleCheck size={13} color="#3b82f6" />
      <Text className="text-xs text-blue-500">已核查</Text>
    </View>
  )
  if (status === 'warn') return (
    <View className="bg-orange-100 rounded-full px-3 py-0.5">
      <Text className="text-xs text-orange-600">发现记录</Text>
    </View>
  )
  return (
    <View className="bg-gray-300 rounded-full px-3 py-0.5">
      <Text className="text-xs text-white">待认证</Text>
    </View>
  )
}

const SampleReportPage: FC = () => {
  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>
      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>样例报告</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>了解职业信用报告包含哪些内容</Text>
      </View>
      <ScrollView scrollY className="flex-1 px-4 pt-4 pb-10">

        {/* 个人基础信息 */}
        <View className="bg-white rounded-xl p-4 mb-3">
          <View className="flex items-center gap-3">
            <View className="w-14 h-14 rounded-full bg-blue-50 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
              <Text className="text-xl font-medium text-blue-600">{PERSON.name[0]}</Text>
            </View>
            <View className="flex-1">
              <View className="flex items-center gap-2 mb-1 flex-wrap">
                <Text className="text-base font-medium text-gray-900">{PERSON.name}</Text>
                <Text className="text-gray-300">|</Text>
                <Text className="text-sm text-gray-600">{PERSON.age}岁</Text>
                <Text className="text-gray-300">|</Text>
                <Text className="text-sm text-gray-600">{PERSON.phone}</Text>
              </View>
              <Text className="block text-xs text-gray-400">报告编号：{PERSON.reportNo}</Text>
              <Text className="block text-xs text-gray-400">生成日期：{PERSON.reportDate}</Text>
            </View>
          </View>
        </View>

        {/* 各维度详情 */}
        {DIMENSIONS.map(dim => {
          const Icon = dim.icon
          return (
            <View key={dim.id} className={`bg-white rounded-xl mb-3 overflow-hidden border ${dim.borderColor}`}>

              {/* 维度标题 */}
              <View className={`${dim.bgColor} px-4 py-3 flex items-center gap-2`}>
                <Icon size={18} color={dim.color} />
                <Text className="text-sm font-bold text-gray-900">{dim.name}</Text>
              </View>

              {/* 特征列表 */}
              <View>
                {dim.features.map((feat, idx) => (
                  <View key={idx}>
                    {/* 特征行 */}
                    <View className="px-4 pt-3 pb-3">
                      {/* 特征名 + 状态 */}
                      <View className="flex items-center justify-between mb-2">
                        <Text className="text-sm font-medium text-gray-900">{feat.name}</Text>
                        <StatusBadge status={feat.status} />
                      </View>

                      {/* key-value 信息（身份、稳定性等） */}
                      {feat.content && (
                        <View className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {feat.content.map((row, i) => (
                            <View key={i} className="flex items-center gap-1">
                              <Text className="text-xs text-gray-500">{row.label}:</Text>
                              <Text className="text-xs text-gray-700">{row.value}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 学历/证书列表 */}
                      {feat.items && (
                        <View className="space-y-2">
                          {feat.items.map((item, i) => (
                            <View key={i} className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between">
                              <View className="flex-1">
                                {'school' in item ? (
                                  <View className="flex items-center gap-2 flex-wrap">
                                    <Text className="text-xs text-gray-900">{item.school}</Text>
                                    <Text className="text-xs text-gray-500">{item.major}</Text>
                                    <Text className="text-xs text-gray-900">{item.degree}</Text>
                                  </View>
                                ) : (
                                  <View>
                                    <Text className="block text-xs font-medium text-gray-900">{item.name}</Text>
                                    {'issuer' in item && <Text className="block text-xs text-gray-500">{item.issuer}</Text>}
                                  </View>
                                )}
                              </View>
                              <View className="ml-2 flex-shrink-0">
                                <StatusBadge status={item.status} />
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 单行结论 */}
                      {feat.result && (
                        <Text className="text-xs text-gray-600">{feat.result}</Text>
                      )}

                      {/* 诉讼等详情展开 */}
                      {feat.detail && (
                        <View className="mt-2 bg-orange-50 rounded-lg p-3">
                          <Text className="block text-xs font-medium text-gray-700 mb-1.5">{feat.detail.label}</Text>
                          <View className="space-y-1">
                            {feat.detail.rows.map((row, i) => (
                              <View key={i} className="flex items-start gap-2">
                                <Text className="text-xs text-gray-500 w-16 flex-shrink-0">{row.label}</Text>
                                <Text className="text-xs text-gray-700">{row.value}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                    </View>

                    {idx < dim.features.length - 1 && (
                      <View className="h-px bg-gray-50 mx-4" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        {/* 报告声明 */}
        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="block text-xs text-gray-400 leading-relaxed text-center">
            本报告依据授权信息生成，评分结果仅供参考，不作为任何法律依据。{'\n'}
            数据来源：公安网、学信网、司法数据、征信中心等权威机构。
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

export default SampleReportPage
