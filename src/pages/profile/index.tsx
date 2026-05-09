import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Input } from '@/components/ui/input'
import {
  User, Shield, ChevronRight, LogOut,
  Settings, CircleAlert, PenLine, ShieldCheck, Phone, Lock
} from 'lucide-react-taro'

const DEMO_PHONE_FULL = '13800000000'

const ProfilePage: FC = () => {
  const { userInfo, logout, isLoggedIn, setUserInfo, setToken } = useUserStore()
  const [pressedId, setPressedId] = useState<string | null>(null)

  // 登录相关状态（游客模式使用）
  const [agreed, setAgreed] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)

  const checkAgreed = () => {
    if (!agreed) { Taro.showToast({ title: '请先阅读并同意用户协议和隐私政策', icon: 'none' }); return false }
    return true
  }

  const doLogin = async (loginPhone: string, loginPassword: string) => {
    setLoading(true)
    try {
      const res = await Network.request({ url: '/api/auth/login', method: 'POST', data: { phone: loginPhone, password: loginPassword } })
      if (res.data.code === 200 && res.data.data) {
        const { user, token } = res.data.data
        setToken(token); setUserInfo(user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
      } else {
        Taro.showToast({ title: res.data.message || '登录失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录', content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          if (userInfo?.id) {
            try { await Network.request({ url: '/api/auth/logout', method: 'POST', data: { userId: userInfo.id } }) } catch {}
          }
          logout()
        }
      }
    })
  }

  const menuItems = [
    { id: 'privacy',  icon: Shield,      title: '隐私设置', desc: '数据授权管理',   color: '#2563eb', bg: '#eff6ff', action: () => Taro.navigateTo({ url: '/pages/privacy/index' }) },
    { id: 'account',  icon: Settings,    title: '账户设置', desc: '密码、安全设置', color: '#64748b', bg: '#f1f5f9', action: () => Taro.navigateTo({ url: '/pages/account-settings/index' }) },
    { id: 'help',     icon: CircleAlert, title: '帮助中心', desc: '常见问题与反馈', color: '#059669', bg: '#f0fdf4', action: () => Taro.navigateTo({ url: '/pages/help-center/index' }) },
  ]

  const press = (id: string) => setPressedId(id)
  const release = () => setPressedId(null)

  // ── 游客模式视图 ──
  if (!isLoggedIn) {
    return (
      <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>
        {/* 头部 */}
        <View style={{
          background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
          padding: '48px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <View style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <User size={34} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={{ fontSize: '18px', fontWeight: '700', color: '#fff', display: 'block', lineHeight: '1.4', marginBottom: '4px' }}>未登录</Text>
          <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5' }}>登录后可查看个人信息</Text>
        </View>

        {/* 登录卡片 */}
        <View style={{ padding: '16px' }}>
          <View style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)', marginBottom: '12px' }}>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '16px', lineHeight: '1.4' }}>登录账户</Text>

            {/* 一键登录 */}
            <View
              style={{
                borderRadius: '14px', padding: '14px 0', marginBottom: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                transition: 'all 0.2s ease',
              }}
              onClick={loading ? undefined : () => { if (checkAgreed()) setShowPhoneModal(true) }}
            >
              <Phone size={16} color="#fff" />
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
                {loading ? '登录中...' : '手机号一键登录'}
              </Text>
            </View>

            {/* 其他手机号 */}
            {!showOther ? (
              <View
                style={{ borderRadius: '12px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px solid #e2e8f0', marginBottom: '16px' }}
                onClick={() => setShowOther(true)}
              >
                <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>其他手机号登录</Text>
                <ChevronRight size={15} color="#94a3b8" />
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '10px', background: focusField === 'phone' ? '#eff6ff' : '#f8fafc', borderRadius: '12px', padding: '11px 14px', border: `1.5px solid ${focusField === 'phone' ? '#3b82f6' : 'transparent'}` }}>
                  <Phone size={17} color={focusField === 'phone' ? '#3b82f6' : '#94a3b8'} />
                  <Input
                    style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                    placeholder="请输入手机号" placeholderStyle="color:#cbd5e1;"
                    type="number" maxlength={11} value={phone}
                    onFocus={() => setFocusField('phone')} onBlur={() => setFocusField(null)}
                    onInput={e => setPhone(e.detail.value)}
                  />
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '10px', background: focusField === 'pwd' ? '#eff6ff' : '#f8fafc', borderRadius: '12px', padding: '11px 14px', border: `1.5px solid ${focusField === 'pwd' ? '#3b82f6' : 'transparent'}` }}>
                  <Lock size={17} color={focusField === 'pwd' ? '#3b82f6' : '#94a3b8'} />
                  <Input
                    style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                    placeholder="请输入密码" placeholderStyle="color:#cbd5e1;"
                    password value={password}
                    onFocus={() => setFocusField('pwd')} onBlur={() => setFocusField(null)}
                    onInput={e => setPassword(e.detail.value)}
                  />
                </View>
                <View
                  style={{ borderRadius: '12px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.3)', marginBottom: '4px' }}
                  onClick={loading ? undefined : async () => {
                    if (!checkAgreed()) return
                    if (!phone || !password) { Taro.showToast({ title: '请填写手机号和密码', icon: 'none' }); return }
                    await doLogin(phone, password)
                  }}
                >
                  <Text style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>{loading ? '登录中...' : '登 录'}</Text>
                </View>
              </View>
            )}

            {/* 协议 */}
            <View style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }} onClick={() => setAgreed(!agreed)}>
              <View style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '2px', background: agreed ? '#2563eb' : '#fff', border: `2px solid ${agreed ? '#2563eb' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                {agreed && <Text style={{ color: '#fff', fontSize: '10px', fontWeight: '700', lineHeight: '1' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.7', flex: 1 }}>
                我已阅读并同意<Text style={{ color: '#2563eb' }}>《用户协议》</Text>和<Text style={{ color: '#2563eb' }}>《隐私政策》</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 微信风格授权弹窗 */}
        {showPhoneModal && (
          <View style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={() => setShowPhoneModal(false)}>
            <View style={{ width: '280px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <View style={{ padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <View style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} color="#fff" />
                </View>
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', textAlign: 'center', lineHeight: '1.5' }}>
                  "职信通"申请获取并{'\n'}验证你的手机号
                </Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
                  用于登录验证和账户安全{'\n'}不会用于其他用途
                </Text>
              </View>
              <View style={{ borderTop: '1px solid #f1f5f9', display: 'flex' }}>
                <View style={{ flex: 1, padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f1f5f9' }} onClick={() => setShowPhoneModal(false)}>
                  <Text style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.5' }}>不允许</Text>
                </View>
                <View style={{ flex: 1, padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setShowPhoneModal(false); doLogin(DEMO_PHONE_FULL, 'demo') }}>
                  <Text style={{ fontSize: '16px', color: '#2563eb', fontWeight: '600', lineHeight: '1.5' }}>管理号码</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  // ── 已登录视图 ──
  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '20px 20px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <View style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.1)', transform: pressedId === 'edit' ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.2s ease' }}
            onTouchStart={() => press('edit')} onTouchEnd={release} onTouchCancel={release}
            onClick={() => Taro.navigateTo({ url: '/pages/profile-edit/index' })}
          >
            <PenLine size={13} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', lineHeight: '1.5' }}>编辑资料</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <View style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <User size={34} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>{userInfo?.name || '未设置姓名'}</Text>
            <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>{userInfo?.phone || '未设置手机号'}</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          {menuItems.map((item, i) => (
            <View
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', borderBottom: i < menuItems.length - 1 ? '1px solid #f8fafc' : 'none', background: pressedId === item.id ? '#f8fafc' : 'transparent', transform: pressedId === item.id ? 'scale(0.99)' : 'scale(1)', transition: 'all 0.2s ease' }}
              onTouchStart={() => press(item.id)} onTouchEnd={release} onTouchCancel={release}
              onClick={item.action}
            >
              <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</Text>
              </View>
              <View style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#94a3b8" />
              </View>
            </View>
          ))}
        </View>

        <View
          style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)', transform: pressedId === 'logout' ? 'scale(0.99)' : 'scale(1)', transition: 'all 0.2s ease' }}
          onTouchStart={() => press('logout')} onTouchEnd={release} onTouchCancel={release}
          onClick={handleLogout}
        >
          <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={20} color="#ef4444" />
          </View>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', flex: 1, lineHeight: '1.4' }}>退出登录</Text>
        </View>
      </View>
    </View>
  )
}

export default ProfilePage
