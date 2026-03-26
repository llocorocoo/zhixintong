import { View, Text } from '@tarojs/components'
import { FC, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { User, Mail, Phone, FolderOpen, Shield, ChevronRight, LogOut, Settings, CircleAlert } from 'lucide-react-taro'

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
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.redirectTo({ url: '/pages/login/index' })
        }
      }
    })
  }

  const menuItems = [
    { icon: FolderOpen, title: '资料管理', desc: '基本信息、工作履历、证书资质', action: () => Taro.navigateTo({ url: '/pages/work-history/index' }) },
    { icon: Shield, title: '隐私设置', desc: '数据授权管理', action: () => {} },
    { icon: Settings, title: '账户设置', desc: '密码、安全设置', action: () => {} },
    { icon: CircleAlert, title: '帮助中心', desc: '常见问题与反馈', action: () => {} }
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
            <Button size="sm" variant="outline">
              <Text>编辑</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <View className="flex items-center justify-between py-2">
            <View className="flex items-center gap-3">
              <Phone size={18} color="#6b7280" />
              <Text className="text-sm text-gray-600">手机号</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{userInfo?.phone || '未设置'}</Text>
          </View>
          <View className="flex items-center justify-between py-2">
            <View className="flex items-center gap-3">
              <Mail size={18} color="#6b7280" />
              <Text className="text-sm text-gray-600">邮箱</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{userInfo?.email || '未设置'}</Text>
          </View>
          <View className="flex items-center justify-between py-2">
            <View className="flex items-center gap-3">
              <User size={18} color="#6b7280" />
              <Text className="text-sm text-gray-600">姓名</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{userInfo?.name || '未设置'}</Text>
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
