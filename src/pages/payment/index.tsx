import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { Shield, CreditCard, Smartphone, Landmark, CircleCheck, Circle } from 'lucide-react-taro'

const PaymentPage: FC = () => {
  const [payMethod, setPayMethod] = useState('wechat')
  const [paying, setPaying] = useState(false)
  const { userInfo } = useUserStore()

  const params = Taro.getCurrentInstance().router?.params || {}
  const price = params.price || '50'
  const type = params.type || 'create'

  const payMethods = [
    { id: 'wechat', name: '微信支付', icon: Smartphone, color: '#07c160' },
    { id: 'alipay', name: '支付宝', icon: Smartphone, color: '#1677ff' },
    { id: 'bank', name: '银行卡支付', icon: Landmark, color: '#f59e0b' },
  ]

  const handlePay = async () => {
    setPaying(true)
    try {
      Taro.showLoading({ title: '支付处理中...' })
      await new Promise(resolve => setTimeout(resolve, 1500))
      Taro.hideLoading()

      Taro.showToast({ title: '支付成功', icon: 'success' })

      setTimeout(() => {
        if (type === 'update') {
          Taro.navigateBack()
        } else {
          Taro.redirectTo({ url: '/pages/authorize/index' })
        }
      }, 1000)
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      <Card className="mb-4">
        <CardHeader>
          <View className="flex items-center gap-2">
            <Shield size={20} color="#3b82f6" />
            <CardTitle>{type === 'update' ? '更新信用报告' : '生成信用报告'}</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-600">商品</Text>
            <Text className="text-sm text-gray-900 font-medium">
              {type === 'update' ? '信用报告更新服务' : '职业信用报告生成服务'}
            </Text>
          </View>
          <View className="flex items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-600">用户</Text>
            <Text className="text-sm text-gray-900">{userInfo?.name || userInfo?.phone}</Text>
          </View>
          <View className="flex items-center justify-between py-3">
            <Text className="text-sm text-gray-600">应付金额</Text>
            <Text className="text-2xl font-bold text-red-500">¥{price}</Text>
          </View>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <View className="flex items-center gap-2">
            <CreditCard size={20} color="#3b82f6" />
            <CardTitle>选择支付方式</CardTitle>
          </View>
        </CardHeader>
        <CardContent className="p-0">
          {payMethods.map((method) => (
            <View
              key={method.id}
              className={`flex items-center p-4 border-b border-gray-100 last:border-0 ${payMethod === method.id ? 'bg-blue-50' : ''}`}
              onClick={() => setPayMethod(method.id)}
            >
              <View
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${method.color}15` }}
              >
                <method.icon size={22} color={method.color} />
              </View>
              <Text className="flex-1 text-base text-gray-900">{method.name}</Text>
              {payMethod === method.id ? (
                <CircleCheck size={22} color="#3b82f6" />
              ) : (
                <Circle size={22} color="#d1d5db" />
              )}
            </View>
          ))}
        </CardContent>
      </Card>

      <Button
        className="w-full bg-blue-600 py-4"
        onClick={handlePay}
        disabled={paying}
      >
        <Text className="text-white text-base font-medium">
          {paying ? '处理中...' : `确认支付 ¥${price}`}
        </Text>
      </Button>

      <View className="mt-4 text-center">
        <Text className="text-xs text-gray-400">支付即表示您同意《服务协议》和《隐私政策》</Text>
      </View>
    </View>
  )
}

export default PaymentPage
