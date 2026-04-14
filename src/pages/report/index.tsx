import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileText, Download, Share, CircleCheck, CircleAlert, Clock, RefreshCw, Eye, FileSearch, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react-taro'

interface ReportData {
  id: string
  reportNo: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reportUrl?: string
  identityInfo?: any
  educationInfo?: any
  qualificationInfo?: any
  createdAt: string
}

const ReportPage: FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [syncing, setSyncing] = useState(false)
  const { isLoggedIn, userInfo } = useUserStore()

  const fetchLatestReport = useCallback(async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({ url: '/api/report/latest', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200 && res.data.data) setReportData(res.data.data)
    } catch {}
  }, [userInfo?.id])

  useEffect(() => {
    if (!isLoggedIn) { Taro.redirectTo({ url: '/pages/login/index' }); return }
    fetchLatestReport()
  }, [isLoggedIn, fetchLatestReport])

  useDidShow(() => { if (isLoggedIn) fetchLatestReport() })

  const handleCreateReport = () => Taro.navigateTo({ url: '/pages/payment/index?price=50&type=create' })
  const handleUpdateReport = () => Taro.navigateTo({ url: '/pages/payment/index?price=9.9&type=update' })

  const handleDownload = async () => {
    if (!reportData?.reportUrl) return
    Taro.showLoading({ title: '下载中...' })
    try {
      const res = await Network.downloadFile({ url: reportData.reportUrl })
      Taro.hideLoading()
      await Taro.saveFile({ tempFilePath: res.tempFilePath })
      Taro.showToast({ title: '保存成功', icon: 'success' })
    } catch { Taro.hideLoading(); Taro.showToast({ title: '下载失败', icon: 'none' }) }
  }

  const handleShare = () => { if (reportData?.reportUrl) Taro.showShareMenu({ withShareTicket: true }) }

  const handlePreview = () => {
    if (!reportData?.reportUrl) return
    Taro.openDocument({ filePath: reportData.reportUrl, fileType: 'pdf', fail: () => Taro.showToast({ title: '预览失败', icon: 'none' }) })
  }

  const handleSyncToResume = async () => {
    if (!userInfo?.id) return
    setSyncing(true)
    try {
      const res = await Network.request({ url: '/api/resume/sync', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200) {
        Taro.showToast({ title: '同步成功', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/resume/index' }), 1000)
      }
    } catch {} finally { setSyncing(false) }
  }

  const verificationSteps = [
    { id: 'identity', title: '身份信息核实', status: reportData?.identityInfo ? 'completed' : 'pending' },
    { id: 'education', title: '学历信息核实', status: reportData?.educationInfo ? 'completed' : 'pending' },
    { id: 'qualification', title: '职业资格核实', status: reportData?.qualificationInfo ? 'completed' : 'pending' },
  ]

  return (
    <View className="min-h-screen" style={{ background: '#f0f4f8' }}>

      {/* 顶部渐变头 */}
      <View style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', paddingTop: '48px', paddingBottom: '72px', paddingLeft: '16px', paddingRight: '16px' }}>
        <Text className="block text-white text-xl font-bold mb-1">职业信用报告</Text>
        <Text className="block text-blue-200 text-sm">记录您的职业信用，成为职场通行证</Text>
      </View>

      <View className="px-4 -mt-10 pb-8 space-y-4">

        {/* ── 空状态 ── */}
        {!reportData && (
          <View className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <View className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <View className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <FileSearch size={36} color="#3b82f6" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">暂无信用报告</Text>
              <Text className="text-sm text-gray-500 leading-relaxed mb-6">
                生成职业信用报告后，您将获得完整的职业信用评估，可用于求职、背调等场景。
              </Text>
              <View className="w-full space-y-2">
                {[
                  { text: '求职应聘，展示个人信用' },
                  { text: '背景调查，快速通过核验' },
                  { text: '职业发展，建立信用档案' },
                ].map((item, i) => (
                  <View key={i} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                    <CircleCheck size={16} color="#10b981" />
                    <Text className="text-sm text-gray-600">{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className="px-6 pb-6">
              <View
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
                onClick={handleCreateReport}
              >
                <FileText size={18} color="#ffffff" />
                <Text className="text-white font-semibold">立即生成信用报告</Text>
                <View className="bg-white bg-opacity-20 rounded-full px-2 py-0.5 ml-1">
                  <Text className="text-yellow-200 text-xs font-bold">¥50</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── 报告状态卡片 ── */}
        {reportData && (
          <View className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* 报告头部信息 */}
            <View className="px-5 pt-5 pb-4 border-b border-gray-50">
              <View className="flex items-center justify-between mb-1">
                <View className="flex items-center gap-2">
                  <FileText size={18} color="#3b82f6" />
                  <Text className="text-base font-bold text-gray-900">职业信用报告</Text>
                </View>
                {/* 状态标签 */}
                <View className={`px-3 py-1 rounded-full ${
                  reportData.status === 'completed' ? 'bg-green-50' :
                  reportData.status === 'processing' ? 'bg-blue-50' : 'bg-red-50'
                }`}>
                  <Text className={`text-xs font-medium ${
                    reportData.status === 'completed' ? 'text-green-600' :
                    reportData.status === 'processing' ? 'text-blue-600' : 'text-red-500'
                  }`}>
                    {reportData.status === 'completed' ? '已完成' :
                     reportData.status === 'processing' ? '核查中' : '生成失败'}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400">报告编号：{reportData.reportNo}</Text>
            </View>

            {/* 核查中状态 */}
            {reportData.status === 'processing' && (
              <View className="px-5 py-5">
                <View className="flex items-center justify-between mb-3">
                  <Text className="text-sm text-gray-500">核查进度</Text>
                  <Text className="text-sm font-medium text-blue-600">核查中...</Text>
                </View>
                {/* 进度条 */}
                <View className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
                  <View className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }} />
                </View>
                <View className="space-y-3">
                  {verificationSteps.map((step) => (
                    <View key={step.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                      {step.status === 'completed'
                        ? <CircleCheck size={20} color="#10b981" />
                        : <Clock size={20} color="#f59e0b" />}
                      <Text className="text-sm text-gray-700">{step.title}</Text>
                    </View>
                  ))}
                </View>
                <View className="mt-4 bg-blue-50 rounded-2xl p-4">
                  <Text className="text-sm text-blue-600 leading-relaxed">预计 1-3 个工作日完成核查，届时将通知您查看报告。</Text>
                </View>
              </View>
            )}

            {/* 已完成状态 */}
            {reportData.status === 'completed' && (
              <View className="px-5 py-5">
                {/* 成功提示 */}
                <View className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-4 mb-5">
                  <CircleCheck size={22} color="#10b981" />
                  <View>
                    <Text className="block text-sm font-semibold text-green-700">报告已生成</Text>
                    <Text className="block text-xs text-green-600 mt-0.5">可预览、下载或分享您的信用报告</Text>
                  </View>
                </View>

                {/* 主操作：预览 */}
                <View
                  className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 mb-3 active:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
                  onClick={handlePreview}
                >
                  <Eye size={18} color="#ffffff" />
                  <Text className="text-white font-semibold">预览报告</Text>
                </View>

                {/* 次操作：下载 + 分享 */}
                <View className="flex gap-3 mb-3">
                  <View
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 rounded-2xl py-3 active:bg-gray-100"
                    onClick={handleDownload}
                  >
                    <Download size={16} color="#3b82f6" />
                    <Text className="text-sm font-medium text-blue-600">下载</Text>
                  </View>
                  <View
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 rounded-2xl py-3 active:bg-gray-100"
                    onClick={handleShare}
                  >
                    <Share size={16} color="#3b82f6" />
                    <Text className="text-sm font-medium text-blue-600">分享</Text>
                  </View>
                </View>

                {/* 更新报告 */}
                <View
                  className="flex items-center justify-between bg-orange-50 rounded-2xl px-4 py-3.5 mb-3 active:bg-orange-100"
                  onClick={handleUpdateReport}
                >
                  <View className="flex items-center gap-2">
                    <RotateCcw size={18} color="#f59e0b" />
                    <Text className="text-sm font-medium text-gray-800">更新信用报告</Text>
                  </View>
                  <View className="flex items-center gap-1.5">
                    <Text className="text-sm font-bold text-orange-500">¥9.9</Text>
                    <ChevronRight size={16} color="#f59e0b" />
                  </View>
                </View>

                {/* 同步简历 */}
                <View
                  className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3.5 active:bg-green-100"
                  onClick={handleSyncToResume}
                >
                  <View className="flex items-center gap-2">
                    <RefreshCw size={18} color="#10b981" />
                    <Text className="text-sm font-medium text-gray-800">{syncing ? '同步中...' : '更新可信简历'}</Text>
                  </View>
                  <View className="flex items-center gap-1.5">
                    <View className="bg-green-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs font-medium text-green-600">免费</Text>
                    </View>
                    <ChevronRight size={16} color="#10b981" />
                  </View>
                </View>
              </View>
            )}

            {/* 失败状态 */}
            {reportData.status === 'failed' && (
              <View className="px-5 py-8 flex flex-col items-center">
                <View className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <CircleAlert size={32} color="#ef4444" />
                </View>
                <Text className="text-base font-semibold text-gray-900 mb-2">报告生成失败</Text>
                <Text className="text-sm text-gray-500 mb-6 text-center">请重新提交信息或联系客服</Text>
                <View
                  className="rounded-2xl px-6 py-3 flex items-center gap-2 active:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
                  onClick={handleCreateReport}
                >
                  <Text className="text-white font-semibold">重新生成</Text>
                  <Text className="text-yellow-200 text-sm font-bold">¥50</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── 查看样例报告 ── */}
        <View
          className="bg-white rounded-2xl flex items-center px-5 py-4 active:opacity-90"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          onClick={() => Taro.navigateTo({ url: '/pages/sample-report/index' })}
        >
          <View className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
            <Eye size={20} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-semibold text-gray-900">查看样例报告</Text>
            <Text className="block text-xs text-gray-400 mt-0.5">了解报告包含哪些内容</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </View>
      </View>
    </View>
  )
}

export default ReportPage
