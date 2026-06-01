import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { FileText, TrendingUp, Clock, CircleCheck, CircleAlert, XCircle, ChevronLeft } from 'lucide-react-taro'

type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'ABANDONED' | 'FAILED' | 'PAYMENT_CANCELLED' | 'EXPIRED'
type OrderType = 'personal_query' | 'credit_boost'

interface Order {
  orderId: string
  orderType: OrderType
  status: OrderStatus
  amount: number
  paymentMethod?: string
  paidAt?: string
  completionProgress: number
  failureReason?: string
  expiresAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  serviceDetails?: any
}

const TYPE_INFO: Record<OrderType, { label: string; icon: any; color: string; bg: string }> = {
  personal_query: { label: '职业信用报告', icon: FileText,   color: '#2563eb', bg: '#eff6ff' },
  credit_boost:   { label: '职业信用增信', icon: TrendingUp, color: '#059669', bg: '#f0fdf4' },
}

const STATUS_INFO: Record<OrderStatus, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  PENDING_PAYMENT:   { label: '待支付',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',    icon: Clock,        desc: '订单已创建，等待支付' },
  PAID:              { label: '处理中',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)',    icon: Clock,        desc: '支付成功，平台正在处理您的请求' },
  COMPLETED:         { label: '已完成',   color: '#059669', bg: 'rgba(5,150,105,0.1)',    icon: CircleCheck,  desc: '服务已完成' },
  ABANDONED:         { label: '处理中断', color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: CircleAlert,  desc: '支付后未完成必要步骤' },
  FAILED:            { label: '已失败',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: CircleAlert,  desc: '处理过程中发生错误' },
  PAYMENT_CANCELLED: { label: '已取消',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: XCircle,      desc: '支付已取消' },
  EXPIRED:           { label: '已过期',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: XCircle,      desc: '订单已过期' },
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

const PAY_METHOD_LABEL: Record<string, string> = { wechat: '微信支付', alipay: '支付宝' }

const Row: FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', flexShrink: 0, marginRight: '16px' }}>{label}</Text>
    <Text style={{ fontSize: '13px', fontWeight: accent ? '600' : '400', color: accent ? '#0f172a' : '#475569', lineHeight: '1.5', textAlign: 'right' }}>{value}</Text>
  </View>
)

const OrderDetailPage: FC = () => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const orderId = Taro.getCurrentInstance().router?.params?.orderId as string

  useDidShow(async () => {
    if (!orderId) { Taro.navigateBack(); return }
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/order/get', method: 'POST', data: { orderId } })
      if (res.data.code === 200) setOrder(res.data.data)
    } catch {}
    finally { setLoading(false) }
  })

  if (loading || !order) {
    return (
      <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: '14px', color: '#94a3b8' }}>{loading ? '加载中...' : '订单不存在'}</Text>
      </View>
    )
  }

  const type = TYPE_INFO[order.orderType] || TYPE_INFO.personal_query
  const status = STATUS_INFO[order.status] || STATUS_INFO.EXPIRED
  const StatusIcon = status.icon

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 状态头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <type.icon size={24} color="#fff" />
          </View>
          <View>
            <Text style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3' }}>{type.label}</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <StatusIcon size={13} color="rgba(255,255,255,0.75)" />
              <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>{status.label}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ marginTop: '-16px' }}>
        <View style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 状态卡片 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: order.status === 'PAID' ? '14px' : '0' }}>
              <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StatusIcon size={20} color={status.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '15px', fontWeight: '700', color: status.color, display: 'block', lineHeight: '1.4' }}>{status.label}</Text>
                <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.5' }}>{status.desc}</Text>
              </View>
              <Text style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>¥{order.amount.toFixed(1)}</Text>
            </View>
            {order.status === 'PAID' && (
              <View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <Text style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>处理进度</Text>
                  <Text style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', lineHeight: '1.5' }}>{order.completionProgress}%</Text>
                </View>
                <View style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${order.completionProgress}%`, background: 'linear-gradient(90deg, #1e40af, #3b82f6)', borderRadius: '3px' }} />
                </View>
              </View>
            )}
            {(order.status === 'FAILED' || order.status === 'ABANDONED') && order.failureReason && (
              <View style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: '10px' }}>
                <Text style={{ fontSize: '12px', color: '#dc2626', lineHeight: '1.6' }}>{order.failureReason}</Text>
              </View>
            )}
          </View>

          {/* 订单信息 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px', lineHeight: '1.5' }}>订单信息</Text>
            <Row label="订单编号" value={order.orderId.toUpperCase()} />
            <Row label="服务类型" value={type.label} />
            <Row label="创建时间" value={fmtDate(order.createdAt)} />
            <Row label="更新时间" value={fmtDate(order.updatedAt)} />
            {order.completedAt && <Row label="完成时间" value={fmtDate(order.completedAt)} />}
          </View>

          {/* 支付信息 */}
          {(order.status !== 'PENDING_PAYMENT' && order.status !== 'PAYMENT_CANCELLED' && order.status !== 'EXPIRED') && (
            <View style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
              <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px', lineHeight: '1.5' }}>支付信息</Text>
              <Row label="支付金额" value={`¥${order.amount.toFixed(1)}`} accent />
              {order.paymentMethod && <Row label="支付方式" value={PAY_METHOD_LABEL[order.paymentMethod] || order.paymentMethod} />}
              {order.paidAt && <Row label="支付时间" value={fmtDate(order.paidAt)} />}
            </View>
          )}

          {/* 操作区 */}
          {order.status === 'PENDING_PAYMENT' && (
            <View
              style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
              onClick={() => Taro.navigateTo({ url: `/pages/payment/index?type=${order.orderType === 'credit_boost' ? 'enhancement' : 'create'}&price=${order.amount}&orderId=${order.orderId}` })}
            >
              <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>继续支付</Text>
            </View>
          )}
          {(order.status === 'COMPLETED' || order.status === 'PAID') && order.orderType === 'personal_query' && (
            <View
              style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', border: '1.5px solid #e2e8f0' }}
              onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
            >
              <Text style={{ color: '#2563eb', fontSize: '15px', fontWeight: '600', lineHeight: '1.5' }}>查看报告</Text>
              <ChevronLeft size={15} color="#2563eb" style={{ transform: 'rotate(180deg)' }} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default OrderDetailPage
