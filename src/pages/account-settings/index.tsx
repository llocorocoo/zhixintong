import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSendCode = async () => {
    if (!newPhone || newPhone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    setCodeSent(true)
    setCountdown(60)
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleChangePhone = async () => {
    if (!newPhone || newPhone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!smsCode) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setUserInfo({ ...userInfo!, phone: newPhone })
    setSaving(false)
    setNewPhone(''); setSmsCode(''); setCodeSent(false)
    setShowChangePhone(false)
    Taro.showToast({ title: '手机号更换成功', icon: 'success' })
  }

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    if (newPwd !== confirmPwd) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (newPwd.length < 6) {
      Taro.showToast({ title: '密码不能少于6位', icon: 'none' })
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSaving(false)
    setOldPwd(''); setNewPwd(''); setConfirmPwd('')
    setShowChangePwd(false)
    Taro.showToast({ title: '密码修改成功', icon: 'success' })
  }

  const handleDeactivate = () => {
    Taro.showModal({
      title: '注销账户',
      content: '注销后账户数据将被永久删除且无法恢复，确认注销吗？',
      confirmColor: '#ef4444',
      success: res => {
        if (res.confirm) {
          Taro.showToast({ title: '已提交注销申请', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-8">

      {/* 账号信息 */}
      <Card className="mx-4 mt-4 mb-4">
        <CardContent className="p-0">
          <View
            className="flex items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50"
            onClick={() => { setShowChangePhone(!showChangePhone); setShowChangePwd(false) }}
          >
            <View className="flex items-center gap-3">
              <Phone size={18} color="#6b7280" />
              <View>
                <Text className="block text-sm font-medium text-gray-900">手机号</Text>
                <Text className="block text-xs text-gray-500 mt-0.5">{userInfo?.phone || '未绑定'}</Text>
              </View>
            </View>
            <View className="flex items-center gap-1">
              <Text className="text-xs text-blue-500">更换</Text>
              <ChevronRight size={14} color="#3b82f6" />
            </View>
          </View>

          <View
            className="flex items-center justify-between px-4 py-4 active:bg-gray-50"
            onClick={() => setShowChangePwd(!showChangePwd)}
          >
            <View className="flex items-center gap-3">
              <Lock size={18} color="#6b7280" />
              <View>
                <Text className="block text-sm font-medium text-gray-900">登录密码</Text>
                <Text className="block text-xs text-gray-500 mt-0.5">定期更换密码保障账户安全</Text>
              </View>
            </View>
            <View className="flex items-center gap-1">
              <Text className="text-xs text-blue-500">修改</Text>
              <ChevronRight size={14} color="#3b82f6" />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 更换手机号表单 */}
      {showChangePhone && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4 space-y-3">
            <Text className="block text-sm font-medium text-gray-900 mb-2">更换手机号</Text>

            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <Phone size={16} color="#9ca3af" />
              <Input
                className="flex-1 bg-transparent text-sm"
                placeholder="请输入新手机号"
                type="number"
                maxlength={11}
                value={newPhone}
                onInput={e => setNewPhone(e.detail.value)}
              />
            </View>

            <View className="flex gap-2">
              <View className="flex-1 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
                <Input
                  className="flex-1 bg-transparent text-sm"
                  placeholder="请输入验证码"
                  type="number"
                  maxlength={6}
                  value={smsCode}
                  onInput={e => setSmsCode(e.detail.value)}
                />
              </View>
              <View
                className={`px-4 py-3 rounded-xl flex items-center justify-center ${countdown > 0 ? 'bg-gray-100' : 'bg-blue-50 active:bg-blue-100'}`}
                onClick={countdown === 0 ? handleSendCode : undefined}
              >
                <Text className={`text-sm font-medium ${countdown > 0 ? 'text-gray-400' : 'text-blue-500'}`}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              </View>
            </View>

            <View className="flex gap-3 pt-1">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => { setShowChangePhone(false); setNewPhone(''); setSmsCode(''); setCodeSent(false) }}
              >
                <Text className="text-gray-600">取消</Text>
              </Button>
              <Button className="flex-1 bg-blue-600" onClick={handleChangePhone} disabled={saving}>
                <Text className="text-white">{saving ? '提交中...' : '确认更换'}</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 修改密码表单 */}
      {showChangePwd && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4 space-y-3">
            <Text className="block text-sm font-medium text-gray-900 mb-2">修改登录密码</Text>

            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <Lock size={16} color="#9ca3af" />
              <Input
                className="flex-1 bg-transparent text-sm"
                placeholder="当前密码"
                password
                value={oldPwd}
                onInput={e => setOldPwd(e.detail.value)}
              />
            </View>
            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <Lock size={16} color="#9ca3af" />
              <Input
                className="flex-1 bg-transparent text-sm"
                placeholder="新密码（不少于6位）"
                password
                value={newPwd}
                onInput={e => setNewPwd(e.detail.value)}
              />
            </View>
            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <Lock size={16} color="#9ca3af" />
              <Input
                className="flex-1 bg-transparent text-sm"
                placeholder="确认新密码"
                password
                value={confirmPwd}
                onInput={e => setConfirmPwd(e.detail.value)}
              />
            </View>

            <View className="flex gap-3 pt-1">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => { setShowChangePwd(false); setOldPwd(''); setNewPwd(''); setConfirmPwd('') }}
              >
                <Text className="text-gray-600">取消</Text>
              </Button>
              <Button className="flex-1 bg-blue-600" onClick={handleChangePwd} disabled={saving}>
                <Text className="text-white">{saving ? '提交中...' : '确认修改'}</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 安全提示 */}
      <View className="mx-4 mb-4 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
        <CircleAlert size={16} color="#f59e0b" className="mt-0.5 flex-shrink-0" />
        <Text className="text-xs text-amber-700 leading-relaxed">
          为保障账户安全，建议使用包含字母和数字的组合密码，并定期更换。
        </Text>
      </View>

      {/* 注销账户 */}
      <Card className="mx-4">
        <CardContent className="p-4">
          <Text className="block text-sm font-medium text-gray-900 mb-1">注销账户</Text>
          <Text className="block text-xs text-gray-500 mb-3 leading-relaxed">
            注销账户后，您的信用报告、评分及所有个人数据将被永久删除，且无法恢复。
          </Text>
          <View
            className="py-2.5 px-4 border border-red-200 rounded-xl flex items-center justify-center active:bg-red-50"
            onClick={handleDeactivate}
          >
            <Text className="text-sm text-red-500">申请注销账户</Text>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}

export default AccountSettingsPage
