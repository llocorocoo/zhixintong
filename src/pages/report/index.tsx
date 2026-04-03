import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileText, Download, Share, CircleCheck, CircleAlert, Clock, RefreshCw, Eye, FileSearch, ArrowRight, RotateCcw } from 'lucide-react-taro'

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
      const res = await Network.request({
        url: '/api/report/latest',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      if (res.data.code === 200 && res.data.data) {
        setReportData(res.data.data)
      }
    } catch (error) {
      console.error('获取报告失败:', error)
    }
  }, [userInfo?.id])

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchLatestReport()
  }, [isLoggedIn, fetchLatestReport])

  // 每次页面显示时重新获取报告（tabBar切换回来时触发）
  useDidShow(() => {
    if (isLoggedIn) {
      fetchLatestReport()
    }
  })

  const handleCreateReport = () => {
    Taro.navigateTo({ url: '/pages/payment/index?price=50&type=create' })
  }

  const handleUpdateReport = () => {
    // 更新报告需支付9.9元
    Taro.navigateTo({ url: '/pages/payment/index?price=9.9&type=update' })
  }

  const handleDownload = async () => {
    if (!reportData?.reportUrl) {
      Taro.showToast({ title: '报告尚未生成', icon: 'none' })
      return
    }

    Taro.showLoading({ title: '下载中...' })
    try {
      const res = await Network.downloadFile({
        url: reportData.reportUrl
      })
      Taro.hideLoading()
      await Taro.saveFile({
        tempFilePath: res.tempFilePath
      })
      Taro.showToast({ title: '保存成功', icon: 'success' })
    } catch {
      Taro.hideLoading()
      Taro.showToast({ title: '下载失败', icon: 'none' })
    }
  }

  const handleShare = () => {
    if (!reportData?.reportUrl) {
      Taro.showToast({ title: '报告尚未生成', icon: 'none' })
      return
    }

    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  const handlePreview = () => {
    if (!reportData?.reportUrl) {
      Taro.showToast({ title: '报告尚未生成', icon: 'none' })
      return
    }

    Taro.openDocument({
      filePath: reportData.reportUrl,
      fileType: 'pdf',
      fail: () => {
        Taro.showToast({ title: '预览失败', icon: 'none' })
      }
    })
  }

  const handleSyncToResume = async () => {
    if (!userInfo?.id) return

    setSyncing(true)
    try {
      const res = await Network.request({
        url: '/api/resume/sync',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      if (res.data.code === 200) {
        Taro.showToast({ title: '同步成功', icon: 'success' })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/resume/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.message || '同步失败', icon: 'none' })
      }
    } catch (error) {
      console.error('同步失败:', error)
      Taro.showToast({ title: '同步失败', icon: 'none' })
    } finally {
      setSyncing(false)
    }
  }

  const handleViewSample = () => {
    Taro.navigateTo({ url: '/pages/sample-report/index' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Text className="text-white">已完成</Text></Badge>
      case 'processing':
        return <Badge className="bg-blue-500"><Text className="text-white">核查中</Text></Badge>
      case 'failed':
        return <Badge className="bg-red-500"><Text className="text-white">失败</Text></Badge>
      default:
        return <Badge variant="secondary"><Text>待提交</Text></Badge>
    }
  }

  const getProgressPercent = (status: string) => {
    const progressMap: Record<string, number> = {
      pending: 0,
      processing: 50,
      completed: 100,
      failed: 0
    }
    return progressMap[status] || 0
  }

  const verificationSteps = [
    { id: 'identity', title: '身份信息', status: reportData?.identityInfo ? 'completed' : 'pending' },
    { id: 'education', title: '学历信息', status: reportData?.educationInfo ? 'completed' : 'pending' },
    { id: 'qualification', title: '职业资格', status: reportData?.qualificationInfo ? 'completed' : 'pending' }
  ]

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* 暂无信用报告提示 */}
      {!reportData && (
        <Card className="mb-4 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
          <CardContent className="p-5">
            <View className="flex items-start gap-4">
              <View className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSearch size={28} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="block text-lg font-bold text-gray-900 mb-2">暂无信用报告</Text>
                <Text className="block text-sm text-gray-600 mb-4 leading-relaxed">
                  您尚未生成职业信用报告。生成报告后，您将获得完整的职业信用评估，可用于求职、背调等场景。
                </Text>
                <Button
                  className="bg-blue-600 w-full"
                  onClick={handleCreateReport}
                >
                  <FileText size={18} color="#ffffff" />
                  <Text className="text-white ml-2">立即生成信用报告</Text>
                  <Text className="text-yellow-300 ml-1 text-sm font-bold">¥50</Text>
                  <ArrowRight size={18} color="#ffffff" className="ml-1" />
                </Button>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 报告状态卡片 */}
      <Card className="mb-4">
        <CardHeader>
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-2">
              <FileText size={20} color="#3b82f6" />
              <CardTitle>职业信用报告</CardTitle>
            </View>
            {reportData && getStatusBadge(reportData.status)}
          </View>
          {reportData && (
            <CardDescription>报告编号：{reportData.reportNo}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!reportData ? (
            <View>
              <View className="mb-4">
                <Text className="block text-sm font-medium text-gray-900 mb-2">什么是职业信用报告？</Text>
                <Text className="block text-sm text-gray-600 leading-relaxed">
                  职业信用报告是记录您个人职业信用信息的权威文件，包含身份认证、学历信息、职业资格、工作履历等多维度数据，是您职场信用的「通行证」。
                </Text>
              </View>

              <View className="mb-4">
                <Text className="block text-sm font-medium text-gray-900 mb-2">报告用途</Text>
                <View className="space-y-2">
                  <View className="flex items-center gap-2">
                    <CircleCheck size={16} color="#10b981" />
                    <Text className="text-sm text-gray-600">求职应聘，展示个人信用</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <CircleCheck size={16} color="#10b981" />
                    <Text className="text-sm text-gray-600">背景调查，快速通过核验</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <CircleCheck size={16} color="#10b981" />
                    <Text className="text-sm text-gray-600">职业发展，建立信用档案</Text>
                  </View>
                </View>
              </View>

            </View>
          ) : reportData.status === 'processing' ? (
            <View>
              <View className="mb-4">
                <View className="flex items-center justify-between mb-2">
                  <Text className="text-sm text-gray-500">核查进度</Text>
                  <Text className="text-sm font-medium text-blue-600">核查中...</Text>
                </View>
                <Progress value={getProgressPercent(reportData.status)} />
              </View>

              <View className="space-y-3">
                {verificationSteps.map((step) => (
                  <View key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {step.status === 'completed' ? (
                      <CircleCheck size={20} color="#10b981" />
                    ) : (
                      <Clock size={20} color="#f59e0b" />
                    )}
                    <Text className="text-sm text-gray-700">{step.title}</Text>
                  </View>
                ))}
              </View>

              <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-sm text-blue-700">
                  预计 1-3 个工作日完成核查，届时将通知您查看报告。
                </Text>
              </View>
            </View>
          ) : reportData.status === 'completed' ? (
            <View>
              <View className="mb-4 p-4 bg-green-50 rounded-lg">
                <View className="flex items-center gap-2 mb-2">
                  <CircleCheck size={20} color="#10b981" />
                  <Text className="font-medium text-green-700">报告已生成</Text>
                </View>
                <Text className="text-sm text-green-600">
                  您的职业信用报告已生成完成，可预览、下载或分享。
                </Text>
              </View>

              <View className="space-y-3">
                {/* 预览报告按钮 */}
                <Button className="w-full bg-blue-600" onClick={handlePreview}>
                  <FileText size={18} color="#ffffff" />
                  <Text className="text-white ml-2">预览报告</Text>
                </Button>

                {/* 下载和分享按钮放在同一行 */}
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <Button className="w-full" variant="outline" onClick={handleDownload}>
                      <Download size={16} color="#3b82f6" />
                      <Text className="text-blue-600 ml-1 text-sm">下载</Text>
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button className="w-full" variant="outline" onClick={handleShare}>
                      <Share size={16} color="#3b82f6" />
                      <Text className="text-blue-600 ml-1 text-sm">分享</Text>
                    </Button>
                  </View>
                </View>

                {/* 更新信用报告按钮 - 需付费9.9元 */}
                <Button
                  className="w-full bg-orange-500"
                  onClick={handleUpdateReport}
                >
                  <RotateCcw size={18} color="#ffffff" />
                  <Text className="text-white ml-2">更新信用报告</Text>
                  <Text className="text-yellow-200 ml-1 text-sm font-bold">¥9.9</Text>
                </Button>

                {/* 更新可信简历按钮 - 免费 */}
                <Button
                  className="w-full bg-green-600"
                  onClick={handleSyncToResume}
                  disabled={syncing}
                >
                  <RefreshCw size={18} color="#ffffff" className={syncing ? 'animate-spin' : ''} />
                  <Text className="text-white ml-2">{syncing ? '同步中...' : '更新可信简历'}</Text>
                  <Text className="text-green-200 ml-1 text-xs">免费</Text>
                </Button>
              </View>
            </View>
          ) : (
            <View className="text-center py-6">
              <View className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <CircleAlert size={32} color="#ef4444" />
              </View>
              <Text className="block text-base font-medium text-gray-900 mb-2">报告生成失败</Text>
              <Text className="block text-sm text-gray-500 mb-4">
                请重新提交信息或联系客服
              </Text>
              <Button className="bg-blue-600" onClick={handleCreateReport}>
                <Text className="text-white">重新生成</Text>
                <Text className="text-yellow-300 ml-1 text-sm font-bold">¥50</Text>
              </Button>
            </View>
          )}
        </CardContent>
      </Card>

      {/* 样例报告按钮 */}
      <Card>
        <CardContent className="p-4">
          <Button
            className="w-full bg-blue-600"
            onClick={handleViewSample}
          >
            <Eye size={18} color="#ffffff" />
            <Text className="text-white ml-2">查看样例报告</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  )
}

export default ReportPage
