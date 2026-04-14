import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Lock, Phone, ShieldCheck } from 'lucide-react-taro'

const LoginPage: FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUserInfo, setToken } = useUserStore()

  const handleLogin = async () => {
    if (!phone || !password) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { phone, password }
      })
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

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/auth/register',
        method: 'POST',
        data: { phone, password }
      })
      if (res.data.code === 200) {
        Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
        setIsLogin(true)
        setPassword('')
        setConfirmPassword('')
      } else {
        Taro.showToast({ title: res.data.message || '注册失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '注册失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <View className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 45%, #eff6ff 100%)' }}>

      {/* 顶部品牌区 */}
      <View className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* Logo */}
        <View className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-5"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <ShieldCheck size={40} color="#1e40af" />
        </View>
        <Text className="text-3xl font-bold text-white mb-2">职信通</Text>
        <Text className="text-sm text-blue-100">专业职业信用管理平台</Text>
      </View>

      {/* 底部表单卡片 */}
      <View className="bg-white rounded-t-3xl px-6 pt-8 pb-10"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>

        {/* 登录 / 注册 Tab */}
        <View className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          <View
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all ${isLogin ? 'bg-white' : ''}`}
            style={isLogin ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : {}}
            onClick={() => { if (!isLogin) switchMode() }}
          >
            <Text className={`text-sm font-medium ${isLogin ? 'text-gray-900' : 'text-gray-400'}`}>登录</Text>
          </View>
          <View
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center ${!isLogin ? 'bg-white' : ''}`}
            style={!isLogin ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : {}}
            onClick={() => { if (isLogin) switchMode() }}
          >
            <Text className={`text-sm font-medium ${!isLogin ? 'text-gray-900' : 'text-gray-400'}`}>注册</Text>
          </View>
        </View>

        {/* 表单字段 */}
        <View className="space-y-4 mb-6">
          {/* 手机号 */}
          <View>
            <Text className="block text-xs text-gray-500 mb-2 ml-1">手机号</Text>
            <View className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-transparent"
              style={{ borderColor: phone ? '#3b82f6' : 'transparent' }}>
              <Phone size={18} color={phone ? '#3b82f6' : '#9ca3af'} />
              <Input
                className="flex-1 bg-transparent text-sm text-gray-900"
                placeholder="请输入手机号"
                type="number"
                maxlength={11}
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>
          </View>

          {/* 密码 */}
          <View>
            <Text className="block text-xs text-gray-500 mb-2 ml-1">密码</Text>
            <View className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-transparent"
              style={{ borderColor: password ? '#3b82f6' : 'transparent' }}>
              <Lock size={18} color={password ? '#3b82f6' : '#9ca3af'} />
              <Input
                className="flex-1 bg-transparent text-sm text-gray-900"
                placeholder="请输入密码"
                password
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
          </View>

          {/* 确认密码（仅注册） */}
          {!isLogin && (
            <View>
              <Text className="block text-xs text-gray-500 mb-2 ml-1">确认密码</Text>
              <View className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-transparent"
                style={{ borderColor: confirmPassword ? '#3b82f6' : 'transparent' }}>
                <Lock size={18} color={confirmPassword ? '#3b82f6' : '#9ca3af'} />
                <Input
                  className="flex-1 bg-transparent text-sm text-gray-900"
                  placeholder="再次输入密码"
                  password
                  value={confirmPassword}
                  onInput={(e) => setConfirmPassword(e.detail.value)}
                />
              </View>
            </View>
          )}
        </View>

        {/* 提交按钮 */}
        <View
          className="w-full rounded-2xl py-4 flex items-center justify-center active:opacity-80"
          style={{
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)'
          }}
          onClick={loading ? undefined : (isLogin ? handleLogin : handleRegister)}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </Text>
        </View>

        {/* 底部提示 */}
        <View className="mt-6 text-center">
          <Text className="text-sm text-gray-400">
            {isLogin ? '还没有账户？' : '已有账户？'}
          </Text>
          <Text className="text-sm text-blue-500 font-medium ml-1" onClick={switchMode}>
            {isLogin ? '立即注册' : '立即登录'}
          </Text>
        </View>

        {/* 协议说明 */}
        <Text className="block text-center text-xs text-gray-300 mt-4">
          {isLogin ? '登录' : '注册'}即表示同意《用户协议》和《隐私政策》
        </Text>
      </View>
    </View>
  )
}

export default LoginPage
