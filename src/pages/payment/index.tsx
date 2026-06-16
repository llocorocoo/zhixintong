import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { useCurrentOrderStore } from '@/stores/current-order'
import { Shield, Smartphone, CircleCheck, X, CircleAlert } from 'lucide-react-taro'

const PaymentPage: FC = () => {
  const [payMethod, setPayMethod] = useState('wechat')
  const [showConfirm, setShowConfirm] = useState(false)
  const [paying, setPaying] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)
  const [showPayWaiting, setShowPayWaiting] = useState(false)
  const [countdown, setCountdown] = useState(15 * 60) // 15分钟
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showIosTip, setShowIosTip] = useState(() => {
    try { return !Taro.getStorageSync('ios_pay_tip_dismissed') } catch { return true }
  })
  const { userInfo } = useUserStore()

  const params = Taro.getCurrentInstance().router?.params || {}
  const price = params.price || '50'
  const type = params.type || 'create'
  const isUpdate = type === 'update'
  const isEnhancement = type === 'enhancement'
  const { setOrderId } = useCurrentOrderStore()

  // 进入支付页时创建订单（若已有 orderId 则跳过）
  useEffect(() => {
    if (!userInfo?.id) return
    const existingOrderId = params.orderId as string | undefined
    if (existingOrderId) { setOrderId(existingOrderId); return }
    const orderType = isEnhancement ? 'credit_boost' : 'personal_query'
    Network.request({
      url: '/api/order/create', method: 'POST',
      data: { userId: userInfo.id, orderType, amount: parseFloat(price), serviceDetails: { type } },
    }).then(res => {
      if (res.data.code === 200) setOrderId(res.data.data.orderId)
    }).catch(() => {})
  }, [])

  const payMethods = [
    { id: 'wechat', name: '微信支付', sub: '推荐', icon: Smartphone, color: '#07c160', bg: '#f0fdf4' },
    { id: 'alipay', name: '支付宝',   sub: null,   icon: Smartphone, color: '#1677ff', bg: '#eff6ff' },
  ]

  const currentMethod = payMethods.find(m => m.id === payMethod)!

  // 发起支付 → 模拟跳转微信 → 返回后显示等待倒计时
  const handleConfirmPay = async () => {
    setPaying(true)
    Taro.showLoading({ title: '正在跳转支付...' })
    await new Promise(r => setTimeout(r, 1200))
    Taro.hideLoading()
    setPaying(false)
    setShowConfirm(false)
    // 进入支付等待状态
    setCountdown(15 * 60)
    setShowPayWaiting(true)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // 确认已完成支付
  const handlePayDone = async () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    Taro.showLoading({ title: '查询支付结果...' })
    await new Promise(r => setTimeout(r, 1000))
    const orderId = useCurrentOrderStore.getState().orderId
    if (orderId) {
      await Network.request({ url: '/api/order/pay', method: 'POST', data: { orderId, paymentMethod: payMethod } }).catch(() => {})
    }
    Taro.hideLoading()
    Taro.showToast({ title: '支付成功', icon: 'success' })
    setTimeout(() => {
      if (isEnhancement) {
        Taro.redirectTo({ url: '/pages/submit-success/index?type=enhancement' })
      } else if (isUpdate) {
        Taro.redirectTo({ url: '/pages/authorize/index?type=update' })
      } else {
        Taro.redirectTo({ url: '/pages/privacy-notice/index' })
      }
    }, 1000)
  }

  // 取消支付
  const handlePayCancel = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    const orderId = useCurrentOrderStore.getState().orderId
    if (orderId) {
      Network.request({ url: '/api/order/cancel', method: 'POST', data: { orderId } }).catch(() => {})
    }
    setShowPayWaiting(false)
    Taro.showToast({ title: '已取消支付', icon: 'none' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  const fmtCountdown = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <View className="min-h-screen flex flex-col" style={{ background: '#f0f4f8' }}>

      {/* 顶部金额展示 */}
      <View style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', paddingTop: '48px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        <Text className="block text-blue-200 text-sm mb-2">{isEnhancement ? '职业信用增信服务' : isUpdate ? '更新职业信用报告' : '生成职业信用报告'}</Text>
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
            { label: '商品', value: isEnhancement ? '职业信用增信服务' : isUpdate ? '信用报告更新服务' : '职业信用报告生成服务' },
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

      {/* ── 支付等待倒计时页 ── */}
      {showPayWaiting && (
        <View style={{ position: 'fixed', inset: 0, background: '#f6f8fc', zIndex: 250, display: 'flex', flexDirection: 'column' }}>
          {/* 顶部倒计时条 */}
          <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 28px', position: 'relative', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Text style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3' }}>
              订单待支付
            </Text>
            <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>
              请在 {fmtCountdown(countdown)} 内完成支付
            </Text>
          </View>

          <View style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 金额卡片 */}
            <View style={{ background: '#fff', borderRadius: '20px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '8px' }}>支付金额</Text>
              <View style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', lineHeight: '1' }}>¥</Text>
                <Text style={{ fontSize: '42px', fontWeight: '800', color: '#ef4444', lineHeight: '1' }}>{price}</Text>
              </View>
              <View style={{ marginTop: '12px', padding: '6px 14px', borderRadius: '20px', background: currentMethod.color + '10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <currentMethod.icon size={15} color={currentMethod.color} />
                <Text style={{ fontSize: '12px', color: currentMethod.color, fontWeight: '500', lineHeight: '1.5' }}>{currentMethod.name}</Text>
              </View>
            </View>

            {/* 订单信息 */}
            <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
              {[
                { label: '商品', value: isEnhancement ? '职业信用增信服务' : isUpdate ? '信用报告更新服务' : '职业信用报告生成服务' },
                { label: '用户', value: userInfo?.name || userInfo?.phone || '用户' },
              ].map((row, i) => (
                <View key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === 0 ? '1px solid #f8fafc' : 'none' }}>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{row.label}</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', lineHeight: '1.5' }}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* 提示 */}
            <View style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CircleAlert size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <Text style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.7', flex: 1 }}>
                如已在微信/支付宝中完成支付，请点击「已完成支付」。如需重新发起支付，请点击「继续支付」。
              </Text>
            </View>
          </View>

          {/* 底部按钮 */}
          <View style={{ flexShrink: 0, padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <View
              style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
              onClick={handlePayDone}
            >
              <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>已完成支付</Text>
            </View>
            <View style={{ display: 'flex', gap: '10px' }}>
              <View
                style={{ flex: 1, borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #e2e8f0' }}
                onClick={handlePayCancel}
              >
                <Text style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}>取消支付</Text>
              </View>
              <View
                style={{ flex: 1, borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #2563eb' }}
                onClick={() => { setShowPayWaiting(false); setShowConfirm(true) }}
              >
                <Text style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}>继续支付</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── iOS 支付提示弹窗 ── */}
      {showIosTip && (
        <View
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}
          onClick={() => {}}
        >
          <View
            style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '340px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部 */}
            <View style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleAlert size={22} color="#fff" />
              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>iOS 设备支付提示</Text>
            </View>

            {/* 内容 */}
            <View style={{ padding: '16px 20px 20px' }}>
              <Text style={{ fontSize: '13px', color: '#475569', display: 'block', lineHeight: '1.8', marginBottom: '14px' }}>
                如果您使用 iPhone 或 iPad 支付，请确认以下事项：
              </Text>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[
                  '设备已升级至 iOS 15 及以上版本',
                  '微信客户端已升级至 8.0.68 及以上',
                  'Apple ID 绑定的手机号与登录手机号一致',
                ].map((txt, i) => (
                  <View key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <View style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <Text style={{ fontSize: '11px', fontWeight: '700', color: '#d97706', lineHeight: '1' }}>{i + 1}</Text>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', flex: 1 }}>{txt}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', lineHeight: '1.6', marginBottom: '16px' }}>
                如不满足以上条件，支付可能无法正常完成。安卓设备用户可忽略此提示。
              </Text>

              <View
                style={{ borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                onClick={() => { setShowIosTip(false); try { Taro.setStorageSync('ios_pay_tip_dismissed', '1') } catch {} }}
              >
                <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>我知道了</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default PaymentPage
