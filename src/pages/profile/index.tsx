import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  User, Shield, ChevronRight, LogOut,
  Settings, CircleAlert, PenLine
} from 'lucide-react-taro'

const ProfilePage: FC = () => {
  const { userInfo, logout, isLoggedIn } = useUserStore()
  const [pressedId, setPressedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) Taro.redirectTo({ url: '/pages/login/index' })
  }, [isLoggedIn])

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          if (userInfo?.id) {
            try { await Network.request({ url: '/api/auth/logout', method: 'POST', data: { userId: userInfo.id } }) } catch {}
          }
          logout()
          Taro.redirectTo({ url: '/pages/login/index' })
        }
      }
    })
  }

  const menuItems = [
    { id: 'privacy',  icon: Shield,      title: '隐私设置', desc: '数据授权管理',   color: '#2563eb', bg: '#eff6ff',  action: () => Taro.navigateTo({ url: '/pages/privacy/index' }) },
    { id: 'account',  icon: Settings,    title: '账户设置', desc: '密码、安全设置', color: '#64748b', bg: '#f1f5f9',  action: () => Taro.navigateTo({ url: '/pages/account-settings/index' }) },
    { id: 'help',     icon: CircleAlert, title: '帮助中心', desc: '常见问题与反馈', color: '#059669', bg: '#f0fdf4',  action: () => Taro.navigateTo({ url: '/pages/help-center/index' }) },
  ]

  const press = (id: string) => setPressedId(id)
  const release = () => setPressedId(null)

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变用户信息区 ── */}
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 装饰光晕 */}
        <View style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* 编辑按钮 */}
        <View style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <View
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 14px', borderRadius: '20px',
              border: '1.5px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              transform: pressedId === 'edit' ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={() => press('edit')} onTouchEnd={release} onTouchCancel={release}
            onClick={() => Taro.navigateTo({ url: '/pages/profile-edit/index' })}
          >
            <PenLine size={13} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', lineHeight: '1.5' }}>编辑资料</Text>
          </View>
        </View>

        {/* 头像 + 信息 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <View style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <User size={34} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>
              {userInfo?.name || '未设置姓名'}
            </Text>
            <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>
              {userInfo?.phone || '未设置手机号'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── 主内容（上移与头部衔接）── */}
      <View style={{ padding: '0 16px 32px', marginTop: '-20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* 菜单列表 */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          {menuItems.map((item, i) => (
            <View
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '16px 18px',
                borderBottom: i < menuItems.length - 1 ? '1px solid #f8fafc' : 'none',
                background: pressedId === item.id ? '#f8fafc' : 'transparent',
                transform: pressedId === item.id ? 'scale(0.99)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onTouchStart={() => press(item.id)} onTouchEnd={release} onTouchCancel={release}
              onClick={item.action}
            >
              {/* 图标 */}
              <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                <item.icon size={20} color={item.color} />
              </View>
              {/* 文字 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</Text>
              </View>
              {/* 箭头 */}
              <View style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#94a3b8" />
              </View>
            </View>
          ))}
        </View>

        {/* 退出登录 */}
        <View
          style={{
            background: '#fff', borderRadius: '20px',
            padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)',
            transform: pressedId === 'logout' ? 'scale(0.99)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
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
