import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { ShieldCheck, CircleCheck } from 'lucide-react-taro'

const AGREEMENT = `《信息核查授权书》

尊敬的用户：

为保障您的职业信用报告真实、准确，我们需要对您提交的信息进行核查。请您仔细阅读以下内容：

一、授权范围
1. 授权平台查询并验证您的身份信息、学历学位信息、职业资格证书等。
2. 授权平台通过合法渠道获取您的信用信息，包括但不限于：
   · 身份学历信息
   · 职业资格信息
   · 诉讼记录信息
   · 投资任职信息
   · 金融信用信息
   · 黑名单信息

二、信息使用
1. 您授权的信息仅用于生成职业信用报告，不会用于其他商业用途。
2. 平台将严格保护您的个人信息安全，遵守相关法律法规。

三、您的权利
1. 您有权随时查看、更正自己的信息。
2. 您有权申请删除已授权的信息。
3. 您有权拒绝授权，但可能影响报告的完整性。

四、授权期限
本授权自您确认之日起生效，有效期为一年。到期后如需继续使用，需重新授权。

五、特别提示
1. 请确保您提供的信息真实、准确、完整。
2. 虚假信息将影响您的信用评分，并可能导致法律风险。
3. 如有疑问，请联系客服咨询。`

const SCOPE_ITEMS = [
  '身份信息（公安接口核实）',
  '学历学位信息（学信网核实）',
  '职业资格证书（行业协会）',
  '司法及诉讼记录',
  '金融征信信息（授权后）',
  '行业黑名单核查',
]

const AuthorizePage: FC = () => {
  const [countdown, setCountdown] = useState(10)
  const [canAgree, setCanAgree] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setCanAgree(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleAgree = () => {
    if (!canAgree || !isChecked) return
    Taro.navigateTo({ url: '/pages/report-form/index' })
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '取消授权',
      content: '取消授权将无法生成职业信用报告，确定取消吗？',
      success: res => { if (res.confirm) Taro.navigateBack() }
    })
  }

  const active = canAgree && isChecked

  return (
    <View className="fixed inset-0 flex flex-col" style={{ background: '#f0f4f8' }}>

      {/* 顶部 */}
      <View style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '48px 16px 24px' }}>
        <View className="flex items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center">
            <ShieldCheck size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="block text-white text-lg font-bold">信息核查授权</Text>
            <Text className="block text-blue-200 text-xs">请仔细阅读并确认以下授权内容</Text>
          </View>
        </View>

        {/* 倒计时或已可授权 */}
        {!canAgree ? (
          <View className="flex items-center gap-2 bg-white bg-opacity-15 rounded-2xl px-4 py-3">
            <View className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
              <Text className="text-white font-bold text-sm">{countdown}</Text>
            </View>
            <Text className="text-white text-sm">请阅读完毕后方可授权，剩余 {countdown} 秒</Text>
          </View>
        ) : (
          <View className="flex items-center gap-2 bg-white bg-opacity-15 rounded-2xl px-4 py-3">
            <CircleCheck size={20} color="#86efac" />
            <Text className="text-white text-sm">已阅读完毕，请勾选确认后授权</Text>
          </View>
        )}
      </View>

      {/* 授权范围概览 */}
      <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Text className="block text-sm font-semibold text-gray-900 mb-3">授权核查范围</Text>
        <View className="flex flex-wrap gap-2">
          {SCOPE_ITEMS.map((item, i) => (
            <View key={i} className="flex items-center gap-1 bg-blue-50 rounded-full px-3 py-1">
              <CircleCheck size={12} color="#3b82f6" />
              <Text className="text-xs text-blue-600">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 授权书全文 */}
      <View className="flex-1 mx-4 mt-3 min-h-0">
        <View className="bg-white rounded-2xl overflow-hidden h-full flex flex-col" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <View className="px-4 py-3 border-b border-gray-50 flex-shrink-0">
            <Text className="text-sm font-semibold text-gray-700">授权书全文</Text>
          </View>
          <ScrollView scrollY className="flex-1 px-4 py-3">
            <Text className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{AGREEMENT}</Text>
          </ScrollView>
        </View>
      </View>

      {/* 底部勾选 + 按钮 */}
      <View className="mx-4 mt-3 mb-6">
        {/* 勾选框 */}
        <View
          className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3.5 mb-3 active:bg-gray-50"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          onClick={() => canAgree && setIsChecked(!isChecked)}
        >
          <View className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
            {isChecked && <Text className="text-white text-xs font-bold leading-none">✓</Text>}
          </View>
          <Text className="text-sm text-gray-600 leading-relaxed flex-1">
            我已仔细阅读并同意《信息核查授权书》的全部内容，授权平台查询我的相关信息。
          </Text>
        </View>

        {/* 按钮组 */}
        <View className="flex gap-3">
          <View
            className="flex-1 rounded-2xl py-3.5 flex items-center justify-center border border-gray-200 bg-white active:bg-gray-50"
            onClick={handleCancel}
          >
            <Text className="text-sm font-medium text-gray-500">取消</Text>
          </View>
          <View
            className="flex-1 rounded-2xl py-3.5 flex items-center justify-center active:opacity-80"
            style={{
              background: active ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : '#e5e7eb',
              boxShadow: active ? '0 4px 16px rgba(59,130,246,0.35)' : 'none'
            }}
            onClick={handleAgree}
          >
            <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-400'}`}>
              {canAgree ? '同意授权' : `请阅读 (${countdown}s)`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AuthorizePage
