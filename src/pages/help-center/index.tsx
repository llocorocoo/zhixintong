import { View, Text, Textarea } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MessageCircle, Phone, FileText, Info } from 'lucide-react-taro'

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

const HelpCenterPage: FC = () => {
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

  return (
    <View className="min-h-screen bg-gray-50 pb-8">

      {/* 快速联系 */}
      <View className="flex gap-3 mx-4 mt-4 mb-4">
        <View className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-2 active:bg-gray-50">
          <View className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <MessageCircle size={20} color="#3b82f6" />
          </View>
          <Text className="text-sm font-medium text-gray-900">在线客服</Text>
          <Text className="text-xs text-gray-400">工作日 9:00-18:00</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-2 active:bg-gray-50">
          <View className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <Phone size={20} color="#10b981" />
          </View>
          <Text className="text-sm font-medium text-gray-900">电话客服</Text>
          <Text className="text-xs text-blue-500">400-xxx-xxxx</Text>
        </View>
      </View>

      {/* 常见问题 */}
      <Card className="mx-4 mb-4">
        <CardHeader className="pb-2">
          <View className="flex items-center gap-2">
            <FileText size={18} color="#3b82f6" />
            <CardTitle className="text-base">常见问题</CardTitle>
          </View>
        </CardHeader>
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
                  ? <ChevronUp size={18} color="#9ca3af" className="flex-shrink-0" />
                  : <ChevronDown size={18} color="#9ca3af" className="flex-shrink-0" />
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

      {/* 意见反馈 */}
      <Card className="mx-4 mb-4">
        <CardHeader className="pb-2">
          <View className="flex items-center gap-2">
            <MessageCircle size={18} color="#3b82f6" />
            <CardTitle className="text-base">意见反馈</CardTitle>
          </View>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Textarea
            className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-700 min-h-24"
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

      {/* 关于 */}
      <Card className="mx-4">
        <CardContent className="p-0">
          {[
            { label: '当前版本', value: 'v1.0.0' },
            { label: '用户协议', action: true },
            { label: '隐私政策', action: true },
          ].map((item, index) => (
            <View
              key={index}
              className={`flex items-center justify-between px-4 py-4 ${index < 2 ? 'border-b border-gray-100' : ''} ${item.action ? 'active:bg-gray-50' : ''}`}
            >
              <Text className="text-sm text-gray-900">{item.label}</Text>
              {item.action
                ? <ChevronRight size={18} color="#9ca3af" />
                : <Text className="text-sm text-gray-500">{item.value}</Text>
              }
            </View>
          ))}
        </CardContent>
      </Card>
    </View>
  )
}

export default HelpCenterPage
