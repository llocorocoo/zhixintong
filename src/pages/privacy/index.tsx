import { View, Text, Switch } from '@tarojs/components'
import { FC, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Database, Eye, Share2, FileText } from 'lucide-react-taro'

interface AuthItem {
  id: string
  icon: any
  title: string
  desc: string
  enabled: boolean
  required?: boolean
}

const PrivacyPage: FC = () => {
  const [items, setItems] = useState<AuthItem[]>([
    {
      id: 'identity',
      icon: Shield,
      title: '身份信息核查授权',
      desc: '授权平台通过公安接口核验您的身份信息',
      enabled: true,
      required: true,
    },
    {
      id: 'education',
      icon: FileText,
      title: '学历信息核查授权',
      desc: '授权平台通过学信网核验学历学位信息',
      enabled: true,
    },
    {
      id: 'credit',
      icon: Database,
      title: '征信查询授权',
      desc: '授权平台查询个人征信报告（用于可靠性评分）',
      enabled: false,
    },
    {
      id: 'judicial',
      icon: Eye,
      title: '司法数据查询授权',
      desc: '授权平台查询诉讼记录、失信名单等司法数据',
      enabled: true,
    },
    {
      id: 'share',
      icon: Share2,
      title: '报告共享授权',
      desc: '允许通过链接将您的信用报告分享给第三方查看',
      enabled: false,
    },
  ])

  const toggle = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id && !item.required
        ? { ...item, enabled: !item.enabled }
        : item
    ))
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-8">
      {/* 说明 */}
      <View className="mx-4 mt-4 mb-4 p-4 bg-blue-50 rounded-xl">
        <Text className="text-sm text-blue-700 leading-relaxed">
          以下授权仅用于生成您的职业信用报告，平台不会将您的数据用于其他商业目的。您可随时撤销非必要授权。
        </Text>
      </View>

      <Card className="mx-4 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">数据授权管理</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <View
                key={item.id}
                className={`flex items-center px-4 py-4 ${index < items.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                  <Icon size={18} color="#3b82f6" />
                </View>
                <View className="flex-1 min-w-0 mr-3">
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-900">{item.title}</Text>
                    {item.required && (
                      <View className="px-1.5 py-0.5 bg-gray-100 rounded">
                        <Text className="text-xs text-gray-500">必要</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</Text>
                </View>
                <Switch
                  checked={item.enabled}
                  color="#3b82f6"
                  disabled={item.required}
                  onChange={() => toggle(item.id)}
                />
              </View>
            )
          })}
        </CardContent>
      </Card>

      {/* 数据删除 */}
      <Card className="mx-4">
        <CardContent className="p-4">
          <Text className="block text-sm font-medium text-gray-900 mb-1">删除我的数据</Text>
          <Text className="block text-xs text-gray-500 mb-3 leading-relaxed">
            申请删除后，平台将在15个工作日内清除您的全部个人数据，该操作不可逆。
          </Text>
          <View className="py-2.5 px-4 border border-red-200 rounded-xl flex items-center justify-center active:bg-red-50">
            <Text className="text-sm text-red-500">申请删除所有数据</Text>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}

export default PrivacyPage
