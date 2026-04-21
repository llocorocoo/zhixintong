import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { ShieldCheck, CircleCheck } from 'lucide-react-taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { useReportFormStore } from '@/stores/report-form'

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
  const [btnPressed, setBtnPressed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { pendingData, clearPendingData } = useReportFormStore()
  const { userInfo } = useUserStore()
  const params = Taro.getCurrentInstance().router?.params || {}
  const isUpdate = params.type === 'update'

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

  const handleAgree = async () => {
    if (!canAgree || !isChecked || submitting) return
    setSubmitting(true)
    try {
      const res = isUpdate
        ? await Network.request({ url: '/api/report/create', method: 'POST', data: { userId: userInfo?.id } })
        : await Network.request({ url: '/api/report/submit', method: 'POST', data: pendingData || {} })
      if (res.data.code === 200) {
        if (!isUpdate) clearPendingData()
        Taro.showLoading({ title: '职业信用报告生成中...' })
        await new Promise(r => setTimeout(r, 3000))
        Taro.hideLoading()
        Taro.showToast({ title: isUpdate ? '报告已更新' : '报告已生成', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/report/index' }), 1000)
      } else {
        Taro.showToast({ title: res.data.message || '提交失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
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
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部（与 report 页一致，padding-top 留给导航栏） ── */}
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '20px 20px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 装饰光晕 */}
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* 图标 + 说明 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldCheck size={24} color="#fff" />
          </View>
          <View>
            <Text style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>
              信息核查授权
            </Text>
            <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '3px', lineHeight: '1.5' }}>
              请仔细阅读并确认以下授权内容
            </Text>
          </View>
        </View>

      </View>

      {/* ── 主内容区 ── */}
      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* 授权书全文 */}
        <View style={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <View style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>授权书全文</Text>
          </View>
          <ScrollView scrollY style={{ height: '240px', padding: '12px 18px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.8' }}>
              {AGREEMENT}
            </Text>
          </ScrollView>
        </View>

        {/* 勾选确认 */}
        <View
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            background: '#fff', borderRadius: '16px', padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
          onClick={() => canAgree && setIsChecked(!isChecked)}
        >
          <View style={{
            width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
            marginTop: '1px',
            background: isChecked ? '#2563eb' : '#fff',
            border: `2px solid ${isChecked ? '#2563eb' : '#d1d5db'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            {isChecked && <Text style={{ color: '#fff', fontSize: '12px', fontWeight: '700', lineHeight: '1' }}>✓</Text>}
          </View>
          <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', flex: 1 }}>
            我已仔细阅读并同意《信息核查授权书》的全部内容，授权平台查询我的相关信息。
          </Text>
        </View>

        {/* 按钮组 */}
        <View style={{ display: 'flex', gap: '12px', paddingBottom: '16px' }}>
          <View
            style={{
              flex: 1, borderRadius: '16px', padding: '14px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              transition: 'all 0.2s ease',
            }}
            onClick={handleCancel}
          >
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', lineHeight: '1.5' }}>取消</Text>
          </View>

          <View
            style={{
              flex: 2, borderRadius: '16px', padding: '14px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active
                ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
                : '#e2e8f0',
              boxShadow: active ? '0 6px 20px rgba(37,99,235,0.35)' : 'none',
              transform: btnPressed && active ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onTouchStart={() => setBtnPressed(true)}
            onTouchEnd={() => setBtnPressed(false)}
            onTouchCancel={() => setBtnPressed(false)}
            onClick={handleAgree}
          >
            <Text style={{
              fontSize: '14px', fontWeight: '700', lineHeight: '1.5',
              color: active ? '#fff' : '#94a3b8',
            }}>
              {submitting ? '提交中...' : canAgree ? '同意授权' : `请阅读 (${countdown}s)`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AuthorizePage
