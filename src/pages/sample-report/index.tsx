import { View, Text, ScrollView } from '@tarojs/components'
import { FC } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, CircleCheck } from 'lucide-react-taro'

const SampleReportPage: FC = () => {
  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-3 flex items-center border-b border-gray-100">
        <View className="w-10 h-10 flex items-center justify-center" onClick={handleBack}>
          <ChevronLeft size={24} color="#333" />
        </View>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">职业信用报告</Text>
      </View>

      <ScrollView className="flex-1 p-4 pb-8">
        {/* 个人基础信息卡片 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-start gap-3">
              {/* 头像 */}
              <View className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Text className="text-xl text-blue-600 font-medium">王</Text>
              </View>
              
              {/* 用户信息 */}
              <View className="flex-1">
                <View className="flex flex-wrap items-center gap-1 mb-2">
                  <Text className="text-base font-medium text-gray-900">小王</Text>
                  <Text className="text-gray-400">|</Text>
                  <Text className="text-sm text-gray-600">26岁</Text>
                  <Text className="text-gray-400">|</Text>
                  <Text className="text-sm text-gray-600">133****3333</Text>
                  <Text className="text-gray-400">|</Text>
                  <Text className="text-sm text-gray-600">1234@123.com</Text>
                </View>
                <Text className="text-xs text-gray-500">报告编号：CRM202401150001</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 身份认证 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">身份认证</Text>
              <Badge className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">已认证</Text>
              </Badge>
            </View>
            
            <View className="space-y-2">
              <View className="flex flex-wrap gap-x-4 gap-y-1">
                <Text className="text-sm text-gray-600">姓名: 小王</Text>
                <Text className="text-sm text-gray-600">性别: 男</Text>
                <Text className="text-sm text-gray-600">年龄: 26</Text>
                <Text className="text-sm text-gray-600">出生日期: 2000.1.1</Text>
              </View>
              <Text className="text-sm text-gray-600">证件号码: 110101xxxxxxxxxxxx</Text>
              <Text className="text-sm text-gray-600">初始发证地: 北京市东城区</Text>
            </View>
          </CardContent>
        </Card>

        {/* 学历信息 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <Text className="block text-base font-semibold text-gray-900 mb-3">学历信息</Text>
            
            <View className="space-y-3">
              {/* 硕士学历 - 待认证 */}
              <View className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">中国xx大学</Text>
                  <View className="flex items-center gap-2 mt-1">
                    <Text className="text-xs text-gray-600">计算机科学与技术</Text>
                    <Text className="text-xs text-gray-500">|</Text>
                    <Text className="text-xs text-gray-600">硕士</Text>
                  </View>
                </View>
                <Button size="sm" variant="outline" className="rounded px-3 py-1 h-7 border-gray-300">
                  <Text className="text-xs text-gray-500">待认证</Text>
                </Button>
              </View>

              {/* 本科学历 - 已认证 */}
              <View className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">中国xx大学</Text>
                  <View className="flex items-center gap-2 mt-1">
                    <Text className="text-xs text-gray-600">计算机科学与技术</Text>
                    <Text className="text-xs text-gray-500">|</Text>
                    <Text className="text-xs text-gray-600">本科</Text>
                  </View>
                </View>
                <Button size="sm" className="rounded px-3 py-1 h-7 bg-blue-500">
                  <Text className="text-xs text-white">已认证</Text>
                </Button>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 职业资格 */}
        <Card className="mb-4 bg-white">
          <CardContent className="p-4">
            <Text className="block text-base font-semibold text-gray-900 mb-3">职业资格</Text>
            
            <View className="flex flex-wrap gap-3">
              <View className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <Text className="text-sm text-gray-700">教师资格证</Text>
                <Badge className="bg-blue-500 px-2 py-0.5 rounded text-xs">
                  <Text className="text-white">已认证</Text>
                </Badge>
              </View>
              <View className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <Text className="text-sm text-gray-700">法律职业资格证</Text>
                <Badge className="bg-blue-500 px-2 py-0.5 rounded text-xs">
                  <Text className="text-white">已认证</Text>
                </Badge>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 背景核查模块 */}
        {[
          { title: '诉讼记录', hasData: false },
          { title: '投资任职', hasData: false },
          { title: '金融信用', hasData: false },
          { title: '黑名单', hasData: false }
        ].map((item, index) => (
          <Card key={index} className="mb-4 bg-white">
            <CardContent className="p-4">
              <View className="flex items-center justify-between">
                <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                <View className="flex items-center gap-1">
                  <CircleCheck size={14} color="#3b82f6" />
                  <Text className="text-xs text-blue-500">已核查</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        ))}

        {/* 底部说明 */}
        <View className="mt-4 mb-6 px-2">
          <Text className="text-xs text-gray-400 text-center">
            本报告由职业信用平台提供，仅供参考
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default SampleReportPage
