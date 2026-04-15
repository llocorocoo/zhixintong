import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/stores/user'
import { User, Camera, ChevronRight } from 'lucide-react-taro'

const ProfileEditPage: FC = () => {
  const { userInfo, setUserInfo } = useUserStore()
  const [name, setName] = useState(userInfo?.name || '')
  const [gender, setGender] = useState('男')
  const [saving, setSaving] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)
  const genderOptions = ['男', '女', '不公开']

  const handleSave = async () => {
    if (!name.trim()) { Taro.showToast({ title: '姓名不能为空', icon: 'none' }); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setUserInfo({ ...userInfo!, name: name.trim() })
    setSaving(false)
    Taro.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>编辑个人资料</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>修改您的基本信息</Text>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>

        {/* 头像区 */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ position: 'relative', marginBottom: '10px' }}>
            <View style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
              <User size={38} color="#fff" />
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={13} color="#fff" />
            </View>
          </View>
          <Text style={{ fontSize: '13px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>点击更换头像</Text>
        </View>

        {/* 表单卡片 */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          {/* 姓名 */}
          <View style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #f8fafc' }}>
            <Text style={{ fontSize: '14px', color: '#64748b', width: '60px', flexShrink: 0, lineHeight: '1.5' }}>姓名</Text>
            <Input
              style={{ flex: 1, fontSize: '14px', color: '#0f172a', background: 'transparent', lineHeight: '1.5' }}
              placeholder="请输入姓名" placeholderStyle="color:#cbd5e1;"
              value={name} onInput={e => setName(e.detail.value)}
            />
          </View>

          {/* 手机号 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #f8fafc' }}>
            <Text style={{ fontSize: '14px', color: '#64748b', width: '60px', flexShrink: 0, lineHeight: '1.5' }}>手机号</Text>
            <Text style={{ flex: 1, fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}>{userInfo?.phone || '未绑定'}</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Text style={{ fontSize: '12px', color: '#2563eb', lineHeight: '1.5' }}>更换</Text>
              <ChevronRight size={13} color="#2563eb" />
            </View>
          </View>

          {/* 性别 */}
          <View style={{ display: 'flex', alignItems: 'center', padding: '16px 18px' }}>
            <Text style={{ fontSize: '14px', color: '#64748b', width: '60px', flexShrink: 0, lineHeight: '1.5' }}>性别</Text>
            <View style={{ display: 'flex', gap: '8px' }}>
              {genderOptions.map(opt => (
                <View
                  key={opt}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: `1.5px solid ${gender === opt ? '#2563eb' : '#e2e8f0'}`, background: gender === opt ? '#2563eb' : '#fff', transition: 'all 0.2s ease' }}
                  onClick={() => setGender(opt)}
                >
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: gender === opt ? '#fff' : '#64748b', lineHeight: '1.5' }}>{opt}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 保存按钮 */}
        <View
          style={{ borderRadius: '16px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: saving ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: saving ? 'none' : '0 4px 16px rgba(37,99,235,0.35)', transform: btnPressed ? 'scale(0.97)' : 'scale(1)', transition: 'all 0.2s ease' }}
          onTouchStart={() => setBtnPressed(true)} onTouchEnd={() => setBtnPressed(false)} onTouchCancel={() => setBtnPressed(false)}
          onClick={saving ? undefined : handleSave}
        >
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>{saving ? '保存中...' : '保存'}</Text>
        </View>
      </View>
    </View>
  )
}

export default ProfileEditPage
