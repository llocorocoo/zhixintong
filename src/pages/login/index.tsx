import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Lock, Phone, ShieldCheck, ArrowRight } from 'lucide-react-taro'

const S = {
  // 背景渐变 - 深海蓝到宝石蓝
  pageBg: {
    background: 'linear-gradient(160deg, #0f2460 0%, #1a3a8f 40%, #2563eb 80%, #3b82f6 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  // 装饰圆 - 左上
  deco1: {
    position: 'absolute' as const,
    top: '-80px', left: '-60px',
    width: '240px', height: '240px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
  },
  // 装饰圆 - 右下
  deco2: {
    position: 'absolute' as const,
    bottom: '160px', right: '-80px',
    width: '280px', height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
  },
  // logo 容器
  logoWrap: {
    width: '80px', height: '80px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
  // 表单卡片
  card: {
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '32px 32px 0 0',
    padding: '32px 24px 40px',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.15), 0 -2px 8px rgba(0,0,0,0.05)',
  },
  // Tab 容器
  tabBar: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '14px',
    padding: '4px',
    marginBottom: '28px',
  },
  // Tab 激活
  tabActive: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  // Tab 非激活
  tabInactive: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  // 输入框容器 - 默认
  inputWrap: (focused: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    background: focused ? '#eff6ff' : '#f8fafc',
    borderRadius: '14px',
    padding: '14px 16px',
    border: `1.5px solid ${focused ? '#3b82f6' : 'transparent'}`,
    transition: 'all 0.3s ease',
    boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.08)' : 'none',
  }),
  // 主按钮 - 默认
  btnDefault: {
    width: '100%',
    borderRadius: '16px',
    padding: '16px 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
    boxShadow: '0 6px 24px rgba(37,99,235,0.45), 0 2px 8px rgba(37,99,235,0.3)',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  // 主按钮 - 按下
  btnPressed: {
    transform: 'scale(0.97)',
    boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
  },
  // 主按钮 - loading
  btnLoading: {
    background: '#93c5fd',
    boxShadow: 'none',
  },
}

const LoginPage: FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const { setUserInfo, setToken } = useUserStore()

  const handleLogin = async () => {
    if (!phone || !password) { Taro.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/auth/login', method: 'POST', data: { phone, password } })
      if (res.data.code === 200 && res.data.data) {
        const { user, token } = res.data.data
        setToken(token); setUserInfo(user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000)
      } else { Taro.showToast({ title: res.data.message || '登录失败', icon: 'none' }) }
    } catch { Taro.showToast({ title: '登录失败，请重试', icon: 'none' }) }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword) { Taro.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    if (password !== confirmPassword) { Taro.showToast({ title: '两次密码不一致', icon: 'none' }); return }
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/auth/register', method: 'POST', data: { phone, password } })
      if (res.data.code === 200) {
        Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
        setIsLogin(true); setPassword(''); setConfirmPassword('')
      } else { Taro.showToast({ title: res.data.message || '注册失败', icon: 'none' }) }
    } catch { Taro.showToast({ title: '注册失败，请重试', icon: 'none' }) }
    finally { setLoading(false) }
  }

  const switchMode = () => { setIsLogin(!isLogin); setPassword(''); setConfirmPassword('') }

  const btnStyle = loading
    ? { ...S.btnDefault, ...S.btnLoading }
    : btnPressed
      ? { ...S.btnDefault, ...S.btnPressed }
      : S.btnDefault

  return (
    <View style={S.pageBg}>
      {/* 装饰背景圆 */}
      <View style={S.deco1} />
      <View style={S.deco2} />

      {/* ── 品牌区 ── */}
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px 32px' }}>
        {/* Logo */}
        <View style={S.logoWrap}>
          <ShieldCheck size={38} color="#ffffff" />
        </View>

        {/* 品牌名 */}
        <Text style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '2px', marginBottom: '10px', lineHeight: '1.2' }}>
          职信通
        </Text>

        {/* Tagline */}
        <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', lineHeight: '1.6' }}>
          专业职业信用管理平台
        </Text>

        {/* 信任标签 */}
        <View style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          {['权威认证', '数据加密', '合规合法'].map(tag => (
            <View key={tag} style={{
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}>
              <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 表单卡片 ── */}
      <View style={S.card}>

        {/* Tab 切换 */}
        <View style={S.tabBar}>
          {[{ label: '登录', active: isLogin }, { label: '注册', active: !isLogin }].map((tab, i) => (
            <View
              key={tab.label}
              style={tab.active ? S.tabActive : S.tabInactive}
              onClick={() => { if (i === 0 && !isLogin) switchMode(); if (i === 1 && isLogin) switchMode() }}
            >
              <Text style={{ fontSize: '15px', fontWeight: tab.active ? '600' : '400', color: tab.active ? '#0f172a' : '#94a3b8', transition: 'all 0.3s ease' }}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>

        {/* 表单字段 */}
        <View style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

          {/* 手机号 */}
          <View>
            <Text style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', display: 'block', lineHeight: '1.5', fontWeight: '500', marginLeft: '4px' }}>手机号</Text>
            <View style={S.inputWrap(focusField === 'phone')}>
              <Phone size={18} color={focusField === 'phone' ? '#3b82f6' : '#94a3b8'} />
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '15px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入手机号"
                placeholderStyle="color: #cbd5e1;"
                type="number"
                maxlength={11}
                value={phone}
                onFocus={() => setFocusField('phone')}
                onBlur={() => setFocusField(null)}
                onInput={e => setPhone(e.detail.value)}
              />
            </View>
          </View>

          {/* 密码 */}
          <View>
            <Text style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', display: 'block', lineHeight: '1.5', fontWeight: '500', marginLeft: '4px' }}>密码</Text>
            <View style={S.inputWrap(focusField === 'password')}>
              <Lock size={18} color={focusField === 'password' ? '#3b82f6' : '#94a3b8'} />
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '15px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入密码"
                placeholderStyle="color: #cbd5e1;"
                password
                value={password}
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
                onInput={e => setPassword(e.detail.value)}
              />
            </View>
          </View>

          {/* 确认密码 */}
          {!isLogin && (
            <View>
              <Text style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', display: 'block', lineHeight: '1.5', fontWeight: '500', marginLeft: '4px' }}>确认密码</Text>
              <View style={S.inputWrap(focusField === 'confirm')}>
                <Lock size={18} color={focusField === 'confirm' ? '#3b82f6' : '#94a3b8'} />
                <Input
                  style={{ flex: 1, background: 'transparent', fontSize: '15px', color: '#0f172a', lineHeight: '1.5' }}
                  placeholder="再次输入密码"
                  placeholderStyle="color: #cbd5e1;"
                  password
                  value={confirmPassword}
                  onFocus={() => setFocusField('confirm')}
                  onBlur={() => setFocusField(null)}
                  onInput={e => setConfirmPassword(e.detail.value)}
                />
              </View>
            </View>
          )}
        </View>

        {/* 主按钮 CTA */}
        <View
          style={btnStyle}
          onTouchStart={() => !loading && setBtnPressed(true)}
          onTouchEnd={() => setBtnPressed(false)}
          onTouchCancel={() => setBtnPressed(false)}
          onClick={loading ? undefined : (isLogin ? handleLogin : handleRegister)}
        >
          <Text style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', letterSpacing: '1px', lineHeight: '1.5' }}>
            {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
          </Text>
          {!loading && <ArrowRight size={18} color="rgba(255,255,255,0.8)" />}
        </View>

        {/* 切换登录/注册 */}
        <View style={{ marginTop: '24px', textAlign: 'center', lineHeight: '1.5' }}>
          <Text style={{ fontSize: '14px', color: '#94a3b8' }}>
            {isLogin ? '还没有账户？' : '已有账户？'}
          </Text>
          <Text
            style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600', marginLeft: '4px', transition: 'all 0.2s ease' }}
            onClick={switchMode}
          >
            {isLogin ? '立即注册' : '立即登录'}
          </Text>
        </View>

        {/* 协议 */}
        <Text style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: '#cbd5e1', marginTop: '16px', lineHeight: '1.6' }}>
          {isLogin ? '登录' : '注册'}即表示同意
          <Text style={{ color: '#93c5fd' }}>《用户协议》</Text>
          和
          <Text style={{ color: '#93c5fd' }}>《隐私政策》</Text>
        </Text>
      </View>
    </View>
  )
}

export default LoginPage
