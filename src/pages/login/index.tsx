import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { ShieldCheck, Phone, Lock, ChevronRight } from 'lucide-react-taro'

const DEMO_PHONE_FULL = '13800000000'

const LoginPage: FC = () => {
  const [agreed, setAgreed] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [btnPressed, setBtnPressed] = useState<string | null>(null)
  const { setUserInfo, setToken } = useUserStore()

  const checkAgreed = () => {
    if (!agreed) {
      Taro.showToast({ title: '请先阅读并同意用户协议和隐私政策', icon: 'none' })
      return false
    }
    return true
  }

  const doLogin = async (loginPhone: string, loginPassword: string) => {
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/auth/login', method: 'POST', data: { phone: loginPhone, password: loginPassword } })
      if (res.data.code === 200 && res.data.data) {
        const { user, token } = res.data.data
        setToken(token)
        setUserInfo(user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000)
      } else {
        Taro.showToast({ title: res.data.message || '登录失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleOneClick = () => {
    if (!checkAgreed()) return
    setShowPhoneModal(true)
  }

  const handleOtherLogin = async () => {
    if (!checkAgreed()) return
    if (!phone || !password) { Taro.showToast({ title: '请填写手机号和密码', icon: 'none' }); return }
    await doLogin(phone, password)
  }

  return (
    <View style={{
      background: 'linear-gradient(160deg, #0f2460 0%, #1a3a8f 40%, #2563eb 80%, #3b82f6 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 装饰光晕 */}
      <View style={{ position: 'absolute', top: '-80px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <View style={{ position: 'absolute', bottom: '200px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── 品牌区 ── */}
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px 24px' }}>
        <View style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          <ShieldCheck size={38} color="#ffffff" />
        </View>
        <Text style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '2px', marginBottom: '10px', lineHeight: '1.2' }}>
          职信通
        </Text>
        <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', lineHeight: '1.6' }}>
          专业职业信用管理平台
        </Text>
      </View>

      {/* ── 登录卡片 ── */}
      <View style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '32px 32px 0 0',
        padding: '28px 24px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>

        {/* 一键登录按钮 */}
        <View
          style={{
            borderRadius: '16px', padding: '15px 0', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.4)',
            transform: btnPressed === 'one' ? 'scale(0.97)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
          onTouchStart={() => setBtnPressed('one')}
          onTouchEnd={() => setBtnPressed(null)}
          onTouchCancel={() => setBtnPressed(null)}
          onClick={loading ? undefined : handleOneClick}
        >
          <Phone size={17} color="#fff" />
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
            {loading ? '登录中...' : '手机号一键登录'}
          </Text>
        </View>

        {/* 分割线 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <View style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
          <Text style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>其他方式登录</Text>
          <View style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
        </View>

        {/* 其他手机号登录 */}
        {!showOther ? (
          <View
            style={{
              borderRadius: '14px', padding: '14px 0', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              border: '1.5px solid #e2e8f0', background: '#fff',
              transform: btnPressed === 'other' ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onTouchStart={() => setBtnPressed('other')}
            onTouchEnd={() => setBtnPressed(null)}
            onTouchCancel={() => setBtnPressed(null)}
            onClick={() => { setBtnPressed(null); setShowOther(true) }}
          >
            <Text style={{ fontSize: '15px', fontWeight: '500', color: '#374151', lineHeight: '1.5' }}>其他手机号登录</Text>
            <ChevronRight size={16} color="#94a3b8" />
          </View>
        ) : (
          <View style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <View style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: focusField === 'phone' ? '#eff6ff' : '#f8fafc',
              borderRadius: '14px', padding: '12px 14px',
              border: `1.5px solid ${focusField === 'phone' ? '#3b82f6' : 'transparent'}`,
              transition: 'all 0.25s ease',
            }}>
              <Phone size={18} color={focusField === 'phone' ? '#3b82f6' : '#94a3b8'} />
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '15px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入手机号" placeholderStyle="color:#cbd5e1;"
                type="number" maxlength={11} value={phone}
                onFocus={() => setFocusField('phone')} onBlur={() => setFocusField(null)}
                onInput={e => setPhone(e.detail.value)}
              />
            </View>
            <View style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: focusField === 'pwd' ? '#eff6ff' : '#f8fafc',
              borderRadius: '14px', padding: '12px 14px',
              border: `1.5px solid ${focusField === 'pwd' ? '#3b82f6' : 'transparent'}`,
              transition: 'all 0.25s ease',
            }}>
              <Lock size={18} color={focusField === 'pwd' ? '#3b82f6' : '#94a3b8'} />
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '15px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入密码" placeholderStyle="color:#cbd5e1;"
                password value={password}
                onFocus={() => setFocusField('pwd')} onBlur={() => setFocusField(null)}
                onInput={e => setPassword(e.detail.value)}
              />
            </View>
            <View
              style={{
                borderRadius: '14px', padding: '14px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                transform: btnPressed === 'submit' ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onTouchStart={() => setBtnPressed('submit')}
              onTouchEnd={() => setBtnPressed(null)}
              onTouchCancel={() => setBtnPressed(null)}
              onClick={loading ? undefined : handleOtherLogin}
            >
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
                {loading ? '登录中...' : '登 录'}
              </Text>
            </View>
          </View>
        )}

        {/* 协议勾选 */}
        <View
          style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}
          onClick={() => setAgreed(!agreed)}
        >
          <View style={{
            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '1px',
            background: agreed ? '#2563eb' : '#fff',
            border: `2px solid ${agreed ? '#2563eb' : '#d1d5db'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            {agreed && <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>✓</Text>}
          </View>
          <Text style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.7', flex: 1 }}>
            我已阅读并同意
            <Text style={{ color: '#2563eb' }}>《用户协议》</Text>
            和
            <Text style={{ color: '#2563eb' }}>《隐私政策》</Text>
          </Text>
        </View>

        {/* 暂不登录 */}
        <View
          style={{ paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            setUserInfo({ id: 'guest', name: '游客', phone: '' })
            setToken('guest')
            Taro.switchTab({ url: '/pages/index/index' })
          }}
        >
          <Text style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>暂不登录</Text>
        </View>
      </View>

      {/* ── 微信风格授权弹窗 ── */}
      {showPhoneModal && (
        <View
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
          onClick={() => setShowPhoneModal(false)}
        >
          <View
            style={{ width: '280px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部说明 */}
            <View style={{ padding: '24px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <View style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="#fff" />
              </View>
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', textAlign: 'center', lineHeight: '1.5' }}>
                "职信通"申请获取并验证你的手机号
              </Text>
              <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
                用于登录验证和账户安全，不会用于其他用途
              </Text>
            </View>

            {/* 手机号选项 */}
            <View style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
              <View
                style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: '12px', background: '#fff' }}
                onClick={() => { setShowPhoneModal(false); doLogin(DEMO_PHONE_FULL, 'demo') }}
              >
                <View style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={17} color="#2563eb" />
                </View>
                <Text style={{ flex: 1, fontSize: '16px', fontWeight: '500', color: '#0f172a', lineHeight: '1.5', letterSpacing: '1px' }}>
                  138****0000
                </Text>
                <ChevronRight size={16} color="#94a3b8" />
              </View>
            </View>

            {/* 不允许 */}
            <View
              style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowPhoneModal(false)}
            >
              <Text style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.5' }}>不允许</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default LoginPage
