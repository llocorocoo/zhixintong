import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { FileText, Download, Share, CircleCheck, CircleAlert, Clock } from 'lucide-react-taro'

interface ReportStep {
  id: string
  title: string
  status: 'pending' | 'processing' | 'completed' | 'skipped'
  data?: any
}

const ReportPage: FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [steps, setSteps] = useState<ReportStep[]>([
    { id: 'identity', title: '身份学历', status: 'pending' },
    { id: 'qualification', title: '职业资格', status: 'pending' },
    { id: 'litigation', title: '诉讼记录', status: 'pending' },
    { id: 'investment', title: '投资任职', status: 'pending' },
    { id: 'financial', title: '金融信用', status: 'pending' },
    { id: 'blacklist', title: '黑名单', status: 'pending' }
  ])
  const { isLoggedIn } = useUserStore()

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])

  const handleAuthorize = () => {
    Taro.showModal({
      title: '授权确认',
      content: '授权平台查询您的职业信用信息？',
      success: (res) => {
        if (res.confirm) {
          setIsAuthorized(true)
          startReportGeneration()
        }
      }
    })
  }

  const startReportGeneration = async () => {
    const { userInfo } = useUserStore.getState()
    if (!userInfo?.id) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/report/create',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      console.log('创建报告响应:', res.data)

      if (res.data.code === 200 && res.data.data) {
        setReportId(res.data.data.reportId)
        setCurrentStep(1)
      }
    } catch (error) {
      console.error('创建报告失败:', error)
      Taro.showToast({ title: '创建失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleStepAction = async (stepId: string, skip: boolean = false) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: `/api/report/step/${stepId}`,
        method: 'POST',
        data: { skip, reportId }
      })

      console.log(`步骤 ${stepId} 响应:`, res.data)

      if (res.data.code === 200) {
        setSteps(prev => prev.map(s => 
          s.id === stepId ? { ...s, status: skip ? 'skipped' : 'completed', data: res.data.data } : s
        ))
        
        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1)
        }
      }
    } catch (error) {
      console.error(`步骤 ${stepId} 失败:`, error)
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CircleCheck size={20} color="#10b981" />
      case 'skipped': return <CircleAlert size={20} color="#f59e0b" />
      case 'processing': return <Clock size={20} color="#3b82f6" />
      default: return <View className="w-5 h-5 rounded-full bg-gray-300" />
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-20">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>职业信用报告</CardTitle>
          <CardDescription>生成您的职业信用档案报告</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthorized ? (
            <View className="text-center py-6">
              <View className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <FileText size={32} color="#1e40af" />
              </View>
              <Text className="block text-base font-medium text-gray-900 mb-2">开始生成报告</Text>
              <Text className="block text-sm text-gray-500 mb-4">
                授权平台查询您的职业信用信息，生成完整报告
              </Text>
              <Button className="bg-blue-800" onClick={handleAuthorize} disabled={loading}>
                <Text className="text-white">{loading ? '处理中...' : '授权并查询'}</Text>
              </Button>
            </View>
          ) : (
            <View>
              <View className="mb-4">
                <Text className="block text-sm text-gray-500 mb-2">
                  信息采集进度 ({steps.filter(s => s.status !== 'pending').length}/{steps.length})
                </Text>
                <Progress value={(steps.filter(s => s.status !== 'pending').length / steps.length) * 100} />
              </View>

              <View className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="p-4">
                      <View className="flex items-center justify-between">
                        <View className="flex items-center gap-3">
                          {getStepIcon(step.status)}
                          <Text className="text-base font-medium text-gray-900">{step.title}</Text>
                        </View>
                        {step.status === 'pending' && currentStep === index + 1 && (
                          <View className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStepAction(step.id, true)}
                              disabled={loading}
                            >
                              跳过
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-800"
                              onClick={() => handleStepAction(step.id, false)}
                              disabled={loading}
                            >
                              查询
                            </Button>
                          </View>
                        )}
                        {step.status !== 'pending' && (
                          <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                            {step.status === 'completed' ? '已完成' : '已跳过'}
                          </Badge>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>

              {steps.every(s => s.status !== 'pending') && (
                <View className="mt-6 space-y-3">
                  <Button className="w-full bg-blue-800" onClick={() => {}}>
                    <Download size={18} color="#ffffff" />
                    <Text className="text-white ml-2">下载报告</Text>
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => {}}>
                    <Share size={18} color="#1e40af" />
                    <Text className="text-blue-800 ml-2">分享报告</Text>
                  </Button>
                </View>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>样例报告</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="block text-sm text-gray-500">
              查看职业信用报告样例，了解报告内容和格式
            </Text>
            <Button className="mt-3" variant="outline" size="sm" onClick={() => {}}>
              <Text>查看样例</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}

export default ReportPage
