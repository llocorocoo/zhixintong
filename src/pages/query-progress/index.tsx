import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { CircleCheck, Clock, ChevronRight } from 'lucide-react-taro'

const QueryProgressPage: FC = () => {
  const { userInfo } = useUserStore()
  const [status, setStatus] = useState<'processing' | 'completed'>('processing')
  const [btnPressed, setBtnPressed] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkStatus = async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({
        url: '/api/report/latest',
        method: 'POST',
        data: { userId: userInfo.id }
      })
      if (res.data.code === 200 && res.data.data?.status === 'completed') {
        setStatus('completed')
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    } catch {}
  }

  useEffect(() => {
    // 立即检查一次，再每2秒轮询
    checkStatus()
    pollingRef.current = setInterval(checkStatus, 2000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [userInfo?.id])

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

      {status === 'processing' ? (
        /* ── 核查中 ── */
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* 动态图标 */}
          <View style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          }}>
            <Clock size={44} color="#2563eb" />
          </View>

          <Text style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'block', lineHeight: '1.3', marginBottom: '12px' }}>
            核查中
          </Text>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', lineHeight: '1.7', marginBottom: '32px' }}>
            平台正在核查您的信用信息{'\n'}预计 1-3 个工作日完成
          </Text>

          {/* 提示 */}
          <View style={{
            background: '#fff', borderRadius: '16px', padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
            width: '100%',
          }}>
            <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', textAlign: 'center', display: 'block' }}>
              核查完成后将自动更新状态{'\n'}您也可以返回稍后查看
            </Text>
          </View>

          {/* 返回首页 */}
          <View
            style={{ marginTop: '24px', padding: '8px 20px' }}
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>返回首页</Text>
          </View>
        </View>

      ) : (
        /* ── 已完成 ── */
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
          {/* 成功图标 */}
          <View style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 8px 32px rgba(5,150,105,0.18)',
          }}>
            <CircleCheck size={48} color="#059669" />
          </View>

          <Text style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'block', lineHeight: '1.3', marginBottom: '12px' }}>
            报告已生成
          </Text>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', lineHeight: '1.7', marginBottom: '36px' }}>
            您的职业信用报告已生成完成
          </Text>

          {/* 查看报告按钮 */}
          <View
            style={{
              width: '100%', borderRadius: '16px', padding: '16px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #1e40af, #2563eb)',
              boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
              transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onTouchStart={() => setBtnPressed(true)}
            onTouchEnd={() => setBtnPressed(false)}
            onTouchCancel={() => setBtnPressed(false)}
            onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
          >
            <Text style={{ color: '#fff', fontSize: '16px', fontWeight: '700', lineHeight: '1.5' }}>
              查看职业信用报告
            </Text>
            <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      )}
    </View>
  )
}

export default QueryProgressPage
