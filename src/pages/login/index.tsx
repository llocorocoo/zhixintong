import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { User, Lock, Phone } from 'lucide-react-taro'

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

      console.log('登录响应:', res.data)

      if (res.data.code === 200 && res.data.data) {
        const { user, token } = res.data.data
        setToken(token)
        setUserInfo(user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.message || '登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('登录错误:', error)
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

      console.log('注册响应:', res.data)

      if (res.data.code === 200) {
        Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
        setIsLogin(true)
        setPassword('')
        setConfirmPassword('')
      } else {
        Taro.showToast({ title: res.data.message || '注册失败', icon: 'none' })
      }
    } catch (error) {
      console.error('注册错误:', error)
      Taro.showToast({ title: '注册失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <View className="w-full max-w-sm">
        <View className="text-center mb-8">
          <View className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-800 mb-4">
            <User size={32} color="#ffffff" />
          </View>
          <Text className="block text-2xl font-bold text-gray-900 mb-2">职信通</Text>
          <Text className="block text-sm text-gray-500">建立您的职业信用档案</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? '登录' : '注册'}</CardTitle>
            <CardDescription>
              {isLogin ? '登录您的账户' : '创建新账户'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="space-y-3">
              <View className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <Phone size={18} color="#6b7280" />
                <Input
                  className="flex-1 bg-transparent"
                  placeholder="请输入手机号"
                  type="number"
                  maxlength={11}
                  value={phone}
                  onInput={(e) => setPhone(e.detail.value)}
                />
              </View>

              <View className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <Lock size={18} color="#6b7280" />
                <Input
                  className="flex-1 bg-transparent"
                  placeholder="请输入密码"
                  password
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                />
              </View>

              {!isLogin && (
                <View className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                  <Lock size={18} color="#6b7280" />
                  <Input
                    className="flex-1 bg-transparent"
                    placeholder="请确认密码"
                    password
                    value={confirmPassword}
                    onInput={(e) => setConfirmPassword(e.detail.value)}
                  />
                </View>
              )}
            </View>

            <Button
              className="w-full bg-blue-800"
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              <Text className="text-white">{loading ? '处理中...' : (isLogin ? '登录' : '注册')}</Text>
            </Button>

            <View className="text-center">
              <Text
                className="text-sm text-blue-800"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setPassword('')
                  setConfirmPassword('')
                }}
              >
                {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}

export default LoginPage
