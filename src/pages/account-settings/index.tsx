import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { Lock, Phone, ChevronRight, CircleAlert } from 'lucide-react-taro'
import { useUserStore } from '@/stores/user'

const AccountSettingsPage: FC = () => {
  const { userInfo, setUserInfo } = useUserStore()
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [showChangePhone, setShowChangePhone] = useState(false)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSendCode = async () => {
    if (!newPhone || newPhone.length !== 11) { Taro.showToast({ title: '请输入正确的手机号', icon: 'none' }); return }
    setCountdown(60)
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
    const timer = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0 } return prev - 1 })
    }, 1000)
  }

  const handleChangePhone = async () => {
    if (!newPhone || newPhone.length !== 11) { Taro.showToast({ title: '请输入正确的手机号', icon: 'none' }); return }
    if (!smsCode) { Taro.showToast({ title: '请输入验证码', icon: 'none' }); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setUserInfo({ ...userInfo!, phone: newPhone })
    setSaving(false)
    setNewPhone(''); setSmsCode(''); setShowChangePhone(false)
    Taro.showToast({ title: '手机号更换成功', icon: 'success' })
  }

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) { Taro.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    if (newPwd !== confirmPwd) { Taro.showToast({ title: '两次密码不一致', icon: 'none' }); return }
    if (newPwd.length < 6) { Taro.showToast({ title: '密码不能少于6位', icon: 'none' }); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setOldPwd(''); setNewPwd(''); setConfirmPwd(''); setShowChangePwd(false)
    Taro.showToast({ title: '密码修改成功', icon: 'success' })
  }

  const handleDeactivate = () => {
    Taro.showModal({ title: '注销账户', content: '注销后账户数据将被永久删除且无法恢复，确认注销吗？', confirmColor: '#ef4444',
      success: res => { if (res.confirm) Taro.showToast({ title: '已提交注销申请', icon: 'success' }) }
    })
  }

  const inputStyle = { background: '#f8fafc', borderRadius: '12px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid transparent' }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>账户设置</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>管理您的账户安全信息</Text>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>

        {/* 账号信息 */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #f8fafc' }}
            onClick={() => { setShowChangePhone(!showChangePhone); setShowChangePwd(false) }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} color="#2563eb" />
              </View>
              <View>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>手机号</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', lineHeight: '1.5' }}>{userInfo?.phone || '未绑定'}</Text>
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Text style={{ fontSize: '12px', color: '#2563eb', lineHeight: '1.5' }}>更换</Text>
              <ChevronRight size={13} color="#2563eb" />
            </View>
          </View>

          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}
            onClick={() => { setShowChangePwd(!showChangePwd); setShowChangePhone(false) }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="#64748b" />
              </View>
              <View>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>登录密码</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', lineHeight: '1.5' }}>定期更换密码保障账户安全</Text>
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Text style={{ fontSize: '12px', color: '#2563eb', lineHeight: '1.5' }}>修改</Text>
              <ChevronRight size={13} color="#2563eb" />
            </View>
          </View>
        </View>

        {/* 更换手机号表单 */}
        {showChangePhone && (
          <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>更换手机号</Text>
            <View style={inputStyle}>
              <Phone size={16} color="#94a3b8" />
              <Input style={{ flex: 1, fontSize: '14px', color: '#0f172a', background: 'transparent' }} placeholder="请输入新手机号" placeholderStyle="color:#cbd5e1;" type="number" maxlength={11} value={newPhone} onInput={e => setNewPhone(e.detail.value)} />
            </View>
            <View style={{ display: 'flex', gap: '8px' }}>
              <View style={{ ...inputStyle, flex: 1 }}>
                <Input style={{ flex: 1, fontSize: '14px', color: '#0f172a', background: 'transparent' }} placeholder="验证码" placeholderStyle="color:#cbd5e1;" type="number" maxlength={6} value={smsCode} onInput={e => setSmsCode(e.detail.value)} />
              </View>
              <View style={{ padding: '11px 14px', borderRadius: '12px', background: countdown > 0 ? '#f1f5f9' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={countdown === 0 ? handleSendCode : undefined}>
                <Text style={{ fontSize: '13px', fontWeight: '500', color: countdown > 0 ? '#94a3b8' : '#2563eb', lineHeight: '1.5' }}>{countdown > 0 ? `${countdown}s` : '获取验证码'}</Text>
              </View>
            </View>
            <View style={{ display: 'flex', gap: '10px' }}>
              <View style={{ flex: 1, borderRadius: '14px', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #e2e8f0', background: '#fff' }}
                onClick={() => { setShowChangePhone(false); setNewPhone(''); setSmsCode('') }}>
                <Text style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>取消</Text>
              </View>
              <View style={{ flex: 1, borderRadius: '14px', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                onClick={saving ? undefined : handleChangePhone}>
                <Text style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>{saving ? '提交中...' : '确认更换'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 修改密码表单 */}
        {showChangePwd && (
          <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>修改登录密码</Text>
            {[
              { key: 'old', val: oldPwd, set: setOldPwd, ph: '当前密码' },
              { key: 'new', val: newPwd, set: setNewPwd, ph: '新密码（不少于6位）' },
              { key: 'confirm', val: confirmPwd, set: setConfirmPwd, ph: '确认新密码' },
            ].map(f => (
              <View key={f.key} style={inputStyle}>
                <Lock size={16} color="#94a3b8" />
                <Input style={{ flex: 1, fontSize: '14px', color: '#0f172a', background: 'transparent' }} placeholder={f.ph} placeholderStyle="color:#cbd5e1;" password value={f.val} onInput={e => f.set(e.detail.value)} />
              </View>
            ))}
            <View style={{ display: 'flex', gap: '10px' }}>
              <View style={{ flex: 1, borderRadius: '14px', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #e2e8f0', background: '#fff' }}
                onClick={() => { setShowChangePwd(false); setOldPwd(''); setNewPwd(''); setConfirmPwd('') }}>
                <Text style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>取消</Text>
              </View>
              <View style={{ flex: 1, borderRadius: '14px', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                onClick={saving ? undefined : handleChangePwd}>
                <Text style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>{saving ? '提交中...' : '确认修改'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 安全提示 */}
        <View style={{ background: '#fffbeb', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px', borderLeft: '3px solid #f59e0b' }}>
          <CircleAlert size={15} color="#d97706" />
          <Text style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.6', flex: 1 }}>为保障账户安全，建议使用包含字母和数字的组合密码，并定期更换。</Text>
        </View>

        {/* 注销账户 */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px', lineHeight: '1.5' }}>注销账户</Text>
          <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '14px', lineHeight: '1.6' }}>注销账户后，您的信用报告、评分及所有个人数据将被永久删除，且无法恢复。</Text>
          <View style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }} onClick={handleDeactivate}>
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444', lineHeight: '1.5' }}>申请注销账户</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AccountSettingsPage
