import { View, Text, ScrollView, Checkbox } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, CircleAlert } from 'lucide-react-taro'

const AuthorizePage: FC = () => {
  const [countdown, setCountdown] = useState(10)
  const [canAgree, setCanAgree] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 10秒倒计时
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          setCanAgree(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleAgree = () => {
    if (!canAgree || !isChecked) return

    Taro.navigateTo({ url: '/pages/report-form/index' })
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '取消授权',
      content: '取消授权将无法生成职业信用报告，确定取消吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack()
        }
      }
    })
  }

  const agreementContent = `
《信息核查授权书》

尊敬的用户：

为保障您的职业信用报告真实、准确，我们需要对您提交的信息进行核查。请您仔细阅读以下内容：

一、授权范围
1. 授权平台查询并验证您的身份信息、学历学位信息、职业资格证书等。
2. 授权平台通过合法渠道获取您的信用信息，包括但不限于：
   - 身份学历信息
   - 职业资格信息
   - 诉讼记录信息
   - 投资任职信息
   - 金融信用信息
   - 黑名单信息

二、信息使用
1. 您授权的信息仅用于生成职业信用报告，不会用于其他商业用途。
2. 平台将严格保护您的个人信息安全，遵守相关法律法规。

三、您的权利
1. 您有权随时查看、更正自己的信息。
2. 您有权申请删除已授权的信息。
3. 您有权拒绝授权，但可能影响报告的完整性。

四、授权期限
本授权自您确认之日起生效，有效期为一年。到期后如需继续使用，需重新授权。

五、特别提示
1. 请确保您提供的信息真实、准确、完整。
2. 虚假信息将影响您的信用评分，并可能导致法律风险。
3. 如有疑问，请联系客服咨询。

请您阅读完毕后，勾选确认并点击"同意授权"按钮。
`

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 提示卡片 */}
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <View className="flex items-start gap-3">
            <CircleAlert size={20} color="#3b82f6" className="mt-0.5" />
            <View className="flex-1">
              <Text className="block text-base font-medium text-gray-900 mb-1">
                请仔细阅读授权书
              </Text>
              <Text className="block text-sm text-gray-600">
                需阅读满10秒后方可授权，请确保您已充分了解授权内容。
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 授权书内容 */}
      <Card className="mb-4">
        <CardHeader>
          <View className="flex items-center gap-2">
            <Shield size={20} color="#3b82f6" />
            <CardTitle>信息核查授权书</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <ScrollView
            className="bg-gray-50 rounded-lg p-4"
            style={{ height: '300px' }}
            scrollY
          >
            <Text className="block text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {agreementContent}
            </Text>
          </ScrollView>
        </CardContent>
      </Card>

      {/* 倒计时提示 */}
      {!canAgree && (
        <View className="text-center mb-4">
          <Text className="text-sm text-gray-500">
            请继续阅读，剩余 {countdown} 秒
          </Text>
        </View>
      )}

      {/* 勾选确认 */}
      <View className="flex items-start gap-3 mb-6 px-2">
        <Checkbox
          value="agree"
          checked={isChecked}
          color="#3b82f6"
          className="mt-0.5"
          onClick={() => setIsChecked(!isChecked)}
        />
        <Text
          className="text-sm text-gray-600 leading-relaxed"
          onClick={() => canAgree && setIsChecked(!isChecked)}
        >
          我已仔细阅读并同意《信息核查授权书》的全部内容，授权平台查询我的相关信息。
        </Text>
      </View>

      {/* 按钮组 */}
      <View className="space-y-3">
        <Button
          className={`w-full ${canAgree && isChecked ? 'bg-blue-600' : 'bg-gray-300'}`}
          disabled={!canAgree || !isChecked}
          onClick={handleAgree}
        >
          <Text className="text-white font-medium">
            {canAgree ? '同意授权' : `请阅读 (${countdown}s)`}
          </Text>
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleCancel}
        >
          <Text className="text-gray-600">取消</Text>
        </Button>
      </View>
    </View>
  )
}

export default AuthorizePage
