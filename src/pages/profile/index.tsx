import { View, Text } from '@tarojs/components'
import { FC, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { User, Shield, ChevronRight, LogOut, Settings, CircleAlert } from 'lucide-react-taro'

const ProfilePage: FC = () => {
  const { userInfo, logout, isLoggedIn } = useUserStore()

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          // 清除服务端用户数据（方便演示）
          if (userInfo?.id) {
            try {
              await Network.request({
                url: '/api/auth/logout',
                method: 'POST',
                data: { userId: userInfo.id }
              })
            } catch {}
          }
          logout()
          Taro.redirectTo({ url: '/pages/login/index' })
        }
      }
    })
  }

  const menuItems = [
    { icon: Shield, title: '隐私设置', desc: '数据授权管理', action: () => Taro.navigateTo({ url: '/pages/privacy/index' }) },
    { icon: Settings, title: '账户设置', desc: '密码、安全设置', action: () => Taro.navigateTo({ url: '/pages/account-settings/index' }) },
    { icon: CircleAlert, title: '帮助中心', desc: '常见问题与反馈', action: () => Taro.navigateTo({ url: '/pages/help-center/index' }) }
  ]

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-20">
      <Card className="mb-4">
        <CardContent className="p-6">
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center">
              <User size={32} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900 mb-1">
                {userInfo?.name || '未设置姓名'}
              </Text>
              <Text className="text-sm text-gray-500">{userInfo?.phone || '未设置手机号'}</Text>
            </View>
            <Button size="sm" variant="outline" onClick={() => Taro.navigateTo({ url: '/pages/profile-edit/index' })}>
              <Text>编辑</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <View
              key={index}
              className="flex items-center p-4 border-b border-gray-100 last:border-0 active:bg-gray-50"
              onClick={item.action}
            >
              <View className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                <item.icon size={16} color="#1e40af" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">{item.title}</Text>
                <Text className="text-sm text-gray-500">{item.desc}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          ))}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        variant="outline"
        onClick={handleLogout}
      >
        <LogOut size={18} color="#ef4444" />
        <Text className="text-red-500 ml-2">退出登录</Text>
      </Button>
    </View>
  )
}

export default ProfilePage
