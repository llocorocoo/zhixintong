import { View, Text, ScrollView } from '@tarojs/components'
import { FC } from 'react'
import { CircleCheck } from 'lucide-react-taro'

const SampleReportPage: FC = () => {
  return (
    <View className="min-h-screen bg-gray-100">

      <ScrollView className="flex-1 px-4 py-4 pb-8">
        {/* 个人基础信息卡片 */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <View className="flex items-center gap-3">
            {/* 头像 */}
            <View className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-blue-50">
              <Text className="text-xl text-blue-600 font-medium">王</Text>
            </View>
            
            {/* 用户信息 */}
            <View className="flex-1">
              <View className="flex flex-wrap items-center gap-1 mb-1">
                <Text className="text-base text-gray-900">小王</Text>
                <Text className="text-gray-300 mx-1">|</Text>
                <Text className="text-sm text-gray-700">26岁</Text>
                <Text className="text-gray-300 mx-1">|</Text>
                <Text className="text-sm text-gray-700">13333333333</Text>
                <Text className="text-gray-300 mx-1">|</Text>
                <Text className="text-sm text-gray-700">1234@123.com</Text>
              </View>
              <Text className="text-xs text-gray-400">报告编号：xxxxxxxx</Text>
            </View>
          </View>
        </View>

        {/* 身份认证 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="flex items-center justify-between px-4 py-3">
            <Text className="text-base font-bold text-gray-900">身份认证</Text>
            <View className="bg-blue-500 rounded-full px-3 py-1">
              <Text className="text-xs text-white">已认证</Text>
            </View>
          </View>
          <View className="px-4 pb-4">
            <View className="flex flex-wrap gap-x-6 gap-y-2">
              <View className="flex items-center">
                <Text className="text-sm text-gray-600">姓名: </Text>
                <Text className="text-sm text-gray-700">小王</Text>
              </View>
              <View className="flex items-center">
                <Text className="text-sm text-gray-600">性别: </Text>
                <Text className="text-sm text-gray-700">男</Text>
              </View>
              <View className="flex items-center">
                <Text className="text-sm text-gray-600">年龄: </Text>
                <Text className="text-sm text-gray-700">26</Text>
              </View>
              <View className="flex items-center">
                <Text className="text-sm text-gray-600">出生日期: </Text>
                <Text className="text-sm text-gray-700">2000.1.1</Text>
              </View>
            </View>
            <View className="flex items-center mt-2">
              <Text className="text-sm text-gray-600">证件号码: </Text>
              <Text className="text-sm text-gray-700">110101xxxxxxxxxxxx</Text>
            </View>
            <View className="flex items-center mt-2">
              <Text className="text-sm text-gray-600">初始发证地: </Text>
              <Text className="text-sm text-gray-700">北京市东城区</Text>
            </View>
          </View>
        </View>

        {/* 学历信息 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="px-4 py-3">
            <Text className="text-base font-bold text-gray-900">学历信息</Text>
          </View>
          
          {/* 硕士学历 */}
          <View className="bg-gray-50 mx-4 mb-2 rounded-lg p-3 flex items-center justify-between">
            <View className="flex-1">
              <View className="flex items-center gap-3">
                <Text className="text-sm text-gray-900">中国xx大学</Text>
                <Text className="text-sm text-gray-500">计算机科学与技术</Text>
                <Text className="text-sm text-gray-900">硕士</Text>
              </View>
            </View>
            <View className="bg-gray-300 rounded-full px-3 py-1">
              <Text className="text-xs text-white">待认证</Text>
            </View>
          </View>

          {/* 本科学历 */}
          <View className="bg-gray-50 mx-4 mb-4 rounded-lg p-3 flex items-center justify-between">
            <View className="flex-1">
              <View className="flex items-center gap-3">
                <Text className="text-sm text-gray-900">中国xx大学</Text>
                <Text className="text-sm text-gray-500">计算机科学与技术</Text>
                <Text className="text-sm text-gray-900">本科</Text>
              </View>
            </View>
            <View className="bg-blue-500 rounded-full px-3 py-1">
              <Text className="text-xs text-white">已认证</Text>
            </View>
          </View>
        </View>

        {/* 职业资格 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="px-4 py-3">
            <Text className="text-base font-bold text-gray-900">职业资格</Text>
          </View>
          
          <View className="flex flex-row gap-3 px-4 pb-4">
            {/* 教师资格证 */}
            <View className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center">
              <View className="bg-blue-500 rounded-full px-2 py-0.5 mb-2">
                <Text className="text-xs text-white">已认证</Text>
              </View>
              <Text className="text-sm text-gray-700">教师资格证</Text>
            </View>

            {/* 法律职业资格证 */}
            <View className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center">
              <View className="bg-blue-500 rounded-full px-2 py-0.5 mb-2">
                <Text className="text-xs text-white">已认证</Text>
              </View>
              <Text className="text-sm text-gray-700">法律职业资格证</Text>
            </View>
          </View>
        </View>

        {/* 诉讼记录 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="flex items-center justify-between px-4 py-3">
            <Text className="text-base font-bold text-gray-900">诉讼记录</Text>
            <View className="flex items-center gap-1">
              <CircleCheck size={14} color="#3b82f6" />
              <Text className="text-xs text-blue-500">已核查</Text>
            </View>
          </View>

          {/* 诉讼记录详情 */}
          <View className="px-4 pb-4 space-y-3">
            <View className="bg-gray-50 rounded-lg p-3">
              <View className="flex items-center justify-between mb-2">
                <Text className="text-sm font-medium text-gray-900">民事纠纷 — 合同纠纷</Text>
                <View className="bg-orange-100 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-orange-600">已结案</Text>
                </View>
              </View>
              <View className="space-y-1.5">
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">案号</Text>
                  <Text className="text-xs text-gray-700">（2023）京0105民初12856号</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">审理法院</Text>
                  <Text className="text-xs text-gray-700">北京市朝阳区人民法院</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">立案日期</Text>
                  <Text className="text-xs text-gray-700">2023-06-15</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">结案日期</Text>
                  <Text className="text-xs text-gray-700">2023-11-20</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">当事人身份</Text>
                  <Text className="text-xs text-gray-700">原告</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">案由</Text>
                  <Text className="text-xs text-gray-700">因房屋租赁合同提前解除，主张退还押金及赔偿违约金</Text>
                </View>
                <View className="flex items-start">
                  <Text className="text-xs text-gray-500 w-16 flex-shrink-0">判决结果</Text>
                  <Text className="text-xs text-gray-700">调解结案，被告退还押金8,000元</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 投资任职 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="flex items-center justify-between px-4 py-3">
            <Text className="text-base font-bold text-gray-900">投资任职</Text>
            <View className="flex items-center gap-1">
              <CircleCheck size={14} color="#3b82f6" />
              <Text className="text-xs text-blue-500">已核查</Text>
            </View>
          </View>
        </View>

        {/* 金融信用 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="flex items-center justify-between px-4 py-3">
            <Text className="text-base font-bold text-gray-900">金融信用</Text>
            <View className="flex items-center gap-1">
              <CircleCheck size={14} color="#3b82f6" />
              <Text className="text-xs text-blue-500">已核查</Text>
            </View>
          </View>
        </View>

        {/* 黑名单 */}
        <View className="bg-white rounded-lg mb-3">
          <View className="flex items-center justify-between px-4 py-3">
            <Text className="text-base font-bold text-gray-900">黑名单</Text>
            <View className="flex items-center gap-1">
              <CircleCheck size={14} color="#3b82f6" />
              <Text className="text-xs text-blue-500">已核查</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default SampleReportPage
