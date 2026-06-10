import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileText, TrendingUp, Clock, CircleCheck, CircleAlert, Ban, ChevronRight, PackageOpen } from 'lucide-react-taro'

type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'ABANDONED' | 'FAILED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED' | 'EXPIRED'
type OrderType = 'personal_query' | 'credit_boost'

interface Order {
  orderId: string
  orderType: OrderType
  status: OrderStatus
  amount: number
  completionProgress: number
  failureReason?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  completedAt?: string
}

const TYPE_INFO: Record<OrderType, { label: string; icon: any; color: string; bg: string }> = {
  personal_query: { label: '职业信用报告', icon: FileText,    color: '#2563eb', bg: '#eff6ff' },
  credit_boost:   { label: '职业信用增信', icon: TrendingUp,  color: '#059669', bg: '#f0fdf4' },
}

const STATUS_INFO: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING_PAYMENT:   { label: '待支付',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',    icon: Clock },
  PAID:              { label: '处理中',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)',    icon: Clock },
  PAYMENT_FAILED:    { label: '支付失败', color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: CircleAlert },
  COMPLETED:         { label: '已完成',   color: '#059669', bg: 'rgba(5,150,105,0.1)',    icon: CircleCheck },
  ABANDONED:         { label: '待授权',   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  icon: CircleAlert },
  FAILED:            { label: '已失败',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: CircleAlert },
  PAYMENT_CANCELLED: { label: '已取消',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: Ban },
  EXPIRED:           { label: '已过期',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: Ban },
}

const TABS = [
  { key: 'all',     label: '全部' },
  { key: 'PENDING_PAYMENT', label: '待支付' },
  { key: 'PAID',    label: '进行中' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'closed',  label: '已关闭' },
]

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const CLOSED = new Set(['FAILED','PAYMENT_CANCELLED','EXPIRED'])

const d = (daysAgo: number, h = 10, m = 0) => {
  const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(h, m, 0, 0); return t.toISOString()
}

const MOCK_ORDERS: Order[] = [
  {
    orderId: 'mock-001', orderType: 'personal_query', status: 'PENDING_PAYMENT',
    amount: 50, completionProgress: 0,
    createdAt: d(1, 14, 22), updatedAt: d(1, 14, 22),
  },
  {
    orderId: 'mock-002', orderType: 'personal_query', status: 'PAID',
    amount: 9.9, completionProgress: 30,
    createdAt: d(2, 9, 5), updatedAt: d(2, 9, 8), paidAt: d(2, 9, 7),
  },
  {
    orderId: 'mock-003', orderType: 'credit_boost', status: 'COMPLETED',
    amount: 29.7, completionProgress: 100,
    createdAt: d(7, 11, 30), updatedAt: d(5, 16, 0), paidAt: d(7, 11, 33), completedAt: d(5, 16, 0),
  },
  {
    orderId: 'mock-004', orderType: 'personal_query', status: 'COMPLETED',
    amount: 50, completionProgress: 100,
    createdAt: d(14, 10, 0), updatedAt: d(11, 9, 0), paidAt: d(14, 10, 4), completedAt: d(11, 9, 0),
  },
  {
    orderId: 'mock-005', orderType: 'credit_boost', status: 'ABANDONED',
    amount: 9.9, completionProgress: 30,

    createdAt: d(3, 17, 10), updatedAt: d(3, 17, 45), paidAt: d(3, 17, 13),
  },

  {
    orderId: 'mock-008', orderType: 'credit_boost', status: 'PAYMENT_FAILED',
    amount: 19.8, completionProgress: 0,
    createdAt: d(2, 11, 30), updatedAt: d(2, 11, 32),
  },
  {
    orderId: 'mock-007', orderType: 'personal_query', status: 'PAYMENT_CANCELLED',
    amount: 50, completionProgress: 0,
    createdAt: d(6, 15, 0), updatedAt: d(6, 15, 2),
  },
]

const OrdersPage: FC = () => {
  const { userInfo, isLoggedIn } = useUserStore()
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [pressedId, setPressedId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!userInfo?.id) return
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/order/list', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200) {
        const real: Order[] = res.data.data || []
        // 真实订单在前，样例在后（去重）
        const realIds = new Set(real.map((o: Order) => o.orderId))
        setOrders([...real, ...MOCK_ORDERS.filter(m => !realIds.has(m.orderId))])
      }
    } catch {}
    finally { setLoading(false) }
  }, [userInfo?.id])

  useDidShow(() => {
    if (isLoggedIn) fetchOrders()
    else Taro.redirectTo({ url: '/pages/login/index' })
  })

  const filtered = orders.filter(o => {
    if (activeTab === 'all') return true
    if (activeTab === 'closed') return CLOSED.has(o.status)
    if (activeTab === 'PAID') return o.status === 'PAID' || o.status === 'ABANDONED' || o.status === 'PAYMENT_FAILED'
    return o.status === activeTab
  })

  const handleCardPress = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` })
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>我的订单</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>查看所有服务订单记录</Text>
      </View>

      {/* Tab 栏 */}
      <View style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #f1f5f9', paddingLeft: '4px', paddingRight: '4px' }}>
        {TABS.map(tab => (
          <View
            key={tab.key}
            style={{ flex: 1, padding: '12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text style={{ fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400', color: activeTab === tab.key ? '#2563eb' : '#94a3b8', lineHeight: '1.5' }}>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 170px)' }}>
        <View style={{ padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <View style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8' }}>加载中...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ paddingTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PackageOpen size={28} color="#cbd5e1" />
              </View>
              <Text style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>暂无订单</Text>
            </View>
          ) : filtered.map(order => {
            const type = TYPE_INFO[order.orderType] || TYPE_INFO.personal_query
            const status = STATUS_INFO[order.status] || STATUS_INFO.EXPIRED
            const StatusIcon = status.icon
            return (
              <View
                key={order.orderId}
                style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)', transform: pressedId === order.orderId ? 'scale(0.99)' : 'scale(1)', transition: 'all 0.2s ease' }}
                onTouchStart={() => setPressedId(order.orderId)}
                onTouchEnd={() => setPressedId(null)}
                onTouchCancel={() => setPressedId(null)}
                onClick={() => handleCardPress(order.orderId)}
              >
                {/* 卡片头 */}
                <View style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <View style={{ width: '36px', height: '36px', borderRadius: '10px', background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <type.icon size={18} color={type.color} />
                    </View>
                    <View>
                      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{type.label}</Text>
                      <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', lineHeight: '1.5' }}>
                        {order.orderId.substring(0, 8).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: status.bg }}>
                    <StatusIcon size={12} color={status.color} />
                    <Text style={{ fontSize: '12px', fontWeight: '600', color: status.color, lineHeight: '1.5' }}>{status.label}</Text>
                  </View>
                </View>

                {/* 卡片体 */}
                <View style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                      ¥{order.amount.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>
                      {fmtDate(order.createdAt)}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#cbd5e1" />
                </View>

                {/* 处理中进度条 */}
                {order.status === 'PAID' && (
                  <View style={{ padding: '0 16px 14px' }}>
                    <View style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${order.completionProgress}%`, background: 'linear-gradient(90deg, #1e40af, #3b82f6)', borderRadius: '2px' }} />
                    </View>
                  </View>
                )}

                {/* 失败/中断原因 */}
                {(order.status === 'FAILED' || order.status === 'ABANDONED') && order.failureReason && (
                  <View style={{ margin: '0 16px 14px', padding: '8px 12px', background: 'rgba(220,38,38,0.06)', borderRadius: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#dc2626', lineHeight: '1.5' }}>{order.failureReason}</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

export default OrdersPage
