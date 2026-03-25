import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { User, GraduationCap, Award, Upload, ChevronRight, CircleCheck, CircleAlert } from 'lucide-react-taro'

interface FormData {
  // 身份信息
  realName: string
  idCard: string
  // 学历信息
  education: string
  school: string
  major: string
  degreeCertNo: string
  diplomaCertNo: string
  educationFiles: string[]
  // 职业资格
  qualification: string
  certNumber: string
  issueDate: string
  qualificationFiles: string[]
}

const educationOptions = ['高中', '大专', '本科', '硕士', '博士']

const ReportFormPage: FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    realName: '',
    idCard: '',
    education: '本科',
    school: '',
    major: '',
    degreeCertNo: '',
    diplomaCertNo: '',
    educationFiles: [],
    qualification: '',
    certNumber: '',
    issueDate: '',
    qualificationFiles: []
  })
  const { userInfo } = useUserStore()

  const steps = [
    { title: '身份信息', icon: User, required: true },
    { title: '学历信息', icon: GraduationCap, required: false },
    { title: '职业资格', icon: Award, required: false }
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUploadFile = async (field: 'educationFiles' | 'qualificationFiles') => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      Taro.showLoading({ title: '上传中...' })

      const uploadRes = await Network.uploadFile({
        url: '/api/upload',
        filePath: res.tempFilePaths[0],
        name: 'file'
      })

      console.log('上传响应:', uploadRes.data)

      // Taro.uploadFile 返回的 data 是 string，需要解析
      const response = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data

      if (response.code === 200 && response.data) {
        const fileUrl = response.data.url
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], fileUrl]
        }))
        Taro.showToast({ title: '上传成功', icon: 'success' })
      } else {
        Taro.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleRemoveFile = (field: 'educationFiles' | 'qualificationFiles', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    // 验证必填字段
    if (currentStep === 0) {
      if (!formData.realName || !formData.idCard) {
        Taro.showToast({ title: '请填写完整身份信息', icon: 'none' })
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handleSkip = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/report/submit',
        method: 'POST',
        data: {
          userId: userInfo?.id,
          ...formData
        }
      })

      console.log('提交响应:', res.data)

      if (res.data.code === 200) {
        Taro.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/report/index?status=processing' })
        }, 1500)
      } else {
        Taro.showToast({ title: res.data.message || '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const renderIdentityForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">真实姓名 *</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入真实姓名"
            value={formData.realName}
            onInput={(e) => handleInputChange('realName', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">身份证号 *</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入身份证号"
            maxlength={18}
            value={formData.idCard}
            onInput={(e) => handleInputChange('idCard', e.detail.value)}
          />
        </View>
      </View>
    </View>
  )

  const renderEducationForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">最高学历</Text>
        <Picker
          mode="selector"
          range={educationOptions}
          value={educationOptions.indexOf(formData.education)}
          onChange={(e) => handleInputChange('education', educationOptions[e.detail.value])}
        >
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <Text className={formData.education ? 'text-gray-900' : 'text-gray-400'}>
              {formData.education || '请选择学历'}
            </Text>
            <ChevronRight size={18} color="#9ca3af" />
          </View>
        </Picker>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">毕业院校</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入毕业院校"
            value={formData.school}
            onInput={(e) => handleInputChange('school', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">所学专业</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入所学专业"
            value={formData.major}
            onInput={(e) => handleInputChange('major', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">学位证书编号</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入学位证书编号"
            value={formData.degreeCertNo}
            onInput={(e) => handleInputChange('degreeCertNo', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">毕业证书编号</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入毕业证书编号"
            value={formData.diplomaCertNo}
            onInput={(e) => handleInputChange('diplomaCertNo', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">学历证书照片</Text>
        <View className="flex flex-wrap gap-3">
          {formData.educationFiles.map((_, index) => (
            <View key={index} className="relative w-20 h-20">
              <View className="w-full h-full bg-gray-100 rounded-lg" />
              <View
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                onClick={() => handleRemoveFile('educationFiles', index)}
              >
                <Text className="text-white text-xs">×</Text>
              </View>
            </View>
          ))}
          <View
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
            onClick={() => handleUploadFile('educationFiles')}
          >
            <Upload size={24} color="#9ca3af" />
            <Text className="text-xs text-gray-400 mt-1">上传</Text>
          </View>
        </View>
        <Text className="block text-xs text-gray-400 mt-2">
          支持上传学历证书、学位证书照片
        </Text>
      </View>
    </View>
  )

  const renderQualificationForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">职业资格证书名称</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入职业资格证书名称"
            value={formData.qualification}
            onInput={(e) => handleInputChange('qualification', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">证书编号</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入证书编号"
            value={formData.certNumber}
            onInput={(e) => handleInputChange('certNumber', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">发证日期</Text>
        <Picker
          mode="date"
          value={formData.issueDate}
          onChange={(e) => handleInputChange('issueDate', e.detail.value)}
        >
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <Text className={formData.issueDate ? 'text-gray-900' : 'text-gray-400'}>
              {formData.issueDate || '请选择发证日期'}
            </Text>
            <ChevronRight size={18} color="#9ca3af" />
          </View>
        </Picker>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">证书照片</Text>
        <View className="flex flex-wrap gap-3">
          {formData.qualificationFiles.map((_, index) => (
            <View key={index} className="relative w-20 h-20">
              <View className="w-full h-full bg-gray-100 rounded-lg" />
              <View
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                onClick={() => handleRemoveFile('qualificationFiles', index)}
              >
                <Text className="text-white text-xs">×</Text>
              </View>
            </View>
          ))}
          <View
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
            onClick={() => handleUploadFile('qualificationFiles')}
          >
            <Upload size={24} color="#9ca3af" />
            <Text className="text-xs text-gray-400 mt-1">上传</Text>
          </View>
        </View>
        <Text className="block text-xs text-gray-400 mt-2">
          支持上传职业资格证书照片
        </Text>
      </View>
    </View>
  )

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 步骤指示器 */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex items-center justify-between">
          {steps.map((step, index) => (
            <View key={index} className="flex items-center">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                {index < currentStep ? (
                  <CircleCheck size={16} color="#ffffff" />
                ) : (
                  <step.icon size={16} color={index <= currentStep ? '#ffffff' : '#9ca3af'} />
                )}
              </View>
              <Text
                className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="p-4" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 表单内容 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center justify-between">
              <CardTitle>{steps[currentStep].title}</CardTitle>
              {!steps[currentStep].required && currentStep > 0 && (
                <Button size="sm" variant="outline" onClick={handleSkip}>
                  <Text className="text-sm text-gray-500">跳过</Text>
                </Button>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && renderIdentityForm()}
            {currentStep === 1 && renderEducationForm()}
            {currentStep === 2 && renderQualificationForm()}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <View className="flex items-start gap-2 px-2">
          <CircleAlert size={16} color="#f59e0b" className="mt-0.5" />
          <Text className="text-xs text-gray-500 flex-1">
            带 * 号的为必填项，其他信息可跳过。提交后平台将进行核查，核查通过后生成报告。
          </Text>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <View className="flex gap-3">
          {currentStep > 0 && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <Text className="text-gray-600">上一步</Text>
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button className="flex-1 bg-blue-600" onClick={handleNext}>
              <Text className="text-white">下一步</Text>
            </Button>
          ) : (
            <Button
              className="flex-1 bg-blue-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white">{loading ? '提交中...' : '提交报告'}</Text>
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

export default ReportFormPage
