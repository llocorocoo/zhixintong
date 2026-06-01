import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import { useEnhancementFormStore } from '@/stores/enhancement-form'
import {
  GraduationCap, Medal, Building,
  ChevronRight, Target, Zap, CircleCheck
} from 'lucide-react-taro'

const EnhancementPage: FC = () => {
  const { isLoggedIn } = useUserStore()
  const { education, certItems, workItems } = useEnhancementFormStore()
  const [pressedId, setPressedId] = useState<string | null>(null)
  const press = (id: string) => setPressedId(id)
  const release = () => setPressedId(null)

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])

  const ITEMS = [
    {
      id: 'education',
      title: '完善学历认证',
      desc: '填写学历及学位证书编号，系统将核验并提升真实性评分',
      action: '/pages/education-form/index',
      actionText: '去认证',
      icon: GraduationCap,
      saved: !!education,
    },
    {
      id: 'cert',
      title: '添加职业资格证书',
      desc: '添加行业认可的职业资格证书，提升专业性评分',
      action: '/pages/cert-form/index',
      actionText: '去添加',
      icon: Medal,
      saved: !!certItems,
    },
    {
      id: 'work',
      title: '添加工作履历',
      desc: '完整记录工作经历，体现连续稳定的职业发展轨迹',
      action: '/pages/work-form/index',
      actionText: '去补充',
      icon: Building,
      saved: !!workItems,
    },
  ]

  const savedCount = ITEMS.filter(i => i.saved).length
  const totalPrice = (savedCount * 9.9).toFixed(1)

  const handleNavigate = (path: string) => Taro.navigateTo({ url: path })

  const handleSubmit = () => {
    Taro.navigateTo({ url: `/pages/payment/index?type=enhancement&price=${totalPrice}` })
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部 ── */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>提升职业信用</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>完善信用档案，提升职业竞争力</Text>
      </View>

      <View style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── 如何提升职业信用 ── */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
            <Target size={18} color="#2563eb" />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', marginLeft: '8px' }}>如何提升职业信用</Text>
          </View>

          <View style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ITEMS.map(item => (
              <View
                key={item.id}
                style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px', transform: pressedId === item.id ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.2s ease' }}
                onTouchStart={() => press(item.id)} onTouchEnd={release} onTouchCancel={release}
                onClick={() => handleNavigate(item.action)}
              >
                <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.saved ? 'rgba(5,150,105,0.1)' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={20} color={item.saved ? '#059669' : '#2563eb'} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ marginBottom: '4px' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</Text>
                  </View>
                  <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.6' }}>{item.desc}</Text>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px', gap: '3px' }}>
                    {item.saved ? (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CircleCheck size={13} color="#059669" />
                        <Text style={{ fontSize: '12px', color: '#059669', fontWeight: '600', lineHeight: '1.5' }}>已保存</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>{item.actionText}</Text>
                        <ChevronRight size={13} color="#2563eb" />
                      </>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {savedCount > 0 && (
              <View style={{ background: '#fffbeb', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Zap size={15} color="#d97706" />
                <Text style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.6', flex: 1 }}>
                  已填写 {savedCount} 项，可在页面底部统一提交支付。
                </Text>
              </View>
            )}
          </View>
        </View>

      </View>

      {/* ── 底部提交按钮（有保存项时显示）── */}
      {savedCount > 0 && (
        <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 32px', background: '#fff', borderTop: '1px solid #f1f5f9', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
          <View
            style={{ borderRadius: '14px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
            onClick={handleSubmit}
          >
            <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>
              提交并支付 ¥{totalPrice}
            </Text>
          </View>
        </View>
      )}

    </View>
  )
}

export default EnhancementPage
