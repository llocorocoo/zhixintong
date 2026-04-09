import { View, Text, Textarea } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ChevronRight, MessageCircle, Phone, FileText, BookOpen, Mail } from 'lucide-react-taro'

const FAQ_LIST = [
  {
    q: '职业信用报告是什么？有什么用？',
    a: '职业信用报告是记录您个人职业信用信息的权威文件，包含身份认证、学历、职业资格、安全性等6大维度数据。可用于求职背调、职业发展、信用展示等场景。'
  },
  {
    q: '生成报告需要多长时间？',
    a: '提交信息后，系统将在1-3个工作日内完成核查并生成报告。核查完成后会通过平台消息通知您。'
  },
  {
    q: '我的个人信息安全吗？',
    a: '您的数据仅用于生成职业信用报告，平台采用加密存储，不会用于其他商业目的。您可在"隐私设置"中随时管理数据授权。'
  },
  {
    q: '信用修复需要多长时间生效？',
    a: '向主管部门提交信用修复申请后，审核周期通常为5-15个工作日。获取《准予信用修复决定书》后，更新信用报告即可看到最新评分。'
  },
  {
    q: '报告有效期是多久？',
    a: '职业信用报告有效期为1年。建议每季度更新一次，以保持信息时效性。'
  },
  {
    q: '如何提升信用评分？',
    a: '可通过以下方式提升：补充并核实学历、职业资格等证书；完整记录工作履历；授权核查诉讼及失信记录；定期更新信用报告。详见"提升信用"功能。'
  },
]

const AGREEMENTS = [
  { title: '用户服务协议', desc: '账户注册与使用规则' },
  { title: '隐私政策', desc: '个人数据收集与使用说明' },
  { title: '信用报告授权协议', desc: '信息核查与报告生成授权条款' },
  { title: '免责声明', desc: '报告用途与法律效力说明' },
]

type Tab = 'faq' | 'agreements' | 'contact'

const HelpCenterPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('faq')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSubmitting(false)
    setFeedback('')
    Taro.showToast({ title: '感谢您的反馈', icon: 'success' })
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'faq', label: '常见问题', icon: FileText },
    { id: 'agreements', label: '规则与协议', icon: BookOpen },
    { id: 'contact', label: '联系客服', icon: MessageCircle },
  ]

  return (
    <View className="min-h-screen bg-gray-50 pb-8">

      {/* Tab 切换 */}
      <View className="bg-white px-4 pt-4 pb-0 mb-4 flex border-b border-gray-100">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <View
              key={tab.id}
              className={`flex-1 flex flex-col items-center pb-3 gap-1 ${activeTab === tab.id ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} color={activeTab === tab.id ? '#3b82f6' : '#9ca3af'} />
              <Text className={`text-xs font-medium ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`}>
                {tab.label}
              </Text>
            </View>
          )
        })}
      </View>

      {/* 常见问题 */}
      {activeTab === 'faq' && (
        <Card className="mx-4">
          <CardContent className="p-0">
            {FAQ_LIST.map((item, index) => (
              <View key={index} className={index < FAQ_LIST.length - 1 ? 'border-b border-gray-100' : ''}>
                <View
                  className="flex items-center justify-between px-4 py-4 active:bg-gray-50"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <Text className="text-sm font-medium text-gray-900 flex-1 pr-3 leading-relaxed">
                    {item.q}
                  </Text>
                  {expanded === index
                    ? <ChevronUp size={18} color="#9ca3af" />
                    : <ChevronDown size={18} color="#9ca3af" />
                  }
                </View>
                {expanded === index && (
                  <View className="px-4 pb-4">
                    <Text className="text-sm text-gray-500 leading-relaxed">{item.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 规则与协议 */}
      {activeTab === 'agreements' && (
        <Card className="mx-4">
          <CardContent className="p-0">
            {AGREEMENTS.map((item, index) => (
              <View
                key={index}
                className={`flex items-center justify-between px-4 py-4 active:bg-gray-50 ${index < AGREEMENTS.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="flex-1">
                  <Text className="block text-sm font-medium text-gray-900">{item.title}</Text>
                  <Text className="block text-xs text-gray-400 mt-0.5">{item.desc}</Text>
                </View>
                <ChevronRight size={18} color="#9ca3af" />
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 联系客服 */}
      {activeTab === 'contact' && (
        <View>
          {/* 联系方式入口 */}
          <View className="flex gap-3 mx-4 mb-4">
            <View className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-2 active:bg-gray-50">
              <View className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <MessageCircle size={22} color="#3b82f6" />
              </View>
              <Text className="text-sm font-medium text-gray-900">在线客服</Text>
              <Text className="text-xs text-gray-400 text-center">工作日{'\n'}9:00 - 18:00</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-2 active:bg-gray-50">
              <View className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Phone size={22} color="#10b981" />
              </View>
              <Text className="text-sm font-medium text-gray-900">电话客服</Text>
              <Text className="text-xs text-blue-500">400-xxx-xxxx</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-2 active:bg-gray-50">
              <View className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Mail size={22} color="#8b5cf6" />
              </View>
              <Text className="text-sm font-medium text-gray-900">邮件反馈</Text>
              <Text className="text-xs text-gray-400 text-center">help@{'\n'}example.com</Text>
            </View>
          </View>

          {/* 意见反馈 */}
          <Card className="mx-4">
            <CardContent className="p-4">
              <Text className="block text-sm font-medium text-gray-900 mb-3">意见反馈</Text>
              <Textarea
                className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-700"
                style={{ minHeight: '96px' }}
                placeholder="请描述您遇到的问题或建议..."
                value={feedback}
                onInput={e => setFeedback(e.detail.value)}
                maxlength={300}
              />
              <View className="flex items-center justify-between mt-1 mb-3">
                <Text className="text-xs text-gray-400">感谢您帮助我们改进产品</Text>
                <Text className="text-xs text-gray-400">{feedback.length}/300</Text>
              </View>
              <Button className="w-full bg-blue-600" onClick={handleSubmitFeedback} disabled={submitting}>
                <Text className="text-white">{submitting ? '提交中...' : '提交反馈'}</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      )}

    </View>
  )
}

export default HelpCenterPage
