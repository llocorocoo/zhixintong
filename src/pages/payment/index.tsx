import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import { Shield, Smartphone, CircleCheck, X } from 'lucide-react-taro'

const PaymentPage: FC = () => {
  const [payMethod, setPayMethod] = useState('wechat')
  const [showConfirm, setShowConfirm] = useState(false)
  const [paying, setPaying] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)
  const { userInfo } = useUserStore()

  const params = Taro.getCurrentInstance().router?.params || {}
  const price = params.price || '50'
  const type = params.type || 'create'
  const isUpdate = type === 'update'

  const payMethods = [
    { id: 'wechat', name: '微信支付', sub: '推荐', icon: Smartphone, color: '#07c160', bg: '#f0fdf4' },
    { id: 'alipay', name: '支付宝',   sub: null,   icon: Smartphone, color: '#1677ff', bg: '#eff6ff' },
  ]

  const currentMethod = payMethods.find(m => m.id === payMethod)!

  const handleConfirmPay = async () => {
    setPaying(true)
    try {
      Taro.showLoading({ title: '支付处理中...' })
      await new Promise(resolve => setTimeout(resolve, 1500))
      Taro.hideLoading()
      setShowConfirm(false)
      Taro.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        isUpdate
          ? Taro.redirectTo({ url: '/pages/authorize/index?type=update' })
          : Taro.redirectTo({ url: '/pages/privacy-notice/index' })
      }, 1000)
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  return (
    <View className="min-h-screen flex flex-col" style={{ background: '#f0f4f8' }}>

      {/* 顶部金额展示 */}
      <View style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', paddingTop: '48px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        <Text className="block text-blue-200 text-sm mb-2">{isUpdate ? '更新信用报告' : '生成信用报告'}</Text>
        <View className="flex items-end gap-1">
          <Text className="text-white text-lg font-medium">¥</Text>
          <Text className="text-white font-bold" style={{ fontSize: '48px', lineHeight: '1' }}>{price}</Text>
        </View>
      </View>

      <View className="px-4 -mt-10 flex-1 space-y-4 pb-8">

        {/* 订单信息 */}
        <View className="bg-white rounded-3xl px-5 py-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <View className="flex items-center gap-2 mb-4">
            <Shield size={18} color="#3b82f6" />
            <Text className="text-base font-bold text-gray-900">订单信息</Text>
          </View>
          {[
            { label: '商品', value: isUpdate ? '信用报告更新服务' : '职业信用报告生成服务' },
            { label: '用户', value: userInfo?.name || userInfo?.phone || '用户' },
          ].map((row, i) => (
            <View key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
              <Text className="text-sm text-gray-400">{row.label}</Text>
              <Text className="text-sm font-medium text-gray-800">{row.value}</Text>
            </View>
          ))}
          <View className="flex items-center justify-between pt-3">
            <Text className="text-sm text-gray-400">应付金额</Text>
            <View className="flex items-baseline gap-0.5">
              <Text className="text-sm font-medium text-red-500">¥</Text>
              <Text className="text-2xl font-bold text-red-500">{price}</Text>
            </View>
          </View>
        </View>

        {/* 支付方式 */}
        <View className="bg-white rounded-3xl px-5 py-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Text className="block text-base font-bold text-gray-900 mb-4">选择支付方式</Text>
          <View className="space-y-2">
            {payMethods.map((method) => {
              const active = payMethod === method.id
              return (
                <View
                  key={method.id}
                  className="flex items-center gap-3 p-4 rounded-2xl active:opacity-90"
                  style={{ backgroundColor: active ? method.bg : '#f9fafb', border: `2px solid ${active ? method.color + '40' : 'transparent'}` }}
                  onClick={() => setPayMethod(method.id)}
                >
                  <View className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: method.color + '15' }}>
                    <method.icon size={22} color={method.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex items-center gap-2">
                      <Text className="text-sm font-medium text-gray-900">{method.name}</Text>
                      {method.sub && (
                        <View className="bg-green-100 rounded-full px-1.5 py-0.5">
                          <Text className="text-xs text-green-600">{method.sub}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {active && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* 支付按钮 */}
        <View
          style={{
            borderRadius: '16px', padding: '15px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
          onTouchStart={() => setBtnPressed(true)}
          onTouchEnd={() => setBtnPressed(false)}
          onTouchCancel={() => setBtnPressed(false)}
          onClick={() => setShowConfirm(true)}
        >
          <Text className="text-white text-base font-semibold">支付</Text>
        </View>

        <Text className="block text-center text-xs text-gray-400">
          支付即表示您同意《服务协议》和《隐私政策》
        </Text>
      </View>

      {/* ── 确认支付弹窗 ── */}
      {showConfirm && (
        <View
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={() => !paying && setShowConfirm(false)}
        >
          <View
            style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 24px 40px', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Text style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>确认支付</Text>
              <View
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => !paying && setShowConfirm(false)}
              >
                <X size={16} color="#64748b" />
              </View>
            </View>

            {/* 金额 */}
            <View style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', lineHeight: '1' }}>¥</Text>
              <Text style={{ fontSize: '48px', fontWeight: '800', color: '#ef4444', lineHeight: '1' }}>{price}</Text>
            </View>

            {/* 支付明细 */}
            <View style={{ background: '#f8fafc', borderRadius: '14px', padding: '4px 0', marginBottom: '20px' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <Text style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>支付方式</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <View style={{ width: '20px', height: '20px', borderRadius: '6px', background: currentMethod.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <currentMethod.icon size={13} color={currentMethod.color} />
                  </View>
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', lineHeight: '1.5' }}>{currentMethod.name}</Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <Text style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>支付金额</Text>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', lineHeight: '1.5' }}>¥{price}</Text>
              </View>
            </View>

            {/* 确认支付按钮 */}
            <View
              style={{
                borderRadius: '16px', padding: '15px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: paying ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #2563eb)',
                boxShadow: paying ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
                transition: 'all 0.2s ease',
              }}
              onClick={paying ? undefined : handleConfirmPay}
            >
              <Text style={{ color: '#fff', fontSize: '16px', fontWeight: '700', lineHeight: '1.5' }}>
                {paying ? '支付处理中...' : `确认支付 ¥${price}`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default PaymentPage
