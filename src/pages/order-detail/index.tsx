import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { FileText, TrendingUp, Clock, CircleCheck, CircleAlert, Ban, ChevronRight } from 'lucide-react-taro'

type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'ABANDONED' | 'FAILED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED' | 'EXPIRED'
type OrderType = 'personal_query' | 'credit_boost'

interface Order {
  orderId: string
  orderType: OrderType
  status: OrderStatus
  amount: number
  completionProgress: number
  failureReason?: string
  paymentPlatform?: string
  paymentChannel?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  completedAt?: string
}

const TYPE_INFO: Record<OrderType, { label: string; icon: any; color: string; bg: string }> = {
  personal_query: { label: '职业信用报告', icon: FileText,   color: '#2563eb', bg: '#eff6ff' },
  credit_boost:   { label: '职业信用增信', icon: TrendingUp, color: '#059669', bg: '#f0fdf4' },
}

const STATUS_INFO: Record<OrderStatus, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  PENDING_PAYMENT:   { label: '待支付',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',    icon: Clock,        desc: '订单已创建，等待支付' },
  PAID:              { label: '处理中',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)',    icon: Clock,        desc: '支付成功，平台正在处理您的请求' },
  COMPLETED:         { label: '已完成',   color: '#059669', bg: 'rgba(5,150,105,0.1)',    icon: CircleCheck,  desc: '服务已完成' },
  ABANDONED:         { label: '待授权',   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  icon: CircleAlert,  desc: '支付成功，等待完成授权' },
  PAYMENT_FAILED:    { label: '支付失败', color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: CircleAlert,  desc: '支付未成功，请重试' },
  FAILED:            { label: '已失败',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: CircleAlert,  desc: '处理过程中发生错误' },
  PAYMENT_CANCELLED: { label: '已取消',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: Ban,          desc: '支付已取消' },
  EXPIRED:           { label: '已过期',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: Ban,          desc: '订单已过期' },
}

const CHANNEL_LABEL: Record<string, string> = { wechat: '微信支付', alipay: '支付宝' }

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

const Row: FC<{ label: string; value: string; accent?: boolean; red?: boolean }> = ({ label, value, accent, red }) => (
  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', flexShrink: 0, marginRight: '16px' }}>{label}</Text>
    <Text style={{ fontSize: '13px', fontWeight: accent || red ? '600' : '400', color: red ? '#ef4444' : accent ? '#0f172a' : '#475569', lineHeight: '1.5', textAlign: 'right' }}>{value}</Text>
  </View>
)

// ── 样例数据（API 查不到 mock 订单时使用）──
const dm = (daysAgo: number, h = 10, m = 0) => {
  const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(h, m, 0, 0); return t.toISOString()
}
const minsAgoDt = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString()
const MOCK_MAP: Record<string, Order> = {
  'mock-001': { orderId: 'mock-001', orderType: 'personal_query', status: 'PENDING_PAYMENT', amount: 50, completionProgress: 0, paymentPlatform: '网页应用', createdAt: minsAgoDt(5), updatedAt: minsAgoDt(5) },
  'mock-002': { orderId: 'mock-002', orderType: 'personal_query', status: 'PAID', amount: 9.9, completionProgress: 30, paymentPlatform: '网页应用', paymentChannel: 'wechat', createdAt: dm(2,9,5), updatedAt: dm(2,9,8), paidAt: dm(2,9,7) },
  'mock-003': { orderId: 'mock-003', orderType: 'credit_boost', status: 'COMPLETED', amount: 29.7, completionProgress: 100, paymentPlatform: '微信小程序', paymentChannel: 'wechat', createdAt: dm(7,11,30), updatedAt: dm(5,16,0), paidAt: dm(7,11,33), completedAt: dm(5,16,0) },
  'mock-004': { orderId: 'mock-004', orderType: 'personal_query', status: 'COMPLETED', amount: 50, completionProgress: 100, paymentPlatform: '网页应用', paymentChannel: 'alipay', createdAt: dm(14,10,0), updatedAt: dm(11,9,0), paidAt: dm(14,10,4), completedAt: dm(11,9,0) },
  'mock-005': { orderId: 'mock-005', orderType: 'credit_boost', status: 'ABANDONED', amount: 9.9, completionProgress: 30, paymentPlatform: '微信小程序', paymentChannel: 'wechat', createdAt: dm(3,17,10), updatedAt: dm(3,17,45), paidAt: dm(3,17,13) },
  'mock-008': { orderId: 'mock-008', orderType: 'credit_boost', status: 'PAYMENT_FAILED', amount: 19.8, completionProgress: 0, paymentPlatform: '网页应用', paymentChannel: 'wechat', createdAt: dm(2,11,30), updatedAt: dm(2,11,32) },
  'mock-009': { orderId: 'mock-009', orderType: 'personal_query', status: 'EXPIRED', amount: 50, completionProgress: 0, paymentPlatform: '网页应用', createdAt: dm(1,10,0), updatedAt: dm(1,10,15) },
  'mock-007': { orderId: 'mock-007', orderType: 'personal_query', status: 'PAYMENT_CANCELLED', amount: 50, completionProgress: 0, paymentPlatform: '网页应用', createdAt: dm(6,15,0), updatedAt: dm(6,15,2) },
}

const PAID_STATUSES = new Set(['PAID','COMPLETED','ABANDONED'])

const OrderDetailPage: FC = () => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const orderId = Taro.getCurrentInstance().router?.params?.orderId as string

  useDidShow(async () => {
    if (!orderId) { Taro.navigateBack(); return }
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/order/get', method: 'POST', data: { orderId } })
      if (res.data.code === 200 && res.data.data) { setOrder(res.data.data); return }
    } catch {}
    // fallback to mock
    if (MOCK_MAP[orderId]) setOrder(MOCK_MAP[orderId])
    setLoading(false)
  })

  // 待支付倒计时（15分钟窗口）
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!order || order.status !== 'PENDING_PAYMENT') return
    const created = new Date(order.createdAt).getTime()
    const expires = Number.isNaN(created) ? Date.now() + 15 * 60 * 1000 : created + 15 * 60 * 1000
    const calc = () => {
      const left = Math.floor((expires - Date.now()) / 1000)
      return left > 0 ? left : 0
    }
    // 如果计算出来就是 0（时间解析失败或 mock 数据过期），给满 15 分钟
    const initial = calc()
    const effectiveExpires = initial > 0 ? expires : Date.now() + 15 * 60 * 1000
    const effectiveCalc = () => Math.max(0, Math.floor((effectiveExpires - Date.now()) / 1000))
    setCountdown(effectiveCalc())
    timerRef.current = setInterval(() => {
      const left = effectiveCalc()
      setCountdown(left)
      if (left <= 0 && timerRef.current) clearInterval(timerRef.current)
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [order])

  const fmtCountdown = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (loading && !order) {
    return (
      <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: '14px', color: '#94a3b8' }}>加载中...</Text>
      </View>
    )
  }
  if (!order) {
    return (
      <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: '14px', color: '#94a3b8' }}>订单不存在</Text>
      </View>
    )
  }

  const type = TYPE_INFO[order.orderType] || TYPE_INFO.personal_query
  const status = STATUS_INFO[order.status] || STATUS_INFO.EXPIRED
  const StatusIcon = status.icon
  const hasPaid = PAID_STATUSES.has(order.status)
  const actualPaid = hasPaid ? order.amount : 0

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 状态头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <type.icon size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3' }}>{type.label}</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <StatusIcon size={13} color="rgba(255,255,255,0.75)" />
              <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
                {order.status === 'PENDING_PAYMENT' && countdown > 0
                  ? `待支付 · 剩余 ${fmtCountdown(countdown)}`
                  : status.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View style={{ padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 状态卡片 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StatusIcon size={20} color={status.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '15px', fontWeight: '700', color: status.color, display: 'block', lineHeight: '1.4' }}>{status.label}</Text>
                <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.5' }}>
                  {order.status === 'PENDING_PAYMENT' && countdown > 0
                    ? `请在 ${fmtCountdown(countdown)} 内完成支付`
                    : order.status === 'PENDING_PAYMENT' && countdown <= 0
                      ? '支付超时，请重新下单'
                      : status.desc}
                </Text>
              </View>
            </View>
          </View>

          {/* 支付信息 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px', lineHeight: '1.5' }}>支付信息</Text>
            <Row label="支付端" value={order.paymentPlatform || '网页应用'} />
            {order.paymentChannel && <Row label="支付渠道" value={CHANNEL_LABEL[order.paymentChannel] || order.paymentChannel} />}
            <Row label="应付" value={`¥${order.amount.toFixed(2)}`} accent />
            <Row label="实付" value={`¥${actualPaid.toFixed(2)}`} red={actualPaid > 0} />
            {order.paidAt && <Row label="支付时间" value={fmtDate(order.paidAt)} />}
          </View>

          {/* 订单信息 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px', lineHeight: '1.5' }}>订单信息</Text>
            <Row label="订单编号" value={order.orderId.toUpperCase()} />
            <Row label="服务类型" value={type.label} />
            <Row label="创建时间" value={fmtDate(order.createdAt)} />
            {order.completedAt && <Row label="完成时间" value={fmtDate(order.completedAt)} />}
          </View>

          {/* 操作区 */}
          {order.status === 'PENDING_PAYMENT' && (
            <View style={{ display: 'flex', gap: '10px' }}>
              <View
                style={{ flex: 1, borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #e2e8f0' }}
                onClick={() => {
                  Taro.showModal({
                    title: '取消订单', content: '确定取消此订单吗？',
                    success: async (res) => {
                      if (!res.confirm) return
                      await Network.request({ url: '/api/order/cancel', method: 'POST', data: { orderId: order.orderId } }).catch(() => {})
                      Taro.showToast({ title: '已取消', icon: 'success' })
                      setTimeout(() => Taro.navigateBack(), 800)
                    }
                  })
                }}
              >
                <Text style={{ color: '#64748b', fontSize: '15px', fontWeight: '600', lineHeight: '1.5' }}>取消订单</Text>
              </View>
              <View
                style={{ flex: 2, borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                onClick={() => Taro.navigateTo({ url: `/pages/payment/index?type=${order.orderType === 'credit_boost' ? 'enhancement' : 'create'}&price=${order.amount}&orderId=${order.orderId}` })}
              >
                <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>继续支付</Text>
              </View>
            </View>
          )}
          {order.status === 'PAYMENT_FAILED' && (
            <View
              style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
              onClick={() => Taro.navigateTo({ url: `/pages/payment/index?type=${order.orderType === 'credit_boost' ? 'enhancement' : 'create'}&price=${order.amount}&orderId=${order.orderId}` })}
            >
              <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>重新支付</Text>
            </View>
          )}
          {order.status === 'ABANDONED' && (
            <View
              style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
              onClick={() => Taro.navigateTo({ url: `/pages/authorize/index?type=${order.orderType === 'credit_boost' ? 'enhancement' : ''}` })}
            >
              <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>前往授权</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default OrderDetailPage
