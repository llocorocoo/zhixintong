import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { 
  ChevronLeft,
  Shield,
  CreditCard,
  Plane,
  GraduationCap,
  Briefcase,
  IdCard,
  Building,
  Car,
  Building2,
  HeartPulse,
  Receipt,
  ChevronRight,
  Plus,
  Award
} from 'lucide-react-taro'

interface MaterialItem {
  id: string
  name: string
  desc?: string
  uploaded: boolean
  icon: any
}

interface MaterialCategory {
  id: string
  title: string
  items: MaterialItem[]
}

const WorkHistoryPage: FC = () => {
  const [categories] = useState<MaterialCategory[]>([
    {
      id: 'identity',
      title: '身份证明',
      items: [
        { id: 'idcard', name: '身份证', uploaded: true, icon: CreditCard },
        { id: 'passport', name: '护照', desc: '芝麻名片展示信息', uploaded: false, icon: Plane }
      ]
    },
    {
      id: 'education',
      title: '学历证明',
      items: [
        { id: 'diploma', name: '学历学籍', desc: '芝麻名片展示信息', uploaded: true, icon: GraduationCap }
      ]
    },
    {
      id: 'work',
      title: '工作证明',
      items: [
        { id: 'workinfo', name: '工作信息', desc: '芝麻名片展示信息', uploaded: false, icon: Briefcase },
        { id: 'career', name: '职业信息', uploaded: false, icon: IdCard }
      ]
    },
    {
      id: 'asset',
      title: '资产证明',
      items: [
        { id: 'house', name: '房产信息', desc: '芝麻名片展示信息', uploaded: false, icon: Building },
        { id: 'car', name: '车产信息', desc: '芝麻名片展示信息', uploaded: false, icon: Car },
        { id: 'housingfund', name: '公积金', desc: '芝麻名片展示信息', uploaded: false, icon: Building2 },
        { id: 'social', name: '社保', desc: '芝麻名片展示信息', uploaded: false, icon: Shield },
        { id: 'tax', name: '个人所得税', uploaded: false, icon: Receipt },
        { id: 'medical', name: '医保', uploaded: false, icon: HeartPulse }
      ]
    },
    {
      id: 'ability',
      title: '能力资质',
      items: []
    }
  ])

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleItemClick = (item: MaterialItem) => {
    if (item.uploaded) {
      // 查看已上传的资料
      Taro.showToast({ title: '查看' + item.name, icon: 'none' })
    } else {
      // 添加资料
      Taro.showToast({ title: '添加' + item.name, icon: 'none' })
    }
  }

  const handleShieldClick = () => {
    Taro.showToast({ title: '数据安全保护中', icon: 'none' })
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <View className="w-10 h-10 flex items-center justify-center" onClick={handleBack}>
          <ChevronLeft size={24} color="#374151" />
        </View>
        <View className="flex-1 text-center">
          <Text className="block text-lg font-semibold text-gray-900">我的资料</Text>
        </View>
        <View className="w-10 h-10 flex items-center justify-center" onClick={handleShieldClick}>
          <View className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Shield size={18} color="#9ca3af" />
          </View>
        </View>
      </View>

      {/* 副标题 */}
      <View className="bg-white px-4 pb-4">
        <Text className="text-sm text-gray-500">
          上传和更新各个维度的信息，助力展示个人可信形象
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-6">
        {categories.map((category) => (
          <View key={category.id} className="mb-5">
            {/* 分类标题 */}
            <Text className="block text-base font-semibold text-gray-900 mb-3">
              {category.title}
            </Text>

            {/* 资料项列表 */}
            {category.items.length > 0 ? (
              <View className="space-y-3">
                {category.items.map((item) => (
                  <View
                    key={item.id}
                    className={`rounded-xl p-4 ${
                      item.uploaded 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'bg-gray-100'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <View className="flex items-center justify-between">
                      <View className="flex items-center gap-3 flex-1">
                        {/* 图标 */}
                        <View 
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.uploaded ? 'bg-blue-100' : 'bg-white'}`}
                        >
                          <item.icon size={24} color={item.uploaded ? '#3b82f6' : '#9ca3af'} />
                        </View>

                        {/* 名称和描述 */}
                        <View className="flex-1">
                          <Text className="block text-base font-medium text-gray-900">
                            {item.name}
                          </Text>
                          {item.desc && (
                            <Text className="block text-xs text-gray-400 mt-0.5">
                              {item.desc}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* 状态和操作 */}
                      {item.uploaded ? (
                        <View className="flex items-center gap-2">
                          <View className="bg-blue-500 px-2 py-1 rounded">
                            <Text className="text-xs text-white">已上传</Text>
                          </View>
                          <ChevronRight size={18} color="#3b82f6" />
                        </View>
                      ) : (
                        <View className="flex items-center gap-1 bg-blue-500 px-3 py-1.5 rounded-full">
                          <Plus size={14} color="#ffffff" />
                          <Text className="text-xs text-white">添加</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-100 rounded-xl p-6">
                <View className="flex flex-col items-center justify-center">
                  <Award size={32} color="#d1d5db" />
                  <Text className="text-sm text-gray-400 mt-2">暂无能力资质</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* 底部提示 */}
        <View className="mt-4 p-4 bg-blue-50 rounded-xl">
          <View className="flex items-start gap-2">
            <Shield size={18} color="#3b82f6" className="mt-0.5" />
            <View>
              <Text className="text-sm font-medium text-blue-700">数据安全保障</Text>
              <Text className="text-xs text-blue-600 mt-1">
                您上传的所有资料均经过加密存储，仅用于生成信用报告，未经授权不会向第三方披露。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default WorkHistoryPage
