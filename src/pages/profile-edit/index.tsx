import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/stores/user'
import { User, Camera, ChevronRight } from 'lucide-react-taro'

const ProfileEditPage: FC = () => {
  const { userInfo, setUserInfo } = useUserStore()
  const [name, setName] = useState(userInfo?.name || '')
  const [gender, setGender] = useState('男')
  const [saving, setSaving] = useState(false)

  const genderOptions = ['男', '女', '不公开']

  const handleSave = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '姓名不能为空', icon: 'none' })
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setUserInfo({ ...userInfo!, name: name.trim() })
    setSaving(false)
    Taro.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-8">
      {/* 头像区 */}
      <View className="bg-white flex flex-col items-center py-8 mb-4">
        <View className="relative mb-2">
          <View className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center">
            <User size={40} color="#ffffff" />
          </View>
          <View className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Camera size={14} color="#ffffff" />
          </View>
        </View>
        <Text className="text-sm text-blue-500">点击更换头像</Text>
      </View>

      <Card className="mx-4 mb-4">
        <CardContent className="p-0">
          {/* 姓名 */}
          <View className="flex items-center px-4 py-4 border-b border-gray-100">
            <Text className="text-sm text-gray-500 w-16 flex-shrink-0">姓名</Text>
            <Input
              className="flex-1 text-sm text-gray-900 bg-transparent"
              placeholder="请输入姓名"
              value={name}
              onInput={e => setName(e.detail.value)}
            />
          </View>

          {/* 手机号（不可编辑） */}
          <View className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-sm text-gray-500 w-16 flex-shrink-0">手机号</Text>
            <Text className="flex-1 text-sm text-gray-900">{userInfo?.phone || '未绑定'}</Text>
            <View className="flex items-center gap-1">
              <Text className="text-xs text-blue-500">更换</Text>
              <ChevronRight size={14} color="#3b82f6" />
            </View>
          </View>

          {/* 性别 */}
          <View className="flex items-center px-4 py-4">
            <Text className="text-sm text-gray-500 w-16 flex-shrink-0">性别</Text>
            <View className="flex gap-2">
              {genderOptions.map(opt => (
                <View
                  key={opt}
                  className={`px-4 py-1.5 rounded-full border text-sm ${
                    gender === opt
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-200 text-gray-600'
                  } active:opacity-70`}
                  onClick={() => setGender(opt)}
                >
                  <Text className={gender === opt ? 'text-white text-sm' : 'text-gray-600 text-sm'}>{opt}</Text>
                </View>
              ))}
            </View>
          </View>
        </CardContent>
      </Card>

      <View className="mx-4">
        <Button className="w-full bg-blue-600" onClick={handleSave} disabled={saving}>
          <Text className="text-white">{saving ? '保存中...' : '保存'}</Text>
        </Button>
      </View>
    </View>
  )
}

export default ProfileEditPage
